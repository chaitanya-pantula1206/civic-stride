import React, { useState } from 'react';
import { MapPin, RefreshCw, AlertCircle } from 'lucide-react';

interface BoundingBoxPanelProps {
  minLat: string;
  minLng: string;
  maxLat: string;
  maxLng: string;
  setMinLat: (val: string) => void;
  setMinLng: (val: string) => void;
  setMaxLat: (val: string) => void;
  setMaxLng: (val: string) => void;
  onCoordsUpdate: () => void;
  onOSMQuery: () => Promise<void>;
  isQuerying: boolean;
  queryComplete: boolean;
  totalElementsFound: number;
}

export default function BoundingBoxPanel({
  minLat,
  minLng,
  maxLat,
  maxLng,
  setMinLat,
  setMinLng,
  setMaxLat,
  setMaxLng,
  onCoordsUpdate,
  onOSMQuery,
  isQuerying,
  queryComplete,
  totalElementsFound,
}: BoundingBoxPanelProps) {
  const [areaError, setAreaError] = useState<string | null>(null);

  // Bounding Box Area Limit (optimized threshold check)
  const AREA_THRESHOLD = 0.005; // Area ~ 0.07 x 0.07 degrees max area (about 50 sq km)

  const handleQueryClick = async () => {
    setAreaError(null);

    const s = parseFloat(minLat);
    const w = parseFloat(minLng);
    const n = parseFloat(maxLat);
    const e = parseFloat(maxLng);

    if (isNaN(s) || isNaN(w) || isNaN(n) || isNaN(e)) {
      setAreaError('Invalid coordinate inputs.');
      return;
    }

    // Area delta evaluation
    const area = Math.abs((n - s) * (e - w));
    if (area > AREA_THRESHOLD) {
      setAreaError(`Selected extents cover too large of an area (${area.toFixed(6)} units). Please zoom in to a focused district corridor.`);
      return;
    }

    try {
      await onOSMQuery();
    } catch (err: any) {
      console.error(err);
      setAreaError(err?.message || 'Failed to connect to Overpass API. Coordinate area might exceed density limits.');
    }
  };

  return (
    <div className="absolute bottom-6 left-6 z-10 bg-white/95 backdrop-blur-md p-4 rounded border border-[#E5E2DC] shadow-editorial w-72 flex flex-col gap-3 font-sans">
      <div className="flex items-center gap-1.5 text-[#1E293B]">
        <MapPin className="h-4 w-4 text-[#2E4F3B]" />
        <span className="text-[10px] tracking-wider font-mono font-bold uppercase">Bounding Box Extents</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="editorial-input-group">
          <label className="editorial-input-label text-[8px]">South Lat</label>
          <input 
            type="number" 
            step="0.001" 
            value={minLat} 
            onChange={(e) => setMinLat(e.target.value)} 
            className="w-full bg-white border border-[#E2E8F0] rounded p-1 text-[11px] focus:outline-none focus:border-[#2E4F3B]"
          />
        </div>
        <div className="editorial-input-group">
          <label className="editorial-input-label text-[8px]">West Lng</label>
          <input 
            type="number" 
            step="0.001" 
            value={minLng} 
            onChange={(e) => setMinLng(e.target.value)} 
            className="w-full bg-white border border-[#E2E8F0] rounded p-1 text-[11px] focus:outline-none focus:border-[#2E4F3B]"
          />
        </div>
        <div className="editorial-input-group">
          <label className="editorial-input-label text-[8px]">North Lat</label>
          <input 
            type="number" 
            step="0.001" 
            value={maxLat} 
            onChange={(e) => setMaxLat(e.target.value)} 
            className="w-full bg-white border border-[#E2E8F0] rounded p-1 text-[11px] focus:outline-none focus:border-[#2E4F3B]"
          />
        </div>
        <div className="editorial-input-group">
          <label className="editorial-input-label text-[8px]">East Lng</label>
          <input 
            type="number" 
            step="0.001" 
            value={maxLng} 
            onChange={(e) => setMaxLng(e.target.value)} 
            className="w-full bg-white border border-[#E2E8F0] rounded p-1 text-[11px] focus:outline-none focus:border-[#2E4F3B]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
        <button 
          onClick={onCoordsUpdate}
          className="editorial-button-secondary py-1.5 px-3 text-[10px]"
        >
          Fit View
        </button>
        <button 
          onClick={handleQueryClick}
          disabled={isQuerying}
          className="editorial-button-primary py-1.5 px-3 text-[10px] disabled:opacity-60"
        >
          {isQuerying ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Query Overpass'}
        </button>
      </div>

      {/* Non-blocking inline validation banner */}
      {areaError && (
        <div className="bg-amber-50/70 border border-amber-200 text-amber-900 text-[10px] p-2.5 rounded font-sans leading-relaxed flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
          <span>{areaError}</span>
        </div>
      )}

      {queryComplete && !areaError && (
        <div className="text-[9px] font-mono text-[#2E4F3B] bg-[#E8F5E9]/60 px-2 py-1.5 rounded text-center border border-[#C2E0C6]">
          Retrieved {totalElementsFound} geometry nodes/vectors
        </div>
      )}
    </div>
  );
}
