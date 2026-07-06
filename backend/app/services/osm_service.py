import logging
from typing import Dict, Any, List
import httpx
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class OSMDataIngestionService:
    """
    Asynchronous service to query the OpenStreetMap Overpass API and
    retrieve walking paths, sidewalks, cycleways, intersection nodes,
    and transit hubs within a specified bounding box.
    """
    
    def __init__(self, overpass_url: str = "https://overpass-api.de/api/interpreter"):
        self.overpass_url = overpass_url
        self.client_timeout = 35.0  # Slightly larger than Overpass timeout to allow clean network window

    def _build_overpass_query(self, south: float, west: float, north: float, east: float) -> str:
        """
        Builds the Overpass QL query string for a bounding box (south, west, north, east).
        Retrieves ways related to pedestrian/cycle transport and nodes representing
        intersections or transit hubs.
        Optimized to include maxsize, timeout, and targeted extraction limits.
        """
        bbox = f"{south},{west},{north},{east}"
        
        # Build the Overpass QL query with timeout 30s, maxsize 20MB, and limit response elements to 3000
        query = f"""
        [out:json][timeout:30][maxsize:20971520];
        (
          // Pedestrian walkways, sidewalks, and cycling ways
          way["highway"="footway"]({bbox});
          way["footway"="sidewalk"]({bbox});
          way["cycleway"]({bbox});
          way["highway"="cycleway"]({bbox});
          way["highway"="pedestrian"]({bbox});
          way["highway"="living_street"]({bbox});
          
          // Intersection nodes
          node["highway"="crossing"]({bbox});
          node["highway"="traffic_signals"]({bbox});
          node["highway"="mini_roundabout"]({bbox});
          
          // Transit hubs
          node["highway"="bus_stop"]({bbox});
          node["railway"="station"]({bbox});
          node["amenity"="bus_station"]({bbox});
          node["public_transport"="platform"]({bbox});
          node["public_transport"="station"]({bbox});
        );
        out body geom 3000;
        """
        return query

    async def fetch_osm_data(self, south: float, west: float, north: float, east: float) -> Dict[str, Any]:
        """
        Queries the Overpass API for the bounding box and returns the raw JSON response.
        Handles HTTP status and request exceptions cleanly by raising structured FastAPI HTTPExceptions.
        """
        query = self._build_overpass_query(south, west, north, east)
        
        async with httpx.AsyncClient(timeout=self.client_timeout) as client:
            try:
                logger.info(f"Querying Overpass API for bbox: ({south}, {west}, {north}, {east})")
                response = await client.post(self.overpass_url, data={"data": query})
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"Overpass API HTTP error: {e.response.status_code} - {e.response.text}")
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail={
                        "error": "OverpassAPIError",
                        "status_code": e.response.status_code,
                        "message": f"Overpass API service returned status code {e.response.status_code}.",
                        "details": e.response.text
                    }
                ) from e
            except httpx.RequestError as e:
                logger.error(f"Failed to connect to Overpass API: {e}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "error": "OverpassConnectionError",
                        "message": "Failed to connect to the Overpass API server. Bounding box coordinates may be too dense or invalid.",
                        "details": str(e)
                    }
                ) from e

    def parse_to_geojson(self, raw_data: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
        """
        Parses raw Overpass JSON response into structured GeoJSON FeatureCollections:
        1. sidewalk_lines (LineString geometries for paths, sidewalks, cycleways)
        2. transit_hubs (Point geometries for bus stops, train stations, transit terminals)
        3. intersection_nodes (Point geometries for pedestrian crossings, signals, roundabouts)
        """
        elements = raw_data.get("elements", [])
        
        sidewalk_features: List[Dict[str, Any]] = []
        transit_features: List[Dict[str, Any]] = []
        intersection_features: List[Dict[str, Any]] = []
        
        for element in elements:
            el_type = element.get("type")
            el_id = element.get("id")
            tags = element.get("tags", {})
            
            # 1. Parse Ways (LineStrings)
            if el_type == "way":
                geometry = element.get("geometry", [])
                if not geometry:
                    continue
                
                # Convert Overpass geometry [{lat: ..., lon: ...}] to GeoJSON coordinates [[lon, lat], ...]
                coordinates = [[pt["lon"], pt["lat"]] for pt in geometry]
                
                # Verify we have enough points for a LineString
                if len(coordinates) < 2:
                    continue
                
                feature = {
                    "type": "Feature",
                    "id": el_id,
                    "geometry": {
                        "type": "LineString",
                        "coordinates": coordinates
                    },
                    "properties": {
                        "osm_id": el_id,
                        "highway": tags.get("highway"),
                        "footway": tags.get("footway"),
                        "cycleway": tags.get("cycleway"),
                        "surface": tags.get("surface"),
                        "width": tags.get("width"),
                        "name": tags.get("name"),
                        "lit": tags.get("lit")
                    }
                }
                sidewalk_features.append(feature)
                
            # 2. Parse Nodes (Points)
            elif el_type == "node":
                lat = element.get("lat")
                lon = element.get("lon")
                if lat is None or lon is None:
                    continue
                
                # Determine transit hub vs intersection node
                is_transit = any(
                    tag_key in tags for tag_key in ["public_transport", "railway"]
                ) or tags.get("highway") == "bus_stop" or tags.get("amenity") == "bus_station"
                
                feature = {
                    "type": "Feature",
                    "id": el_id,
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lon, lat]
                    },
                    "properties": {
                        "osm_id": el_id,
                        "name": tags.get("name"),
                        **tags
                    }
                }
                
                if is_transit:
                    feature["properties"]["transit_type"] = (
                        tags.get("railway") or 
                        tags.get("public_transport") or 
                        tags.get("highway") or 
                        tags.get("amenity")
                    )
                    transit_features.append(feature)
                else:
                    feature["properties"]["intersection_type"] = tags.get("highway")
                    intersection_features.append(feature)
 
        return {
            "sidewalk_lines": {
                "type": "FeatureCollection",
                "features": sidewalk_features
            },
            "transit_hubs": {
                "type": "FeatureCollection",
                "features": transit_features
            },
            "intersection_nodes": {
                "type": "FeatureCollection",
                "features": intersection_features
            }
        }

    async def ingest_bbox(self, south: float, west: float, north: float, east: float) -> Dict[str, Dict[str, Any]]:
        """
        Runs the complete async ingestion pipeline:
        1. Fetch data from Overpass API
        2. Parse OSM elements into structured GeoJSON FeatureCollections
        """
        raw_data = await self.fetch_osm_data(south, west, north, east)
        return self.parse_to_geojson(raw_data)
