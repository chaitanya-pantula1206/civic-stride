import { useContext } from 'react';
import { NavigationContext } from '../App';
import DiagnosticReportLayout from '../components/DiagnosticReportLayout';
import { 
  Trees, 
  Wind, 
  Sun, 
  Thermometer,
  ArrowRight
} from 'lucide-react';

export default function ClimateComfortReport() {
  const { navigate } = useContext(NavigationContext);

  // Mock regional canopy area intersection data
  const canopyIntersections = [
    { zone: 'Commercial Corridor A', pathLength: '1,240 m', canopyCover: '18.4%', tempOffset: '-1.8 °C', microclimateScore: 'Low' },
    { zone: 'Residential Sector 2', pathLength: '2,850 m', canopyCover: '42.6%', tempOffset: '-4.2 °C', microclimateScore: 'Optimal' },
    { zone: 'Mixed-Use Downtown Hub', pathLength: '920 m', canopyCover: '12.0%', tempOffset: '-1.1 °C', microclimateScore: 'Poor' },
    { zone: 'Parkway Pedestrian Loop', pathLength: '1,740 m', canopyCover: '68.5%', tempOffset: '-6.3 °C', microclimateScore: 'Excellent' },
    { zone: 'Waterfront Esplanade', pathLength: '1,410 m', canopyCover: '31.0%', tempOffset: '-2.9 °C', microclimateScore: 'Moderate' },
  ];

  // Custom SVG Chart Data: Shadow Cover % throughout the day (8:00 AM - 6:00 PM)
  const shadowDistribution = [
    { hour: '08:00', pct: 45 },
    { hour: '10:00', pct: 32 },
    { hour: '12:00', pct: 15 }, // solar noon (lowest shadow projection)
    { hour: '14:00', pct: 28 },
    { hour: '16:00', pct: 48 },
    { hour: '18:00', pct: 65 },
  ];

  // SVG dimensions for chart
  const width = 600;
  const height = 240;
  const padding = 40;

  // Convert points to SVG coordinates
  const points = shadowDistribution.map((d, index) => {
    const x = padding + (index * (width - padding * 2)) / (shadowDistribution.length - 1);
    const y = height - padding - (d.pct * (height - padding * 2)) / 100;
    return { x, y, hour: d.hour, pct: d.pct };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <DiagnosticReportLayout
      title="Micro-Climate Comfort & Canopy Profile"
      description="Targeting UN SDG Indicator 13.1.1 and 11.7.1. This diagnostic report evaluates micro-climate thermal insulation along active transportation segments. By intersecting global canopy foliage imagery layers with pedestrian network tracks, the system isolates high-heat-stress risk areas."
      indexName="Index 3 Deep-Dive"
    >
      {/* Diagnostic Key Numbers */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded border border-[#E5E2DC] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Average Canopy Cover</span>
            <Trees className="h-4 w-4 text-[#2E4F3B]" />
          </div>
          <div className="text-3xl font-serif font-bold">34.7%</div>
          <p className="text-[10px] text-[#64748B]">Meets standard recommendations for temperate zones.</p>
        </div>

        <div className="bg-white p-5 rounded border border-[#E5E2DC] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Max Cooling Offset</span>
            <Thermometer className="h-4 w-4 text-[#2E4F3B]" />
          </div>
          <div className="text-3xl font-serif font-bold">-6.3 °C</div>
          <p className="text-[10px] text-[#64748B]">Observed in the dense Parkway Pedestrian Loop.</p>
        </div>

        <div className="bg-white p-5 rounded border border-[#E5E2DC] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Solar Exposure Offset</span>
            <Sun className="h-4 w-4 text-[#B45309]" />
          </div>
          <div className="text-3xl font-serif font-bold">42.5%</div>
          <p className="text-[10px] text-[#64748B]">Path segments experience extreme midday solar exposure.</p>
        </div>

        <div className="bg-white p-5 rounded border border-[#E5E2DC] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Wind-Tunnel Mitigation</span>
            <Wind className="h-4 w-4 text-[#78716C]" />
          </div>
          <div className="text-3xl font-serif font-bold">58.0%</div>
          <p className="text-[10px] text-[#64748B]">Canopy configurations block cold seasonal wind currents.</p>
        </div>
      </section>

      {/* Custom SVG Distribution Chart */}
      <section className="bg-white p-8 rounded border border-[#E5E2DC] shadow-sm space-y-4">
        <div>
          <h3 className="text-xs uppercase tracking-wider font-mono text-[#1E293B] font-bold">
            Diurnal Shadow-Cover Distribution Graph
          </h3>
          <p className="text-xs text-[#64748B] mt-1">
            Tracks the estimated percentage of walking paths sheltered by shadow buffers between 8:00 AM and 6:00 PM.
          </p>
        </div>

        {/* SVG Line Graph */}
        <div className="w-full overflow-x-auto pt-4">
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full max-w-[680px] mx-auto overflow-visible font-mono text-[9px] fill-[#64748B]"
          >
            {/* Grid Lines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#F5F5F0" strokeWidth={1} />
            <line x1={padding} y1={height/2} x2={width - padding} y2={height/2} stroke="#F5F5F0" strokeWidth={1} />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E5E2DC" strokeWidth={1} />
            
            {/* Y Axis Labels */}
            <text x={padding - 8} y={padding + 3} textAnchor="end">100%</text>
            <text x={padding - 8} y={height/2 + 3} textAnchor="end">50%</text>
            <text x={padding - 8} y={height - padding + 3} textAnchor="end">0%</text>

            {/* Area Under Line (Muted forest green tint) */}
            <path 
              d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`} 
              fill="#E8F5E9" 
              opacity={0.6}
            />

            {/* Data Line */}
            <path d={pathD} fill="none" stroke="#2E4F3B" strokeWidth={2} />

            {/* Points & Hover Labels */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={4} fill="white" stroke="#2E4F3B" strokeWidth={1.5} />
                <text x={p.x} y={p.y - 10} textAnchor="middle" className="font-semibold">{p.pct}%</text>
                <text x={p.x} y={height - padding + 16} textAnchor="middle">{p.hour}</text>
                <line x1={p.x} y1={p.y} x2={p.x} y2={height - padding} stroke="#E5E2DC" strokeDasharray="3 3" strokeWidth={1} />
              </g>
            ))}
          </svg>
        </div>
      </section>

      {/* Regional Canopy Area Intersections Table */}
      <section className="bg-white rounded border border-[#E5E2DC] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#F5F5F0]">
          <h3 className="text-xs uppercase tracking-wider font-mono text-[#1E293B] font-bold">
            Canopy & Thermal Mitigation Intersections
          </h3>
          <p className="text-xs text-[#64748B] mt-1">
            Isolates pedestrian pathway lengths and their associated canopy density metrics.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#E5E2DC] text-[#64748B] font-mono">
                <th className="p-4 font-medium">Urban Corridor segment</th>
                <th className="p-4 font-medium">Total Path length</th>
                <th className="p-4 font-medium">Measured Canopy Cover</th>
                <th className="p-4 font-medium">Midday Temperature Offset</th>
                <th className="p-4 font-medium">Thermal Comfort Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F0]">
              {canopyIntersections.map((intersection, idx) => (
                <tr key={idx} className="hover:bg-[#FAF9F6]/50 transition-colors">
                  <td className="p-4 font-serif font-semibold text-[#1E293B]">{intersection.zone}</td>
                  <td className="p-4 font-mono text-[#64748B]">{intersection.pathLength}</td>
                  <td className="p-4 font-mono">{intersection.canopyCover}</td>
                  <td className="p-4 font-mono font-medium text-[#2E4F3B]">{intersection.tempOffset}</td>
                  <td className={`p-4 font-mono font-bold ${
                    intersection.microclimateScore === 'Excellent' || intersection.microclimateScore === 'Optimal'
                      ? 'text-[#2E4F3B]' 
                      : intersection.microclimateScore === 'Moderate'
                      ? 'text-[#B45309]'
                      : 'text-red-700'
                  }`}>{intersection.microclimateScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-[#F5F5F0] flex justify-between items-center text-xs">
          <span className="text-[#64748B] font-mono">Calculations derived from NDVI canopy satellite offsets</span>
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
