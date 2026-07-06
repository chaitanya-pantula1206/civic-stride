import { useContext } from 'react';
import { NavigationContext } from '../App';
import DiagnosticReportLayout from '../components/DiagnosticReportLayout';
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight
} from 'lucide-react';

export default function InfrastructureReport() {
  const { navigate } = useContext(NavigationContext);

  // Simulated layout analysis data
  const metrics = {
    roadWidthSidewalkRatio: '1 : 0.42',
    sidewalkCoverage: '62.4%',
    cyclewayCoverage: '38.1%',
    intersectionDensity: '42.5 nodes/km²',
    pedestrianSafetyScore: '74/100',
    litPathsPercentage: '81.0%',
    poorSurfacePercentage: '14.5%',
  };

  return (
    <DiagnosticReportLayout
      title="Infrastructure Layout & Design Index"
      description="Targeting UN SDG Indicator 11.7.1. This diagnostic report evaluates the configuration, capacity, and spatial equity of active mobility infrastructure. Layout assessments cross-reference footpaths, sidewalk tags, and cycling tracks to measure network density and pavement quality."
      indexName="Index 1 Deep-Dive"
    >
      {/* Global Metric Overview Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded border border-[#E5E2DC] shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">Design Grade</span>
            <span className="text-xs font-mono text-[#2E4F3B] bg-[#E8F5E9] px-2 py-0.5 rounded">Good</span>
          </div>
          <div className="text-3xl font-serif font-bold text-[#1E293B]">B +</div>
          <p className="text-xs text-[#64748B]">Solid sidewalk distribution with opportunities to improve bicycle integration lanes.</p>
        </div>

        <div className="bg-white p-6 rounded border border-[#E5E2DC] shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">Active Path Density</span>
            <span className="text-xs font-mono text-[#64748B]">Percentile</span>
          </div>
          <div className="text-3xl font-serif font-bold text-[#1E293B]">76.2%</div>
          <p className="text-xs text-[#64748B]">Ranks in the top tier for pedestrian connectivity compared to regional benchmarks.</p>
        </div>

        <div className="bg-white p-6 rounded border border-[#E5E2DC] shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">Safety Index</span>
            <span className="text-xs font-mono text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded">Moderate</span>
          </div>
          <div className="text-3xl font-serif font-bold text-[#1E293B]">{metrics.pedestrianSafetyScore}</div>
          <p className="text-xs text-[#64748B]">Moderate road crossings conflicts limit sidewalk networks connectivity scores.</p>
        </div>
      </section>

      {/* Deep Calculations Table & Telemetry Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Telemetry Column */}
        <div className="bg-white p-8 rounded border border-[#E5E2DC] shadow-sm space-y-6">
          <h3 className="text-xs uppercase tracking-wider font-mono text-[#1E293B] font-bold border-b border-[#F5F5F0] pb-3">
            Geospatial Telemetry Grid
          </h3>
          
          <div className="space-y-5">
            
            {/* Ratio metric */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-[#1E293B]">
                <span className="font-semibold">Road-Width-to-Sidewalk Ratio</span>
                <span>{metrics.roadWidthSidewalkRatio}</span>
              </div>
              <div className="h-2 bg-[#F5F5F0] rounded-full overflow-hidden flex">
                <div className="h-full bg-[#78716C] w-[70%]" title="Roadways" />
                <div className="h-full bg-[#2E4F3B] w-[30%]" title="Sidewalks" />
              </div>
              <span className="block text-[10px] text-[#64748B]">Ideal target 1:1 ratio. Muted olive represents pedestrian rights-of-way offsets.</span>
            </div>

            {/* Cycleway metric */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-[#1E293B]">
                <span className="font-semibold">Cycling Track Coverage</span>
                <span>{metrics.cyclewayCoverage}</span>
              </div>
              <div className="h-2 bg-[#F5F5F0] rounded-full overflow-hidden">
                <div className="h-full bg-[#2E4F3B] w-[38.1%]" />
              </div>
              <span className="block text-[10px] text-[#64748B]">Total length of dedicated lanes compared to drivable street networks.</span>
            </div>

            {/* Sidewalk coverage */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-[#1E293B]">
                <span className="font-semibold">Sidewalk Coverage Density</span>
                <span>{metrics.sidewalkCoverage}</span>
              </div>
              <div className="h-2 bg-[#F5F5F0] rounded-full overflow-hidden">
                <div className="h-full bg-[#2E4F3B] w-[62.4%]" />
              </div>
              <span className="block text-[10px] text-[#64748B]">Computed percentage of streets marked with dedicated sidewalk OSM tags.</span>
            </div>

            {/* Crossing intersections */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-[#1E293B]">
                <span className="font-semibold">Intersection Node Density</span>
                <span>{metrics.intersectionDensity}</span>
              </div>
              <div className="p-3 bg-[#FAF9F6] border border-[#E5E2DC] rounded flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#64748B]">Total nodes inside current bounding box</span>
                <span className="text-xs font-mono font-semibold text-[#1E293B]">248 nodes</span>
              </div>
            </div>

          </div>
        </div>

        {/* Audit Checklist Column */}
        <div className="bg-white p-8 rounded border border-[#E5E2DC] shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-xs uppercase tracking-wider font-mono text-[#1E293B] font-bold border-b border-[#F5F5F0] pb-3">
              Urban Layout Audit Outcomes
            </h3>

            <ul className="space-y-4">
              <li className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#2E4F3B] flex-shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-[#1E293B]">Continuous Sidewalk Layouts</span>
                  <span className="block text-[11px] text-[#64748B] leading-relaxed mt-0.5">
                    OpenStreetMap data indicates that over 75% of footpaths are interconnected, minimizing mid-block pedestrian disconnects.
                  </span>
                </div>
              </li>

              <li className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#2E4F3B] flex-shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-[#1E293B]">Safe Pedestrian Crossings</span>
                  <span className="block text-[11px] text-[#64748B] leading-relaxed mt-0.5">
                    Designated crossings exist within 150 meters of all tracked school and playground infrastructure zones.
                  </span>
                </div>
              </li>

              <li className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-[#B45309] flex-shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-[#B45309]">Bicycle Infrastructure Discontinuities</span>
                  <span className="block text-[11px] text-[#64748B] leading-relaxed mt-0.5">
                    Severe gap identified: Cycle lanes drop off near secondary arterials. This requires street network updates to maintain safety standards.
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-[#F5F5F0] flex justify-between items-center text-xs">
            <span className="text-[#64748B] font-mono">Calculations derived from Turf.js</span>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-[#2E4F3B] hover:underline flex items-center gap-1 font-mono font-medium cursor-pointer"
            >
              Go to Map View <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Design Quality Diagnostics */}
      <section className="bg-white p-8 rounded border border-[#E5E2DC] shadow-sm space-y-6">
        <h3 className="text-xs uppercase tracking-wider font-mono text-[#1E293B] font-bold border-b border-[#F5F5F0] pb-3">
          Qualitative Material Assessments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed">
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-[#1E293B]">Surface Quality & Material Compliance</h4>
            <p className="text-[#64748B]">
              High-quality asphalt and concrete comprise {100 - parseFloat(metrics.poorSurfacePercentage)}% of pedestrian corridors. The remaining {metrics.poorSurfacePercentage} consists of cobblestone, unpaved sand, or damaged pavement that fails ADA compliance checks. These surface restrictions limit wheelchair navigation and pedestrian walkability flow indices.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-[#1E293B]">Lighting & Nighttime Walking Comfort</h4>
            <p className="text-[#64748B]">
              Night walkability is well supported by layout lighting tags: {metrics.litPathsPercentage} of mapped pathways are tagged as `lit=yes`. Urban zones lacking lighting attributes are primarily centered in natural reserves or transitional alleyways, which present minor night safety hazards.
            </p>
          </div>
        </div>
      </section>
    </DiagnosticReportLayout>
  );
}
