import math
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

def calculate_standardized_composite_index(
    sidewalk_meters: float,
    roadway_meters: float,
    transit_distance_meters: float | None,
    canopy_shade_meters: float,
    walkway_meters: float
) -> Dict[str, Any]:
    """
    Computes an unbiased, standardized Composite Index using the Geometric Mean
    of three normalized sub-indices based on absolute physical baselines.
    
    1. Infrastructure Index (I_infra):
       Ratio of continuous pedestrian sidewalk meters to total motorized roadway meters.
       Baseline: 1:1 ratio = 1.0 (capped at 1.0).
       
    2. Transit Proximity Index (I_transit):
       Exponential decay based on absolute walking distance (d) to the nearest mass transit node.
       I = e^(-lambda * d), where lambda is calibrated so that a 400m walk yields 0.9.
       If distance > 1200m, decays toward 0.0. If transit is missing, I = 0.0.
       
    3. Micro-Climate Comfort Index (I_climate):
       Normalized percentage of continuous canopy shade overlay relative to total pedestrian walkway area.
       Capped at 1.0.
       
    Composite Index (G) = (I_infra * I_transit * I_climate) ** (1/3)
    """
    # 1. Infrastructure Index Calculation
    if roadway_meters <= 0:
        infra_idx = 0.0
    else:
        # Ratio of sidewalk to road, capped at 1.0 (perfect 1:1 baseline)
        infra_idx = min(1.0, sidewalk_meters / roadway_meters)

    # 2. Transit Proximity Index Calculation
    if transit_distance_meters is None or transit_distance_meters < 0:
        transit_idx = 0.0
    else:
        # Calibrate lambda: e^(-lambda * 400) = 0.9 => lambda = -ln(0.9) / 400 = 0.0002634
        decay_lambda = 0.0002634
        transit_idx = math.exp(-decay_lambda * transit_distance_meters)
        
        # Enforce decay toward 0.0 for distances exceeding 1200m
        if transit_distance_meters > 1200.0:
            # Smoothly transition or cap to ensure it decays to 0
            transit_idx = max(0.0, transit_idx * (1.0 - min(1.0, (transit_distance_meters - 1200.0) / 300.0)))

    # 3. Micro-Climate Comfort Index Calculation
    if walkway_meters <= 0:
        climate_idx = 0.0
    else:
        climate_idx = min(1.0, canopy_shade_meters / walkway_meters)

    # 4. Standardized Composite Index (Geometric Mean)
    # G = (I_infra * I_transit * I_climate) ** (1/3)
    sub_product = infra_idx * transit_idx * climate_idx
    composite_score = math.pow(sub_product, 1.0 / 3.0) if sub_product > 0 else 0.0

    return {
        "composite_score": round(composite_score, 4),
        "infrastructure_index": round(infra_idx, 4),
        "transit_index": round(transit_idx, 4),
        "climate_index": round(climate_idx, 4),
        "metrics": {
            "sidewalk_meters": round(sidewalk_meters, 2),
            "roadway_meters": round(roadway_meters, 2),
            "transit_distance_meters": round(transit_distance_meters, 2) if transit_distance_meters is not None else None,
            "canopy_shade_meters": round(canopy_shade_meters, 2),
            "walkway_meters": round(walkway_meters, 2),
        }
    }
