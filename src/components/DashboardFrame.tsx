import { useState, useEffect, useRef, useContext } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZoomIn, ZoomOut } from 'lucide-react';
import BoundingBoxPanel from './BoundingBoxPanel';
import { OverpassService } from '../services/overpassService';
import { WorkspaceContext } from '../context/WorkspaceContext';

interface DashboardFrameProps {
  onQueryStateChange: (querying: boolean) => void;
  onQueryComplete: (stats: any, totalCount: number) => void;
}

export default function DashboardFrame({
  onQueryStateChange,
  onQueryComplete,
}: DashboardFrameProps) {
  const { mapParams, setMapParams, setOsmData } = useContext(WorkspaceContext);

  // Initialize coordinates states using cached parameters if they exist
  const [minLat, setMinLat] = useState<string>(() => mapParams?.minLat || '37.7800');
  const [minLng, setMinLng] = useState<string>(() => mapParams?.minLng || '-122.4150');
  const [maxLat, setMaxLat] = useState<string>(() => mapParams?.maxLat || '37.7950');
  const [maxLng, setMaxLng] = useState<string>(() => mapParams?.maxLng || '-122.3950');

  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [queryComplete, setQueryComplete] = useState<boolean>(false);
  const [totalElementsFound, setTotalElementsFound] = useState<number>(0);

  // Map references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const rectLayerRef = useRef<L.Rectangle | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Use cached lat/lng/zoom or defaults
    const initialLat = mapParams ? mapParams.lat : 37.7875;
    const initialLng = mapParams ? mapParams.lng : -122.4050;
    const initialZoom = mapParams ? mapParams.zoom : 14;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView([initialLat, initialLng], initialZoom);

    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Initial bbox rectangle drawing
    const initialBounds = L.latLngBounds(
      [parseFloat(minLat), parseFloat(minLng)],
      [parseFloat(maxLat), parseFloat(maxLng)]
    );

    rectLayerRef.current = L.rectangle(initialBounds, {
      color: '#2E4F3B',
      weight: 1.5,
      fillColor: '#2E4F3B',
      fillOpacity: 0.05,
      dashArray: '4, 4',
    }).addTo(map);

    // If there is cached map parameters and has active geometries, fit boundary
    if (mapParams) {
      const bounds = L.latLngBounds([parseFloat(minLat), parseFloat(minLng)], [parseFloat(maxLat), parseFloat(maxLng)]);
      map.fitBounds(bounds, { padding: [20, 20] });
    }

    // Event listener: Map view changes update coordinate inputs and cache context state
    map.on('moveend', () => {
      const currentBounds = map.getBounds();
      const center = currentBounds.getCenter();
      const currentZoom = map.getZoom();

      // Calculate new bounding box centered in the viewport
      const latDiff = currentBounds.getNorth() - currentBounds.getSouth();
      const lngDiff = currentBounds.getEast() - currentBounds.getWest();

      const s = center.lat - latDiff * 0.3;
      const w = center.lng - lngDiff * 0.3;
      const n = center.lat + latDiff * 0.3;
      const e = center.lng + lngDiff * 0.3;

      const minLatStr = s.toFixed(4);
      const minLngStr = w.toFixed(4);
      const maxLatStr = n.toFixed(4);
      const maxLngStr = e.toFixed(4);

      setMinLat(minLatStr);
      setMinLng(minLngStr);
      setMaxLat(maxLatStr);
      setMaxLng(maxLngStr);

      // Save parameters in global context
      setMapParams({
        lat: center.lat,
        lng: center.lng,
        zoom: currentZoom,
        minLat: minLatStr,
        minLng: minLngStr,
        maxLat: maxLatStr,
        maxLng: maxLngStr,
      });

      // Adjust rectangle layer coordinates
      const newBounds = L.latLngBounds([s, w], [n, e]);
      if (rectLayerRef.current) {
        rectLayerRef.current.setBounds(newBounds);
      }
    });

    // Clean up
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update bounds on input coordinate change
  const handleCoordsUpdate = () => {
    const s = parseFloat(minLat);
    const w = parseFloat(minLng);
    const n = parseFloat(maxLat);
    const e = parseFloat(maxLng);

    if (isNaN(s) || isNaN(w) || isNaN(n) || isNaN(e)) return;

    const bounds = L.latLngBounds([s, w], [n, e]);
    if (rectLayerRef.current) {
      rectLayerRef.current.setBounds(bounds);
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  };

  // Perform OSM query via Overpass API service
  const handleOSMQuery = async () => {
    const s = parseFloat(minLat);
    const w = parseFloat(minLng);
    const n = parseFloat(maxLat);
    const e = parseFloat(maxLng);

    if (isNaN(s) || isNaN(w) || isNaN(n) || isNaN(e)) return;

    setIsQuerying(true);
    onQueryStateChange(true);
    setQueryComplete(false);

    try {
      const response = await OverpassService.fetchOSMGeoJSON(s, w, n, e);
      setOsmData(response);
      setTotalElementsFound(response.geoJSON.features.length);
      onQueryComplete(response.densityData, response.geoJSON.features.length);

      if (mapInstanceRef.current) {
        // Clear previous layer
        if (geojsonLayerRef.current) {
          mapInstanceRef.current.removeLayer(geojsonLayerRef.current);
        }

        // Draw retrieved features on the map using muted aesthetics
        geojsonLayerRef.current = L.geoJSON(response.geoJSON as any, {
          style: (feature) => {
            if (feature?.properties?.leisure === 'park') {
              return { color: '#2E4F3B', weight: 1.5, fillColor: '#2E4F3B', fillOpacity: 0.15 };
            }
            if (feature?.properties?.cycleway || feature?.properties?.highway === 'cycleway') {
              return { color: '#B45309', weight: 2, opacity: 0.8 };
            }
            return { color: '#475569', weight: 1.2, opacity: 0.6 }; // default roadways/footpaths
          },
          pointToLayer: (feature, latlng) => {
            const amenity = feature?.properties?.amenity;
            const highway = feature?.properties?.highway;

            let color = '#475569';
            let radius = 3;

            if (highway === 'street_lamp') {
              color = '#D97706'; // Amber streetlight
              radius = 3.5;
            } else if (amenity === 'bench') {
              color = '#2E4F3B'; // Green bench
              radius = 4;
            } else if (amenity === 'waste_basket') {
              color = '#78716C'; // Grey waste basket
              radius = 3.5;
            } else if (amenity === 'bus_station' || highway === 'bus_stop') {
              color = '#1E293B'; // Dark slate transit
              radius = 5.5;
            }

            return L.circleMarker(latlng, {
              radius,
              fillColor: color,
              color: '#FFFFFF',
              weight: 1,
              opacity: 0.9,
              fillOpacity: 0.9,
            });
          },
        }).addTo(mapInstanceRef.current);

        const bounds = L.latLngBounds([s, w], [n, e]);
        mapInstanceRef.current.fitBounds(bounds);
      }
      setQueryComplete(true);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to connect to Overpass API. Bounding box coordinates may be too large.');
    } finally {
      setIsQuerying(false);
      onQueryStateChange(false);
    }
  };

  return (
    <section className="flex-1 relative h-[50%] lg:h-full bg-[#E2E8F0]">
      {/* Leaflet container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Zoom Interface */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="bg-white hover:bg-[#F8FAFC] border border-[#E5E2DC] shadow-editorial p-2.5 rounded text-[#1E293B] cursor-pointer transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="bg-white hover:bg-[#F8FAFC] border border-[#E5E2DC] shadow-editorial p-2.5 rounded text-[#1E293B] cursor-pointer transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
      </div>

      {/* Interactive bounds control overlay panel */}
      <BoundingBoxPanel
        minLat={minLat}
        minLng={minLng}
        maxLat={maxLat}
        maxLng={maxLng}
        setMinLat={setMinLat}
        setMinLng={setMinLng}
        setMaxLat={setMaxLat}
        setMaxLng={setMaxLng}
        onCoordsUpdate={handleCoordsUpdate}
        onOSMQuery={handleOSMQuery}
        isQuerying={isQuerying}
        queryComplete={queryComplete}
        totalElementsFound={totalElementsFound}
      />
    </section>
  );
}
