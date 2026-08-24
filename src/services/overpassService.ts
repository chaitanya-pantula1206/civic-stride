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
   * Helper to split a bounding box into smaller sub-bboxes if it exceeds maxSize (e.g. 0.015 degrees ~ 1.5km)
   */
  public static splitBBox(
    south: number,
    west: number,
    north: number,
    east: number,
    maxSize: number = 0.015
  ): { south: number; west: number; north: number; east: number }[] {
    const latSpan = north - south;
    const lngSpan = east - west;

    const latSteps = Math.ceil(latSpan / maxSize);
    const lngSteps = Math.ceil(lngSpan / maxSize);

    if (latSteps <= 1 && lngSteps <= 1) {
      return [{ south, west, north, east }];
    }

    const bboxes: { south: number; west: number; north: number; east: number }[] = [];
    const latStepSize = latSpan / latSteps;
    const lngStepSize = lngSpan / lngSteps;

    for (let i = 0; i < latSteps; i++) {
      const s = south + i * latStepSize;
      const n = Math.min(north, s + latStepSize);
      for (let j = 0; j < lngSteps; j++) {
        const w = west + j * lngStepSize;
        const e = Math.min(east, w + lngStepSize);
        bboxes.push({ south: s, west: w, north: n, east: e });
      }
    }
    return bboxes;
  }

  /**
   * Generates the Upgraded Overpass QL query string for a bounding box
   */
  public static buildQuery(south: number, west: number, north: number, east: number): string {
    const bbox = `${south},${west},${north},${east}`;
    return `[out:json][timeout:30];
(
  // Primary walking and roadway structures
  way["highway"](${bbox});
  way["sidewalk"](${bbox});
  way["footway"](${bbox});
  
  // Public parks, grass, trees, and canopy alignments
  node["leisure"="park"](${bbox});
  way["leisure"="park"](${bbox});
  node["landuse"="grass"](${bbox});
  way["landuse"="grass"](${bbox});
  node["natural"~"tree|tree_row"](${bbox});
  way["natural"~"tree|tree_row"](${bbox});
  
  // Public transit nodes & platforms
  node["highway"="bus_stop"](${bbox});
  node["railway"~"station|subway_entrance"](${bbox});
  way["railway"~"station|subway_entrance"](${bbox});
  
  // Micro-amenities
  node["amenity"~"bus_station|waste_basket|bench"](${bbox});
  node["highway"="street_lamp"](${bbox});
);
out body geom;`;
  }

  /**
   * Fetches data from Overpass API and translates it into clean GeoJSON & density arrays
   * Supports timeout handling, query splitting for large bboxes, retries, and error fallbacks
   */
  public static async fetchOSMGeoJSON(
    south: number,
    west: number,
    north: number,
    east: number
  ): Promise<UpgradedOSMResponse> {
    const subBBoxes = this.splitBBox(south, west, north, east, 0.015);
    const allElements: any[] = [];

    for (const bbox of subBBoxes) {
      const query = this.buildQuery(bbox.south, bbox.west, bbox.north, bbox.east);
      let attempts = 3;
      let delay = 1000;
      let success = false;
      let lastError: any = null;

      while (attempts > 0 && !success) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

        try {
          const response = await fetch(this.OVERPASS_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `data=${encodeURIComponent(query)}`,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Overpass API responded with HTTP status ${response.status}`);
          }

          const data = await response.json();
          if (data && data.elements) {
            allElements.push(...data.elements);
          }
          success = true;
        } catch (error: any) {
          clearTimeout(timeoutId);
          lastError = error;
          attempts--;
          console.warn(`Overpass fetch attempt failed (remaining attempts: ${attempts}):`, error.message || error);
          if (attempts > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
          }
        }
      }

      if (!success) {
        console.error('All retries failed for Overpass sub-bbox. Running fallback strategy.', lastError);
        // Fallback: Fetch a highly simplified query (only footways and transit) to avoid total blank page
        try {
          const fallbackQuery = `[out:json][timeout:15];(way["highway"~"footway|pedestrian"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});node["highway"="bus_stop"](${bbox.south},${bbox.west},${bbox.north},${bbox.east}););out body geom;`;
          const response = await fetch(this.OVERPASS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(fallbackQuery)}`,
          });
          if (response.ok) {
            const data = await response.json();
            if (data && data.elements) {
              allElements.push(...data.elements);
            }
          }
        } catch (fallbackErr) {
          console.error('Fallback Overpass query failed:', fallbackErr);
        }
      }
    }

    // Deduplicate elements by ID
    const uniqueElementsMap = new Map<number, any>();
    for (const el of allElements) {
      if (el.id !== undefined) {
        uniqueElementsMap.set(el.id, el);
      }
    }

    const deduplicatedRawData = {
      elements: Array.from(uniqueElementsMap.values()),
    };

    return this.parseToGeoJSONAndStats(deduplicatedRawData);
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
        const isClosed = coordinates[0][0] === coordinates[coordinates.length - 1][0] && 
                         coordinates[0][1] === coordinates[coordinates.length - 1][1];
        
        const isGreen = tags.leisure === 'park' || tags.landuse === 'grass' || tags.natural === 'tree' || tags.natural === 'tree_row';
        
        if (isClosed && (isGreen || tags.area === 'yes')) {
          geomType = 'Polygon';
        }

        if (isGreen) {
          parksCount++;
        }

        const isPedestrian = tags.highway === 'footway' || tags.highway === 'pedestrian' || tags.highway === 'path' || tags.sidewalk !== undefined || tags.footway === 'sidewalk';
        if (isPedestrian) {
          sidewalksCount++;
        }

        // Add transit lines or structures first coordinate
        const isTransit = tags.amenity === 'bus_station' || tags.highway === 'bus_stop' || tags.railway === 'station' || tags.railway === 'subway_entrance';
        if (isTransit && coordinates.length > 0) {
          busStations.push(coordinates[0]);
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
        } else if (tags.amenity === 'bus_station' || tags.highway === 'bus_stop' || tags.railway === 'station' || tags.railway === 'subway_entrance') {
          busStations.push(coords);
        }

        const isGreen = tags.leisure === 'park' || tags.landuse === 'grass' || tags.natural === 'tree' || tags.natural === 'tree_row';
        if (isGreen) {
          parksCount++;
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

