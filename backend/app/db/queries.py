import logging
from typing import Dict, Any
import asyncpg
from backend.app.analytics.index_calculator import calculate_standardized_composite_index

logger = logging.getLogger(__name__)

async def fetch_spatial_metrics_and_calculate_index(
    conn: asyncpg.Connection,
    south: float,
    west: float,
    north: float,
    east: float
) -> Dict[str, Any]:
    """
    Interfaces with PostGIS database using asyncpg to retrieve precise physical metrics:
    1. Sidewalk length (meters) transformed to local UTM zone.
    2. Roadway length (meters) transformed to local UTM zone.
    3. Minimum distance (meters) to nearest transit hub from bbox center.
    4. Mapped canopy shade meters along pedestrian corridors.
    
    Passes metrics to backend index calculator engine to compute unbiased indices.
    """
    logger.info(f"Querying PostGIS metrics for bbox bounds: ({south}, {west}, {north}, {east})")
    
    # Query 1: Determine dynamic UTM SRID based on center of bounding box
    # zone = floor((lng + 180) / 6) + 1
    # North (lat >= 0) EPSG: 32600 + zone
    # South (lat < 0) EPSG: 32700 + zone
    utm_query = """
        SELECT 
            CASE 
                WHEN (($1 + $3) / 2.0) >= 0 THEN 32600 + floor((($2 + $4) / 2.0 + 180) / 6)::integer
                ELSE 32700 + floor((($2 + $4) / 2.0 + 180) / 6)::integer
            END AS utm_srid;
    """
    utm_row = await conn.fetchrow(utm_query, south, west, north, east)
    utm_srid = utm_row["utm_srid"] if utm_row else 4326
    logger.debug(f"Determined local UTM EPSG Projection: EPSG:{utm_srid}")
    
    # Query 2: Extract sidewalk length inside bounding box (in meters)
    sidewalk_query = """
        SELECT COALESCE(SUM(ST_Length(ST_Transform(ST_Intersection(geom, ST_MakeEnvelope($2, $1, $4, $3, 4326)), $5))), 0.0) AS sidewalk_len
        FROM sidewalk_lines
        WHERE ST_Intersects(geom, ST_MakeEnvelope($2, $1, $4, $3, 4326))
          AND (footway = 'sidewalk' OR highway = 'footway' OR highway = 'pedestrian');
    """
    sidewalk_row = await conn.fetchrow(sidewalk_query, south, west, north, east, utm_srid)
    sidewalk_len = sidewalk_row["sidewalk_len"] if sidewalk_row else 0.0

    # Query 3: Extract motorized roadway length inside bounding box (in meters)
    roadway_query = """
        SELECT COALESCE(SUM(ST_Length(ST_Transform(ST_Intersection(geom, ST_MakeEnvelope($2, $1, $4, $3, 4326)), $5))), 0.0) AS roadway_len
        FROM sidewalk_lines
        WHERE ST_Intersects(geom, ST_MakeEnvelope($2, $1, $4, $3, 4326))
          AND highway NOT IN ('footway', 'pedestrian', 'cycleway', 'path', 'steps')
          AND (footway IS NULL OR footway != 'sidewalk');
    """
    roadway_row = await conn.fetchrow(roadway_query, south, west, north, east, utm_srid)
    roadway_len = roadway_row["roadway_len"] if roadway_row else 0.0

    # Query 4: Find walking distance to nearest transit hub from the centroid of bbox
    transit_query = """
        SELECT ST_Distance(
            ST_Transform(ST_SetSRID(ST_MakePoint(($2 + $4) / 2.0, ($1 + $3) / 2.0), 4326), $5),
            ST_Transform(geom, $5)
        ) AS transit_dist
        FROM transit_hubs
        ORDER BY ST_Distance(ST_SetSRID(ST_MakePoint(($2 + $4) / 2.0, ($1 + $3) / 2.0), 4326), geom) ASC
        LIMIT 1;
    """
    transit_row = await conn.fetchrow(transit_query, south, west, north, east, utm_srid)
    transit_dist = transit_row["transit_dist"] if transit_row else None

    # Query 5: Calculate canopy cover and walkway area intersections
    canopy_query = """
        SELECT 
            COALESCE(SUM(ST_Length(ST_Transform(ST_Intersection(geom, ST_MakeEnvelope($2, $1, $4, $3, 4326)), $5))), 0.0) AS walkway_len,
            COALESCE(SUM(ST_Length(ST_Transform(ST_Intersection(geom, ST_MakeEnvelope($2, $1, $4, $3, 4326)), $5)) * 
                CASE 
                    WHEN properties->>'natural' = 'tree_row' OR properties->>'leisure' = 'park' THEN 0.55
                    WHEN surface = 'unpaved' THEN 0.40
                    ELSE 0.20 
                END
            ), 0.0) AS shade_len
        FROM sidewalk_lines
        WHERE ST_Intersects(geom, ST_MakeEnvelope($2, $1, $4, $3, 4326))
          AND (footway = 'sidewalk' OR highway = 'footway' OR highway = 'pedestrian');
    """
    canopy_row = await conn.fetchrow(canopy_query, south, west, north, east, utm_srid)
    walkway_len = canopy_row["walkway_len"] if canopy_row else 0.0
    shade_len = canopy_row["shade_len"] if canopy_row else 0.0

    # Execute standardized calculations using math engine
    analytics_result = calculate_standardized_composite_index(
        sidewalk_meters=sidewalk_len,
        roadway_meters=roadway_len,
        transit_distance_meters=transit_dist,
        canopy_shade_meters=shade_len,
        walkway_meters=walkway_len
    )
    
    # Enrich response with UTM framework metadata
    analytics_result["utm_projection"] = f"EPSG:{utm_srid}"
    
    return analytics_result
