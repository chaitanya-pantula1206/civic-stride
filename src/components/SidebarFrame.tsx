import React, { useContext } from 'react';
import { NavigationContext } from '../App';
import { AuthContext } from '../context/AuthContext';
import { WorkspaceContext } from '../context/WorkspaceContext';
import type { ResidentRatings } from '../context/AuthContext';
import GlobalBaselines from './GlobalBaselines';
import { 
  Trees, 
  Navigation as TransitIcon, 
  Download, 
  Activity, 
  ChevronRight,
  RefreshCw,
  Star,
  Sliders
} from 'lucide-react';

interface SidebarFrameProps {
  isQuerying: boolean;
  densityStats: any;
  infraScore: number;
  transitScore: number;
  climateScore: number;
  utmProjection?: string;
  setShowProfileModal: (val: boolean) => void;
  pdfDownloading: boolean;
  pdfDownloaded: boolean;
  handlePdfDownload: () => void;
  selectedCategory: keyof ResidentRatings;
  setSelectedCategory: (val: keyof ResidentRatings) => void;
  ratingInput: number;
  setRatingInput: (val: number) => void;
  handleRatingSubmit: (e: React.FormEvent) => void;
  ratingSuccess: boolean;
}

export default function SidebarFrame({
  isQuerying,
  densityStats,
  infraScore,
  transitScore,
  climateScore,
  utmProjection,
  setShowProfileModal,
  pdfDownloading,
  pdfDownloaded,
  handlePdfDownload,
  selectedCategory,
  setSelectedCategory,
  ratingInput,
  setRatingInput,
  handleRatingSubmit,
  ratingSuccess,
}: SidebarFrameProps) {
  const { navigate } = useContext(NavigationContext);
  const { logout, getAverageRating } = useContext(AuthContext);
  const { clearMapParams, setActiveView } = useContext(WorkspaceContext);

  const handleBrandClick = () => {
    clearMapParams();
    setActiveView('map');
    navigate('/');
  };

  // Unbiased Standardized Mathematical calculation (Geometric Mean G)
  const compositeScore = (() => {
    const product = infraScore * transitScore * climateScore;
    return product > 0 ? Math.pow(product, 1 / 3).toFixed(2) : '0.00';
  })();

  return (
    <aside className="w-full lg:w-[480px] bg-white border-l border-[#E5E2DC] flex flex-col h-[50%] lg:h-full z-10 shadow-editorial overflow-y-auto font-sans">
      
      {/* Welcome Entry Header Block */}
      <header className="p-6 border-b border-[#F5F5F0] space-y-3">
        {/* Header brand and home button node */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F5F5F0]">
          {/* Interactive serif brand link */}
          <div 
            onClick={handleBrandClick}
            className="font-serif text-lg font-medium tracking-tight text-[#1E293B] select-none cursor-pointer hover:opacity-85 transition-opacity"
            title="Reset workspace and return home"
          >
            CivicStride
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="text-[10px] font-mono text-[#64748B] hover:text-red-700 uppercase tracking-wider font-semibold hover:bg-red-50 border border-transparent hover:border-red-200 px-2 py-1 rounded transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="space-y-1">
          {/* Scaled down text size of Sustainability Analytics */}
          <h2 className="text-lg font-serif font-medium text-[#1E293B] tracking-tight leading-snug">
            Sustainability Analytics
          </h2>
          <p className="text-xs text-[#64748B] font-light leading-relaxed">
            Verify roadway configurations, pedestrian service metrics, and tree-canopy shade indices.
          </p>
        </div>
      </header>

      {/* Global Composite Index Display */}
      <section 
        id="tour-composite-score"
        className="bg-[#FAF9F6] p-6 border-b border-[#F5F5F0] flex items-center justify-between"
      >
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#64748B]">Composite Index Score</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-serif font-semibold text-[#1E293B]">{compositeScore}</span>
            <span className="text-xs text-[#64748B] font-mono">/ 1.00</span>
          </div>
        </div>
        <button 
          onClick={() => setShowProfileModal(true)}
          className="flex items-center gap-1.5 bg-white border border-[#E5E2DC] hover:bg-[#FAF9F6] shadow-sm px-3 py-1.5 rounded text-xs font-mono text-[#1E293B] transition-colors cursor-pointer"
        >
          <Activity className="h-4 w-4 text-[#2E4F3B]" />
          <span>Configure</span>
        </button>
      </section>

      {/* Unbiased Global Baseline Benchmarks Panel */}
      <GlobalBaselines
        infraScore={infraScore}
        transitScore={transitScore}
        climateScore={climateScore}
        utmProjection={utmProjection}
      />

      {/* CROWDSOURCED RESIDENT SCORE HUD */}
      <section className="p-6 border-b border-[#F5F5F0] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-[#B45309]" />
            <h3 className="text-xs uppercase tracking-wider font-mono text-[#1E293B] font-bold">Crowdsourced Resident Score</h3>
          </div>
          <span className="text-[9px] font-mono text-[#64748B] bg-[#FAF9F6] border border-[#E5E2DC] px-1.5 py-0.5 rounded">Live averages</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 bg-[#FAF9F6] border border-[#E5E2DC] rounded">
            <span className="block text-[#64748B] text-[9px] uppercase">Roads Grade</span>
            <span className="block text-lg font-bold text-[#1E293B] mt-0.5">{getAverageRating('roads')} / 5.0</span>
          </div>
          <div className="p-3 bg-[#FAF9F6] border border-[#E5E2DC] rounded">
            <span className="block text-[#64748B] text-[9px] uppercase">Footpaths Grade</span>
            <span className="block text-lg font-bold text-[#1E293B] mt-0.5">{getAverageRating('footpaths')} / 5.0</span>
          </div>
          <div className="p-3 bg-[#FAF9F6] border border-[#E5E2DC] rounded">
            <span className="block text-[#64748B] text-[9px] uppercase">Parks Grade</span>
            <span className="block text-lg font-bold text-[#1E293B] mt-0.5">{getAverageRating('parks')} / 5.0</span>
          </div>
          <div className="p-3 bg-[#FAF9F6] border border-[#E5E2DC] rounded">
            <span className="block text-[#64748B] text-[9px] uppercase">Sanitation Grade</span>
            <span className="block text-lg font-bold text-[#1E293B] mt-0.5">{getAverageRating('dustbins')} / 5.0</span>
          </div>
        </div>

        {/* Quick Rating Input Form */}
        <form onSubmit={handleRatingSubmit} className="space-y-3 pt-2 bg-[#FAF9F6]/50 p-3 rounded border border-dashed border-[#E5E2DC]">
          <span className="block text-[10px] font-mono text-[#64748B] uppercase font-semibold">Rate active bounds segment:</span>
          
          <div className="flex gap-2">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="flex-1 bg-white border border-[#E5E2DC] rounded p-1.5 text-xs text-[#1E293B] focus:outline-none"
            >
              <option value="roads">Road Safety</option>
              <option value="footpaths">Footpath Walkability</option>
              <option value="parks">Green Park Spaces</option>
              <option value="dustbins">Sanitation & Litter</option>
            </select>

            <input 
              type="number" 
              min="1" 
              max="5" 
              value={ratingInput} 
              onChange={(e) => setRatingInput(Number(e.target.value))}
              className="w-12 bg-white border border-[#E5E2DC] rounded text-center text-xs focus:outline-none"
            />

            <button 
              type="submit" 
              className="bg-[#2E4F3B] hover:bg-[#1E3527] text-white px-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
            >
              Submit
            </button>
          </div>

          {ratingSuccess && (
            <p className="text-[9px] font-mono text-[#2E4F3B] text-center">✓ Assessment index updated successfully.</p>
          )}
        </form>
      </section>

      {/* Dense telemetry query lists */}
      {densityStats && (
        <section className="p-6 border-b border-[#F5F5F0] space-y-3">
          <h3 className="text-xs uppercase tracking-wider font-mono text-[#64748B] font-bold">Retrieved Elements Density</h3>
          
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2 bg-[#FAF9F6] border border-[#E5E2DC] rounded">
              <span className="block text-[16px] font-bold text-[#1E293B]">{densityStats.streetLamps?.length || 0}</span>
              <span className="block text-[8px] text-[#64748B] uppercase">Streetlamps</span>
            </div>
            <div className="p-2 bg-[#FAF9F6] border border-[#E5E2DC] rounded">
              <span className="block text-[16px] font-bold text-[#1E293B]">{densityStats.benches?.length || 0}</span>
              <span className="block text-[8px] text-[#64748B] uppercase">Benches</span>
            </div>
            <div className="p-2 bg-[#FAF9F6] border border-[#E5E2DC] rounded">
              <span className="block text-[16px] font-bold text-[#1E293B]">{densityStats.wasteBaskets?.length || 0}</span>
              <span className="block text-[8px] text-[#64748B] uppercase">Sanitation</span>
            </div>
          </div>
        </section>
      )}

      {/* Micro-Navigation Pathways */}
      <section className="p-6 flex-1 space-y-3">
        <h3 className="text-xs uppercase tracking-wider font-mono text-[#64748B] font-bold">Diagnostic Reports</h3>

        <div className="space-y-2">
          {/* Nav Card 1 */}
          <div 
            onClick={() => navigate('/analytics/infrastructure')}
            className="flex items-center justify-between p-3 bg-white border border-[#E5E2DC] rounded hover:border-[#2E4F3B] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Sliders className="h-4 w-4 text-[#475569]" />
              <div>
                <span className="block text-xs font-serif font-semibold text-[#1E293B]">1. Infrastructure Layout</span>
                <span className="block text-[9px] font-mono text-[#64748B]">Sidewalk ratios & cycleways</span>
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-[#64748B] group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Nav Card 2 */}
          <div 
            onClick={() => navigate('/analytics/transit')}
            className="flex items-center justify-between p-3 bg-white border border-[#E5E2DC] rounded hover:border-[#2E4F3B] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <TransitIcon className="h-4 w-4 text-[#475569]" />
              <div>
                <span className="block text-xs font-serif font-semibold text-[#1E293B]">2. Transit Proximity Matrix</span>
                <span className="block text-[9px] font-mono text-[#64748B]">Transit isochrone buffers</span>
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-[#64748B] group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Nav Card 3 */}
          <div 
            onClick={() => navigate('/analytics/climate')}
            className="flex items-center justify-between p-3 bg-white border border-[#E5E2DC] rounded hover:border-[#2E4F3B] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Trees className="h-4 w-4 text-[#475569]" />
              <div>
                <span className="block text-xs font-serif font-semibold text-[#1E293B]">3. Micro-Climate Comfort</span>
                <span className="block text-[9px] font-mono text-[#64748B]">Foliage canopy offsets</span>
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-[#64748B] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </section>

      {/* Action Panel: PDF Downloader */}
      <section className="p-6 border-t border-[#F5F5F0] bg-[#FAF9F6]">
        <button 
          onClick={handlePdfDownload}
          disabled={pdfDownloading || isQuerying}
          className="w-full bg-[#1E293B] hover:bg-[#2E4F3B] text-white py-3 rounded text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:bg-[#94A3B8]"
        >
          {pdfDownloading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="h-3 w-3 animate-spin" /> Generating PDF Dossier...
            </span>
          ) : pdfDownloaded ? (
            <span className="flex items-center gap-2 text-white">
              <Check className="h-3.5 w-3.5" /> PDF Downloaded
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Download className="h-3.5 w-3.5" /> Download Comprehensive Report
            </span>
          )}
        </button>
      </section>

    </aside>
  );
}
