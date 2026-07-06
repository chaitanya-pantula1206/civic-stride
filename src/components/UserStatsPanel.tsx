import { useState, useEffect } from 'react';
import { X, Save, Sliders, Map } from 'lucide-react';

interface UserStatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SavedRegion {
  id: string;
  name: string;
  bbox: string;
  designIndex: number;
  transitIndex: number;
  climateIndex: number;
}

export default function UserStatsPanel({ isOpen, onClose }: UserStatsPanelProps) {
  // Default mock datasets for realistic demonstration
  const defaultRegions: SavedRegion[] = [
    {
      id: 'reg-1',
      name: 'Financial District Core',
      bbox: '37.7800, -122.4150 to 37.7950, -122.3950',
      designIndex: 84,
      transitIndex: 92,
      climateIndex: 76,
    },
    {
      id: 'reg-2',
      name: 'SoMa Pedestrian Corridor',
      bbox: '37.7720, -122.4200 to 37.7850, -122.4000',
      designIndex: 71,
      transitIndex: 88,
      climateIndex: 62,
    },
    {
      id: 'reg-3',
      name: 'Mission Dolores Canopy',
      bbox: '37.7580, -122.4300 to 37.7690, -122.4180',
      designIndex: 90,
      transitIndex: 74,
      climateIndex: 85,
    }
  ];

  // Load preferences from localStorage or defaults
  const [regions] = useState<SavedRegion[]>(() => {
    const saved = localStorage.getItem('civic_stride_saved_regions');
    return saved ? JSON.parse(saved) : defaultRegions;
  });

  const [infraWeight, setInfraWeight] = useState(() => {
    return Number(localStorage.getItem('civic_stride_weight_infra') || '40');
  });
  const [transitWeight, setTransitWeight] = useState(() => {
    return Number(localStorage.getItem('civic_stride_weight_transit') || '30');
  });
  const [climateWeight, setClimateWeight] = useState(() => {
    return Number(localStorage.getItem('civic_stride_weight_climate') || '30');
  });

  // Toggles for API Preferences
  const [autoExport, setAutoExport] = useState(() => {
    return localStorage.getItem('pref_auto_export') === 'true';
  });
  const [includeOsm, setIncludeOsm] = useState(() => {
    return localStorage.getItem('pref_include_osm') === 'true';
  });
  const [hiFidelityShade, setHiFidelityShade] = useState(() => {
    return localStorage.getItem('pref_hi_fidelity') !== 'false'; // default true
  });
  const [apiGateway, setApiGateway] = useState(() => {
    return localStorage.getItem('pref_api_gateway') === 'true';
  });

  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const saveSettings = () => {
    localStorage.setItem('civic_stride_weight_infra', String(infraWeight));
    localStorage.setItem('civic_stride_weight_transit', String(transitWeight));
    localStorage.setItem('civic_stride_weight_climate', String(climateWeight));
    
    localStorage.setItem('pref_auto_export', String(autoExport));
    localStorage.setItem('pref_include_osm', String(includeOsm));
    localStorage.setItem('pref_hi_fidelity', String(hiFidelityShade));
    localStorage.setItem('pref_api_gateway', String(apiGateway));

    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2000);
    
    // Dispatch event to notify dashboard of slider/weight updates
    window.dispatchEvent(new Event('weights_updated'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#F5F5F0]/80 backdrop-blur-[4px] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Main Panel Container */}
      <div className="relative w-full max-w-4xl bg-white border border-[#E5E2DC] rounded-md shadow-editorialMd p-8 md:p-10 z-10 max-h-[90vh] overflow-y-auto font-sans flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-[#E5E2DC] pb-5">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono tracking-widest text-[#2E4F3B] uppercase font-semibold">
              Spatial Telemetry Dashboard
            </span>
            <h1 className="text-2xl font-serif font-medium text-[#1E293B] tracking-tight flex items-center gap-2">
              <Map className="h-5.5 w-5.5 text-[#2E4F3B]" />
              Saved Monitored Regions & Parameters
            </h1>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[#94A3B8] hover:text-[#475569] transition-colors rounded-full hover:bg-[#F5F5F0]"
            aria-label="Close Stats Panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Synthesis Coefficients Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 border-b border-[#F5F5F0] pb-2">
            <Sliders className="h-4 w-4 text-[#2E4F3B]" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-bold">
              Global Synthesis Weights
            </h3>
          </div>

          <div className="bg-[#FAF9F6] border border-[#E5E2DC] p-5 rounded space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <span className="block text-[10px] font-mono text-[#64748B] uppercase">Infrastructure Layout Co-efficient</span>
                <div className="flex items-center justify-center gap-1.5">
                  <input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={infraWeight} 
                    onChange={(e) => setInfraWeight(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-16 bg-white border border-[#E5E2DC] text-center py-1 rounded text-xs font-mono focus:outline-none focus:border-[#2E4F3B]"
                  />
                  <span className="text-xs text-[#64748B] font-mono">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="block text-[10px] font-mono text-[#64748B] uppercase">Transit Matrix Co-efficient</span>
                <div className="flex items-center justify-center gap-1.5">
                  <input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={transitWeight} 
                    onChange={(e) => setTransitWeight(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-16 bg-white border border-[#E5E2DC] text-center py-1 rounded text-xs font-mono focus:outline-none focus:border-[#2E4F3B]"
                  />
                  <span className="text-xs text-[#64748B] font-mono">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="block text-[10px] font-mono text-[#64748B] uppercase">Microclimate Canopy Co-efficient</span>
                <div className="flex items-center justify-center gap-1.5">
                  <input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={climateWeight} 
                    onChange={(e) => setClimateWeight(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-16 bg-white border border-[#E5E2DC] text-center py-1 rounded text-xs font-mono focus:outline-none focus:border-[#2E4F3B]"
                  />
                  <span className="text-xs text-[#64748B] font-mono">%</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono text-[#64748B] pt-3 border-t border-[#E5E2DC]/60">
              <span>Composite Sum Total:</span>
              <span className={`font-bold ${(infraWeight + transitWeight + climateWeight) === 100 ? 'text-[#2E4F3B]' : 'text-amber-700'}`}>
                {infraWeight + transitWeight + climateWeight}% {(infraWeight + transitWeight + climateWeight) !== 100 && '(Adjust to reach 100%)'}
              </span>
            </div>
          </div>
        </div>

        {/* Monitored Zones Bounding Table */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-[#F5F5F0] pb-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-bold">
              Monitored Spatial Regions
            </h3>
            <span className="text-[10px] font-mono text-[#94A3B8]">
              {regions.length} Bounds Active
            </span>
          </div>

          <div className="overflow-x-auto border border-[#E5E2DC] rounded-md">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#E5E2DC] text-[#64748B] font-mono uppercase text-[9px] tracking-wider">
                  <th className="py-3 px-4 font-semibold">Region Identifier</th>
                  <th className="py-3 px-4 font-semibold">Boundary Box Coordinates (bbox)</th>
                  <th className="py-3 px-4 font-semibold text-center">Design Index</th>
                  <th className="py-3 px-4 font-semibold text-center">Transit Access</th>
                  <th className="py-3 px-4 font-semibold text-center">Microclimate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DC] bg-white font-sans">
                {regions.map((region) => (
                  <tr key={region.id} className="hover:bg-[#FAF9F6]/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-[#1E293B]">{region.name}</td>
                    <td className="py-3 px-4 font-mono text-[10px] text-[#64748B]">{region.bbox}</td>
                    <td className="py-3 px-4 text-center font-mono text-[#2E4F3B] font-semibold">{region.designIndex}/100</td>
                    <td className="py-3 px-4 text-center font-mono text-[#2E4F3B] font-semibold">{region.transitIndex}/100</td>
                    <td className="py-3 px-4 text-center font-mono text-[#2E4F3B] font-semibold">{region.climateIndex}/100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export & API Preferences Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-bold border-b border-[#F5F5F0] pb-2">
            API Integrations & Automation Preferences
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 p-3.5 border border-[#E5E2DC] rounded hover:bg-[#FAF9F6] transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={autoExport}
                onChange={(e) => setAutoExport(e.target.checked)}
                className="mt-1 accent-[#2E4F3B] cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="block text-xs font-medium text-[#1E293B]">Auto-generate GeoJSON on boundary lock</span>
                <span className="block text-[10px] text-[#64748B] font-light">Compiles GeoJSON layers instantly upon selecting map coordinates.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 border border-[#E5E2DC] rounded hover:bg-[#FAF9F6] transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={includeOsm}
                onChange={(e) => setIncludeOsm(e.target.checked)}
                className="mt-1 accent-[#2E4F3B] cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="block text-xs font-medium text-[#1E293B]">Include Overpass OSM Metadata in Export</span>
                <span className="block text-[10px] text-[#64748B] font-light">Enriches exported JSON files with detailed tag signatures and timestamps.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 border border-[#E5E2DC] rounded hover:bg-[#FAF9F6] transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={hiFidelityShade}
                onChange={(e) => setHiFidelityShade(e.target.checked)}
                className="mt-1 accent-[#2E4F3B] cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="block text-xs font-medium text-[#1E293B]">High-fidelity Microclimate comfort layers</span>
                <span className="block text-[10px] text-[#64748B] font-light">Performs deep shadow offset simulations (higher processing overhead).</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 border border-[#E5E2DC] rounded hover:bg-[#FAF9F6] transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={apiGateway}
                onChange={(e) => setApiGateway(e.target.checked)}
                className="mt-1 accent-[#2E4F3B] cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="block text-xs font-medium text-[#1E293B]">Sandbox Local API Gateway</span>
                <span className="block text-[10px] text-[#64748B] font-light">Launches a simulated REST server on localhost:8000 for automation testing.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Global Save Controls */}
        <div className="flex justify-between items-center border-t border-[#E5E2DC] pt-5 mt-2">
          <p className="text-[11px] font-mono text-[#94A3B8]">
            Settings are stored locally on this terminal client.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="editorial-button-secondary text-xs"
            >
              Cancel
            </button>
            <button
              onClick={saveSettings}
              className="editorial-button-primary text-xs flex items-center gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              {isSavedAlert ? 'Configuration Saved' : 'Save Changes'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
