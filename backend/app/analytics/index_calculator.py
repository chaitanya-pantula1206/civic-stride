import math
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

def calculate_standardized_composite_index(
    sidewalk_meters: float,
    roadway_meters: float,
    transit_distance_meters: float | None,
    canopy_shade_meters: float,
    walkway_meters: float,
    bbox_area_km2: float = 1.0,
    intersection_count: int = 0,
    transit_node_count: int = 0,
    green_space_area_m2: float = 0.0,
    avg_node_degree: float = 3.0,
    distance_to_stops: List[float] = None
) -> Dict[str, Any]:
    """
    Computes an unbiased, standardized Composite Index using the Geometric Mean
    of three normalized sub-indices based on absolute physical baselines.
    
    1. Walkability & Connectivity Index (I_walk):
       - Sidewalk-to-road ratio: sidewalk_meters / roadway_meters (capped at 1.0)
       - Intersection density: intersection_count per km² (normalized to target 80.0 nodes/km²)
       - Node degree: avg_node_degree (normalized to target degree of 4.0)
       
    2. Transit Proximity & Accessibility Score (I_transit):
       - Distance to stop distribution: e^(-lambda * d) decay model
       - Transit node density: transit_node_count per km² (normalized to target 12.0 stops/km²)
       
    3. Green Canopy / Climate Comfort Index (I_climate):
       - Shaded route percentage: canopy_shade_meters / walkway_meters (capped at 1.0)
       - Green space area ratio: green_space_area_m2 relative to total bbox area (target 30% area)
       
    Composite Index (G) = (I_walk * I_transit * I_climate) ** (1/3)
    """
    # 1. Walkability & Connectivity Index
    if roadway_meters <= 0:
        ratio_sr = 0.0
    else:
        ratio_sr = min(1.0, sidewalk_meters / roadway_meters)
    
    # Normalized intersection density (target: 80 crossings/km²)
    target_int_density = 80.0
    actual_int_density = intersection_count / max(0.001, bbox_area_km2)
    norm_int_density = min(1.0, actual_int_density / target_int_density)
    
    # Normalized node degree (target: average degree 4.0)
    norm_node_degree = min(1.0, avg_node_degree / 4.0) if avg_node_degree > 0 else 0.0
    
    # Combined walkability score
    walk_idx = 0.4 * ratio_sr + 0.3 * norm_int_density + 0.3 * norm_node_degree

    # 2. Transit Proximity & Accessibility Index
    # Exponential decay based on nearest transit distance
    if transit_distance_meters is None or transit_distance_meters < 0:
        transit_dist_score = 0.0
    else:
        # e^(-lambda * 400) = 0.9 => lambda = 0.0002634
        decay_lambda = 0.0002634
        transit_dist_score = math.exp(-decay_lambda * transit_distance_meters)
        if transit_distance_meters > 1200.0:
            transit_dist_score = max(0.0, transit_dist_score * (1.0 - min(1.0, (transit_distance_meters - 1200.0) / 300.0)))
            
    # Normalized transit stop density (target: 12 stops/km²)
    target_transit_density = 12.0
    actual_transit_density = transit_node_count / max(0.001, bbox_area_km2)
    norm_transit_density = min(1.0, actual_transit_density / target_transit_density)
    
    transit_idx = 0.5 * transit_dist_score + 0.5 * norm_transit_density

    # 3. Green Canopy / Climate Comfort Index
    if walkway_meters <= 0:
        shade_ratio = 0.0
    else:
        shade_ratio = min(1.0, canopy_shade_meters / walkway_meters)
        
    # Green space area relative to bounding box area (target: 30% or 0.3 green cover)
    bbox_area_m2 = bbox_area_km2 * 1000000.0
    green_ratio = green_space_area_m2 / max(1.0, bbox_area_m2)
    norm_green_ratio = min(1.0, green_ratio / 0.3)
    
    climate_idx = 0.6 * shade_ratio + 0.4 * norm_green_ratio

    # 4. Standardized Composite Index (Geometric Mean)
    sub_product = walk_idx * transit_idx * climate_idx
    composite_score = math.pow(sub_product, 1.0 / 3.0) if sub_product > 0 else 0.0

    return {
        "composite_score": round(composite_score, 4),
        "infrastructure_index": round(walk_idx, 4),
        "transit_index": round(transit_idx, 4),
        "climate_index": round(climate_idx, 4),
        "metrics": {
            "sidewalk_meters": round(sidewalk_meters, 2),
            "roadway_meters": round(roadway_meters, 2),
            "transit_distance_meters": round(transit_distance_meters, 2) if transit_distance_meters is not None else None,
            "canopy_shade_meters": round(canopy_shade_meters, 2),
            "walkway_meters": round(walkway_meters, 2),
            "bbox_area_km2": round(bbox_area_km2, 4),
            "intersection_count": intersection_count,
            "transit_node_count": transit_node_count,
            "green_space_area_m2": round(green_space_area_m2, 2),
            "avg_node_degree": round(avg_node_degree, 2),
        }
    }

