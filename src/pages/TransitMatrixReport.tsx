import { useState, useEffect, useContext } from 'react';
import { NavigationContext } from '../App';
import * as turf from '@turf/turf';
import DiagnosticReportLayout from '../components/DiagnosticReportLayout';
import { ArrowRight } from 'lucide-react';

interface Station {
  id: string;
  name: string;
  coords: [number, number]; // [lng, lat]
  type: 'subway' | 'bus' | 'rail';
}

interface Centroid {
  id: string;
  name: string;
  coords: [number, number]; // [lng, lat]
  population: number;
}

export default function TransitMatrixReport() {
  const { navigate } = useContext(NavigationContext);

  // Mock Transit Stations
  const stations: Station[] = [
    { id: 'st-1', name: 'Montgomery St Station', coords: [-122.4014, 37.7894], type: 'subway' },
    { id: 'st-2', name: 'Powell St Transit Center', coords: [-122.4079, 37.7844], type: 'subway' },
    { id: 'st-3', name: 'Embarcadero Station Hub', coords: [-122.3972, 37.7929], type: 'rail' },
    { id: 'st-4', name: 'Transbay Terminal Bus Stop', coords: [-122.3969, 37.7897], type: 'bus' },
  ];

  // Mock Urban Residential Centroids
  const centroids: Centroid[] = [
    { id: 'c-1', name: 'Financial District North Centroid', coords: [-122.4005, 37.7942], population: 1200 },
    { id: 'c-2', name: 'Chinatown South Block', coords: [-122.4061, 37.7925], population: 2400 },
    { id: 'c-3', name: 'SOMA West Residential Hub', coords: [-122.4124, 37.7801], population: 1850 },
    { id: 'c-4', name: 'South Beach Waterfront Blocks', coords: [-122.3905, 37.7865], population: 1500 },
    { id: 'c-5', name: 'Union Square Retail/Residential', coords: [-122.4082, 37.7881], population: 950 },
  ];

  const [buffersData, setBuffersData] = useState<any[]>([]);
  const [walkabilityResults, setWalkabilityResults] = useState<any[]>([]);
  const [coverageStats, setCoverageStats] = useState({
    totalPopulation: 0,
    covered400m: 0,
    covered800m: 0,
    notCovered: 0,
  });

  useEffect(() => {
    const computedBuffers: any[] = [];
    const walkResults: any[] = [];
    let popTotal = 0;
    let pop400 = 0;
    let pop800 = 0;

    stations.forEach(station => {
      const stationPoint = turf.point(station.coords);
      const buffer400 = turf.buffer(stationPoint, 0.4, { units: 'kilometers' });
      const buffer800 = turf.buffer(stationPoint, 0.8, { units: 'kilometers' });

      if (buffer400 && buffer800) {
        const area400 = turf.area(buffer400);
        const area800 = turf.area(buffer800);

        computedBuffers.push({
          stationId: station.id,
          stationName: station.name,
          area400: Math.round(area400),
          area800: Math.round(area800),
          geometry400: buffer400.geometry,
          geometry800: buffer800.geometry,
        });
      }
    });

    centroids.forEach(centroid => {
      const centroidPoint = turf.point(centroid.coords);
      popTotal += centroid.population;
      
      let inside400 = false;
      let inside800 = false;
      let closestStationName = '';
      let minDistance = Infinity;

      stations.forEach(station => {
        const stationPoint = turf.point(station.coords);
        const distanceKm = turf.distance(centroidPoint, stationPoint, { units: 'kilometers' });
        const distanceM = distanceKm * 1000;

        if (distanceM < minDistance) {
          minDistance = distanceM;
          closestStationName = station.name;
        }

        if (distanceM <= 400) {
          inside400 = true;
          inside800 = true;
        } else if (distanceM <= 800) {
          inside800 = true;
        }
      });

      if (inside400) {
        pop400 += centroid.population;
        pop800 += centroid.population;
      } else if (inside800) {
        pop800 += centroid.population;
      }

      walkResults.push({
        centroidId: centroid.id,
        centroidName: centroid.name,
        population: centroid.population,
        closestStation: closestStationName,
        distance: Math.round(minDistance),
        accessLevel: inside400 ? 'High (≤400m)' : inside800 ? 'Moderate (≤800m)' : 'Low (>800m)',
        accessColor: inside400 ? 'text-[#2E4F3B]' : inside800 ? 'text-[#B45309]' : 'text-red-700',
        score: inside400 ? 100 : inside800 ? 65 : 20,
      });
    });

    setBuffersData(computedBuffers);
    setWalkabilityResults(walkResults);
    setCoverageStats({
      totalPopulation: popTotal,
      covered400m: pop400,
      covered800m: pop800,
      notCovered: popTotal - pop800,
    });
  }, []);

  const pct400 = coverageStats.totalPopulation > 0 
    ? Math.round((coverageStats.covered400m / coverageStats.totalPopulation) * 100)
    : 0;

  const pct800 = coverageStats.totalPopulation > 0
    ? Math.round((coverageStats.covered800m / coverageStats.totalPopulation) * 100)
    : 0;

  return (
    <DiagnosticReportLayout
      title="Transit Proximity & Isochrone Matrix"
      description="Targeting UN SDG Indicator 11.2.1. This diagnostic report evaluates pedestrian walkability access buffers to high-frequency public transportation nodes. By generating 400m (5-minute) and 800m (10-minute) isochrone areas using Turf.js, we identify transit gaps across residential centroids."
      indexName="Index 2 Deep-Dive"
    >
      {/* Coverage Indicator Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded border border-[#E5E2DC] shadow-sm space-y-2">
          <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">5-Min Walking Proximity (400m)</span>
          <div className="text-3xl font-serif font-bold text-[#1E293B]">{pct400}%</div>
          <p className="text-xs text-[#64748B]">Percentage of tracked district population residing within 400 meters of a rapid transit platform.</p>
        </div>

        <div className="bg-white p-6 rounded border border-[#E5E2DC] shadow-sm space-y-2">
          <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">10-Min Walking Proximity (800m)</span>
          <div className="text-3xl font-serif font-bold text-[#1E293B]">{pct800}%</div>
          <p className="text-xs text-[#64748B]">Percentage of population with acceptable walking access (800m) to major hubs.</p>
        </div>

        <div className="bg-white p-6 rounded border border-[#E5E2DC] shadow-sm space-y-2">
          <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">Low Access Transit Gaps</span>
          <div className="text-3xl font-serif font-bold text-red-700">
            {coverageStats.totalPopulation > 0 
              ? Math.round((coverageStats.notCovered / coverageStats.totalPopulation) * 100) 
              : 0}%
          </div>
          <p className="text-xs text-[#64748B]">Residents completely isolated from local high-frequency transit segments.</p>
        </div>
      </section>

      {/* Isochrone Geometry Buffers List */}
      <section className="bg-white rounded border border-[#E5E2DC] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#F5F5F0]">
          <h3 className="text-xs uppercase tracking-wider font-mono text-[#1E293B] font-bold">
            Computed Isochrone Buffer Areas
          </h3>
          <p className="text-xs text-[#64748B] mt-1">
            Calculated geodesic buffer bounds around high-frequency nodes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#E5E2DC] text-[#64748B] font-mono">
                <th className="p-4 font-medium">Transit Hub Node Name</th>
                <th className="p-4 font-medium">OSM Coordinates</th>
                <th className="p-4 font-medium">400m Buffer Area</th>
                <th className="p-4 font-medium">800m Buffer Area</th>
                <th className="p-4 font-medium">Geometry Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F0]">
              {buffersData.map((buf) => {
                const station = stations.find(s => s.id === buf.stationId);
                return (
                  <tr key={buf.stationId} className="hover:bg-[#FAF9F6]/50 transition-colors">
                    <td className="p-4 font-serif font-semibold text-[#1E293B]">{buf.stationName}</td>
                    <td className="p-4 font-mono text-[#64748B]">{station?.coords.join(', ')}</td>
                    <td className="p-4 font-mono">{buf.area400.toLocaleString()} m²</td>
                    <td className="p-4 font-mono">{buf.area800.toLocaleString()} m²</td>
                    <td className="p-4 font-mono text-[#2E4F3B]">Polygon (25-vertex)</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Walkability Matrix Table */}
      <section className="bg-white rounded border border-[#E5E2DC] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#F5F5F0]">
          <h3 className="text-xs uppercase tracking-wider font-mono text-[#1E293B] font-bold">
            Urban Centroid Accessibility Matrix
          </h3>
          <p className="text-xs text-[#64748B] mt-1">
            Evaluates residential cluster proximity to active transit services.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#E5E2DC] text-[#64748B] font-mono">
                <th className="p-4 font-medium">Centroid Name</th>
                <th className="p-4 font-medium">Population</th>
                <th className="p-4 font-medium">Nearest Platform</th>
                <th className="p-4 font-medium">Network Distance</th>
                <th className="p-4 font-medium">Accessibility Tier</th>
                <th className="p-4 font-medium">Walkability Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F0]">
              {walkabilityResults.map((res) => (
                <tr key={res.centroidId} className="hover:bg-[#FAF9F6]/50 transition-colors">
                  <td className="p-4 font-serif font-medium text-[#1E293B]">{res.centroidName}</td>
                  <td className="p-4 font-mono">{res.population.toLocaleString()}</td>
                  <td className="p-4 text-[#475569]">{res.closestStation}</td>
                  <td className="p-4 font-mono font-medium">{res.distance}m</td>
                  <td className={`p-4 font-semibold ${res.accessColor}`}>{res.accessLevel}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-[#FAF9F6] h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${res.score >= 100 ? 'bg-[#2E4F3B]' : res.score >= 60 ? 'bg-[#B45309]' : 'bg-red-700'}`} 
                          style={{ width: `${res.score}%` }} 
                        />
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-[#1E293B]">{res.score}/100</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-[#F5F5F0] flex justify-between items-center text-xs">
          <span className="text-[#64748B] font-mono">Calculations derived from Turf.js distance formulas</span>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-[#2E4F3B] hover:underline flex items-center gap-1 font-mono font-medium cursor-pointer"
          >
            Go to Map View <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>
    </DiagnosticReportLayout>
  );
}
