import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NavigationContext } from '../App';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface LandingHeroProps {
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export default function LandingHero({ onOpenAuth, onOpenProfile }: LandingHeroProps) {
  const { user, isAuthenticated } = useContext(AuthContext);
  const { navigate } = useContext(NavigationContext);

  // Get initials for profile avatar
  const getInitials = (name: string) => {
    if (!name) return 'US';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full flex flex-col">
      {/* Editorial Header */}
      <header className="border-b border-[#E5E2DC] bg-[#FAF9F6]">
        <div className="max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
          {/* Logo Signature (Elegant Serif) */}
          <div 
            onClick={() => navigate('/')} 
            className="font-serif text-2xl font-medium tracking-tight text-[#1E293B] cursor-pointer hover:opacity-85 select-none"
          >
            CivicStride
          </div>

          {/* Conditional Control: Login Button or Profile Avatar */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#64748B] hidden sm:inline">
                  {user.location}
                </span>
                <button
                  onClick={onOpenProfile}
                  className="w-9 h-9 rounded-full bg-[#2E4F3B] hover:bg-[#1E3527] text-[#FAF9F6] font-mono text-xs font-semibold flex items-center justify-center border border-[#E5E2DC] transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
                  title="Open User Profile"
                >
                  {getInitials(user.username)}
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="editorial-button-secondary text-xs py-2 px-4 border border-[#C5C2BB]"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl w-full mx-auto px-6 py-16 md:py-20 flex flex-col gap-10">
        <div className="max-w-3xl space-y-6">
          {/* Primary Hero Headline */}
          <h1 className="hero-title">
            Quantifying the invisible syntax of sustainable urban topography.
          </h1>
          
          {/* Sub-Hero Explanatory Copy */}
          <p className="subhero-text font-light text-slate-700">
            An analytical canvas measuring the harmony between infrastructure and climate. We evaluate the true walkthrough experience of neighborhoods, calculate immediate pedestrian proximity to mass transit corridors, and simulate localized micro-climate comfort zones using global canopy metrics—giving urbanists the exact dimensions of a liveable community.
          </p>
        </div>

        {/* Crisp Non-Technical Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          <div className="editorial-card p-5 space-y-3">
            <div className="h-7 w-7 rounded-full bg-[#F5F5F0] flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-[#2E4F3B]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-serif font-medium text-[#1E293B]">Infrastructure Walkability</h3>
              <p className="text-xs text-[#64748B] font-light leading-relaxed">
                Measures sidewalk dimensions, sidewalk vectors, and barrier-free pathways across district networks.
              </p>
            </div>
          </div>

          <div className="editorial-card p-5 space-y-3">
            <div className="h-7 w-7 rounded-full bg-[#F5F5F0] flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-[#2E4F3B]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-serif font-medium text-[#1E293B]">Transit Access Matrices</h3>
              <p className="text-xs text-[#64748B] font-light leading-relaxed">
                Computes direct pedestrian distance and isochrone bounds for high-frequency mass transit corridors.
              </p>
            </div>
          </div>

          <div className="editorial-card p-5 space-y-3">
            <div className="h-7 w-7 rounded-full bg-[#F5F5F0] flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-[#2E4F3B]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-serif font-medium text-[#1E293B]">Micro-climate Insulation</h3>
              <p className="text-xs text-[#64748B] font-light leading-relaxed">
                Evaluates solar thermal comfort zones using canopy indices and local vegetation cover offsets.
              </p>
            </div>
          </div>

          <div className="editorial-card p-5 space-y-3">
            <div className="h-7 w-7 rounded-full bg-[#F5F5F0] flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-[#2E4F3B]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-serif font-medium text-[#1E293B]">Co-efficient Calibration</h3>
              <p className="text-xs text-[#64748B] font-light leading-relaxed">
                Allows urban planning teams to dynamically tune indicators and weights based on resident feedback.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
