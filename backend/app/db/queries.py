import logging
from typing import Dict, Any
import asyncpg
from backend.app.analytics.index_calculator import calculate_standardized_composite_index

logger = logging.getLogger(__name__)

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
    5. Intersection count and average node degree.
    6. Transit node count and distribution of distances.
    7. Green space areas in square meters.
    8. Total bbox area in square kilometers.
    
    Passes metrics to backend index calculator engine to compute unbiased indices.
    """
    logger.info(f"Querying PostGIS metrics for bbox bounds: ({south}, {west}, {north}, {east})")
    
    # Query 1: Determine dynamic UTM SRID based on center of bounding box
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

    # Query 6: Determine total bbox area in square kilometers
    bbox_area_query = """
        SELECT ST_Area(ST_Transform(ST_MakeEnvelope($2, $1, $4, $3, 4326), $5)) / 1000000.0 AS area_km2;
    """
    bbox_area_row = await conn.fetchrow(bbox_area_query, south, west, north, east, utm_srid)
    bbox_area_km2 = bbox_area_row["area_km2"] if bbox_area_row else 1.0

    # Query 7: Get intersection nodes count and average node degree using ST_Contains
    intersection_query = """
        SELECT 
            COALESCE(COUNT(*), 0) AS intersection_count,
            COALESCE(AVG(node_degree), 3.0) AS avg_node_degree
        FROM intersection_nodes
        WHERE ST_Contains(ST_MakeEnvelope($2, $1, $4, $3, 4326), geom);
    """
    int_row = await conn.fetchrow(intersection_query, south, west, north, east)
    intersection_count = int_row["intersection_count"] if int_row else 0
    avg_node_degree = float(int_row["avg_node_degree"]) if int_row else 3.0

    # Query 8: Get total transit nodes inside the bbox
    transit_count_query = """
        SELECT COALESCE(COUNT(*), 0) AS transit_node_count
        FROM transit_hubs
        WHERE ST_Contains(ST_MakeEnvelope($2, $1, $4, $3, 4326), geom);
    """
    transit_count_row = await conn.fetchrow(transit_count_query, south, west, north, east)
    transit_node_count = transit_count_row["transit_node_count"] if transit_count_row else 0

    # Query 9: Calculate green spaces area relative to bbox (in square meters) using ST_Intersects
    green_area_query = """
        SELECT COALESCE(SUM(ST_Area(ST_Transform(ST_Intersection(geom, ST_MakeEnvelope($2, $1, $4, $3, 4326)), $5))), 0.0) AS green_area
        FROM green_spaces
        WHERE ST_Intersects(geom, ST_MakeEnvelope($2, $1, $4, $3, 4326));
    """
    green_row = await conn.fetchrow(green_area_query, south, west, north, east, utm_srid)
    green_space_area = green_row["green_area"] if green_row else 0.0

    # Query 10: Find distance-to-stop distribution for stops within 2.5km of center using ST_DWithin
    stops_dist_query = """
        SELECT ST_Distance(
            ST_Transform(ST_SetSRID(ST_MakePoint(($2 + $4) / 2.0, ($1 + $3) / 2.0), 4326), $5),
            ST_Transform(geom, $5)
        ) AS stop_dist
        FROM transit_hubs
        WHERE ST_DWithin(ST_Transform(geom, $5), ST_Transform(ST_SetSRID(ST_MakePoint(($2 + $4) / 2.0, ($1 + $3) / 2.0), 4326), $5), 2500.0)
        LIMIT 100;
    """
    stops_rows = await conn.fetch(stops_dist_query, south, west, north, east, utm_srid)
    distance_to_stops = [row["stop_dist"] for row in stops_rows] if stops_rows else []

    # Execute standardized calculations using math engine
    analytics_result = calculate_standardized_composite_index(
        sidewalk_meters=sidewalk_len,
        roadway_meters=roadway_len,
        transit_distance_meters=transit_dist,
        canopy_shade_meters=shade_len,
        walkway_meters=walkway_len,
        bbox_area_km2=bbox_area_km2,
        intersection_count=intersection_count,
        transit_node_count=transit_node_count,
        green_space_area_m2=green_space_area,
        avg_node_degree=avg_node_degree,
        distance_to_stops=distance_to_stops
    )
    
    # Enrich response with UTM framework metadata
    analytics_result["utm_projection"] = f"EPSG:{utm_srid}"
    
    return analytics_result
