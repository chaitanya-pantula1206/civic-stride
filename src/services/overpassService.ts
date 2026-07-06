/**
 * Upgraded Service to interface with the public OpenStreetMap Overpass API
 * to fetch pedestrian walkways, green zones, and micro-amenities.
 */
export interface OSMFeatureProperties {
  osm_id: number;
  highway?: string;
  footway?: string;
  cycleway?: string;
  surface?: string;
  smoothness?: string;
  width?: string;
  name?: string;
  lit?: string;
  amenity?: string;
  leisure?: string;
  natural?: string;
  [key: string]: any;
}

export interface OSMGeoJSONFeature {
  type: 'Feature';
  id: number;
  geometry: {
    type: 'LineString' | 'Point' | 'Polygon';
    coordinates: any;
  };
  properties: OSMFeatureProperties;
}

export interface OSMGeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: OSMGeoJSONFeature[];
}

export interface IngestedDensityArrays {
  benches: [number, number][];
  streetLamps: [number, number][];
  wasteBaskets: [number, number][];
  busStations: [number, number][];
  parksCount: number;
  sidewalksCount: number;
}

export interface UpgradedOSMResponse {
  geoJSON: OSMGeoJSONFeatureCollection;
  densityData: IngestedDensityArrays;
}

export class OverpassService {
  private static OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

  /**
   * Generates the Upgraded Overpass QL query string for a bounding box
   */
  public static buildQuery(south: number, west: number, north: number, east: number): string {
    const bbox = `${south},${west},${north},${east}`;
    return `[out:json][timeout:45];
(
  // Primary walking and roadway structures
  way["highway"](${bbox});
  way["cycleway"](${bbox});
  way["footway"](${bbox});
  
  // Public parks and tree alignments
  way["leisure"="park"](${bbox});
  way["natural"="tree_row"](${bbox});
  
  // Micro-amenities & transport feasibility nodes
  node["amenity"~"bus_station|waste_basket|bench"](${bbox});
  node["highway"="street_lamp"](${bbox});
  node["railway"="subway_entrance"](${bbox});
  node["highway"="bus_stop"](${bbox});
);
out body geom;`;
  }

  /**
   * Fetches data from Overpass API and translates it into clean GeoJSON & density arrays
   */
  public static async fetchOSMGeoJSON(
    south: number,
    west: number,
    north: number,
    east: number
  ): Promise<UpgradedOSMResponse> {
    const query = this.buildQuery(south, west, north, east);
    
    try {
      const response = await fetch(this.OVERPASS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        throw new Error(`Overpass API responded with HTTP status ${response.status}`);
      }

      const data = await response.json();
      return this.parseToGeoJSONAndStats(data);
    } catch (error) {
      console.error('Error fetching data from Overpass:', error);
      throw error;
    }
  }

  /**
   * Internal parser converting Overpass JSON response with geometries into standard GeoJSON and statistics
   */
  private static parseToGeoJSONAndStats(rawData: any): UpgradedOSMResponse {
    const elements = rawData.elements || [];
    const features: OSMGeoJSONFeature[] = [];
    
    // Quantitative density tracking arrays
    const benches: [number, number][] = [];
    const streetLamps: [number, number][] = [];
    const wasteBaskets: [number, number][] = [];
    const busStations: [number, number][] = [];
    let parksCount = 0;
    let sidewalksCount = 0;

    for (const el of elements) {
      const id = el.id;
      const type = el.type;
      const tags = el.tags || {};

      if (type === 'way' && el.geometry && el.geometry.length >= 2) {
        const coordinates = el.geometry.map((pt: any) => [pt.lon, pt.lat]);
        
        let geomType: 'LineString' | 'Polygon' = 'LineString';
        
        // If it starts and ends at the same point and is tagged as a park, represent as Polygon
        if (tags.leisure === 'park' && 
            coordinates[0][0] === coordinates[coordinates.length - 1][0] && 
            coordinates[0][1] === coordinates[coordinates.length - 1][1]) {
          geomType = 'Polygon';
          parksCount++;
        }

        if (tags.highway === 'footway' || tags.footway === 'sidewalk') {
          sidewalksCount++;
        }

        features.push({
          type: 'Feature',
          id: id,
          geometry: {
            type: geomType,
            coordinates: geomType === 'Polygon' ? [coordinates] : coordinates,
          },
          properties: {
            osm_id: id,
            highway: tags.highway,
            footway: tags.footway,
            cycleway: tags.cycleway,
            surface: tags.surface,
            smoothness: tags.smoothness,
            width: tags.width,
            name: tags.name,
            lit: tags.lit,
            leisure: tags.leisure,
            natural: tags.natural,
            ...tags
          },
        });
      } else if (type === 'node' && el.lat !== undefined && el.lon !== undefined) {
        const lon = el.lon;
        const lat = el.lat;
        const coords: [number, number] = [lon, lat];

        // Route into density lists based on tags
        if (tags.amenity === 'bench') {
          benches.push(coords);
        } else if (tags.highway === 'street_lamp') {
          streetLamps.push(coords);
        } else if (tags.amenity === 'waste_basket') {
          wasteBaskets.push(coords);
        } else if (tags.amenity === 'bus_station' || tags.highway === 'bus_stop' || tags.railway === 'subway_entrance') {
          busStations.push(coords);
        }

        features.push({
          type: 'Feature',
          id: id,
          geometry: {
            type: 'Point',
            coordinates: coords,
          },
          properties: {
            osm_id: id,
            name: tags.name,
            highway: tags.highway,
            amenity: tags.amenity,
            ...tags
          },
        });
      }
    }

    const geoJSON: OSMGeoJSONFeatureCollection = {
      type: 'FeatureCollection',
      features: features,
    };

    const densityData: IngestedDensityArrays = {
      benches,
      streetLamps,
      wasteBaskets,
      busStations,
      parksCount,
      sidewalksCount,
    };

    return {
      geoJSON,
      densityData,
    };
  }
}
