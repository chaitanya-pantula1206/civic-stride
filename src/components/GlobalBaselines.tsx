import { Layers } from 'lucide-react';

interface GlobalBaselinesProps {
  infraScore: number;
  transitScore: number;
  climateScore: number;
  utmProjection?: string;
}

export default function GlobalBaselines({
  infraScore,
  transitScore,
  climateScore,
  utmProjection = 'EPSG:4326 (WGS 84)'
}: GlobalBaselinesProps) {
  
  const renderIndicatorBar = (value: number) => {
    return (
      <div className="w-full bg-[#FAF9F6] h-1.5 rounded-full overflow-hidden border border-[#E5E2DC]">
        <div 
          className="bg-[#2E4F3B] h-full transition-all duration-500" 
          style={{ width: `${value * 100}%` }}
        />
      </div>
    );
  };

  return (
    <section 
      id="tour-metric-sliders"
      className="p-6 border-b border-[#F5F5F0] space-y-4 font-sans text-left"
    >
      {/* Header with Coordinate Badge */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-[#64748B]" />
          <h3 className="text-xs uppercase tracking-wider font-mono text-[#1E293B] font-bold">Global Baseline Benchmarks</h3>
        </div>
        
        {/* Spatial Coordinate Framework Badge */}
        <span className="text-[8px] font-mono text-[#2E4F3B] bg-[#E8F5E9] px-2 py-0.5 border border-[#C2E0C6] rounded font-semibold select-none">
          {utmProjection}
        </span>
      </div>

      <p className="text-[10px] text-[#64748B] font-light leading-relaxed">
        Unbiased spatial metrics calculated using standard geometric means anchored against absolute physical baselines rather than regional averages.
      </p>

      {/* Sub-indices Readouts */}
      <div className="space-y-3.5 pt-1">
        
        {/* Index 1 */}
        <div className="space-y-1">
          <div className="flex justify-between items-baseline text-xs font-mono text-[#475569]">
            <span className="font-semibold text-[#1E293B]">Infrastructure Design (I_infra)</span>
            <span className="font-bold text-[#2E4F3B]">{(infraScore).toFixed(2)}</span>
          </div>
          {renderIndicatorBar(infraScore)}
          <span className="block text-[9px] text-[#94A3B8] font-light">
            Continuous walkability paths relative to drivable networks. Baseline 1:1 = 1.00.
          </span>
        </div>

        {/* Index 2 */}
        <div className="space-y-1">
          <div className="flex justify-between items-baseline text-xs font-mono text-[#475569]">
            <span className="font-semibold text-[#1E293B]">Transit Proximity (I_transit)</span>
            <span className="font-bold text-[#2E4F3B]">{(transitScore).toFixed(2)}</span>
          </div>
          {renderIndicatorBar(transitScore)}
          <span className="block text-[9px] text-[#94A3B8] font-light">
            Distance decay from central coordinate centroid. 400m walk = 0.90.
          </span>
        </div>

        {/* Index 3 */}
        <div className="space-y-1">
          <div className="flex justify-between items-baseline text-xs font-mono text-[#475569]">
            <span className="font-semibold text-[#1E293B]">Microclimate Shade (I_climate)</span>
            <span className="font-bold text-[#2E4F3B]">{(climateScore).toFixed(2)}</span>
          </div>
          {renderIndicatorBar(climateScore)}
          <span className="block text-[9px] text-[#94A3B8] font-light">
            Normalized canopy cover shade area on active pedestrian walkways.
          </span>
        </div>

      </div>
    </section>
  );
}
