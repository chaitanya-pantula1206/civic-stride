import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NavigationContext } from '../App';
import LandingHero from '../components/LandingHero';
import AuthModal from '../components/AuthModal';
import UserProfile from '../components/UserProfile';
import { Compass, FileText, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const { navigate } = useContext(NavigationContext);

  // Modal open states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1E293B] font-sans antialiased flex flex-col justify-between selection:bg-[#E8F5E9] selection:text-[#2E4F3B]">
      
      {/* Top Header & Hero section component */}
      <LandingHero 
        onOpenAuth={() => setShowAuthModal(true)} 
        onOpenProfile={() => setShowProfileModal(true)} 
      />

      {/* Main workspace control entry point (Center-aligned layout below hero) */}
      <main className="flex-1 flex flex-col justify-center py-6">
        {isAuthenticated && user ? (
          <div className="max-w-xl w-full mx-auto px-6 text-center space-y-6">
            <div className="bg-[#FAF9F6] p-8 rounded-md border border-[#E5E2DC] shadow-editorial space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-[#2E4F3B] uppercase font-semibold">
                  Session Verified
                </span>
                <h3 className="font-serif text-2xl text-[#1E293B] font-medium leading-tight">
                  Welcome back, {user.username}
                </h3>
                <p className="text-xs text-[#64748B] font-mono uppercase mt-1">
                  District Boundary: <span className="text-[#1E293B] font-bold">{user.location}</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="editorial-button-primary text-xs flex items-center justify-center gap-2 group h-10 px-6"
                >
                  Enter Spatial Workspace
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="editorial-button-secondary text-xs h-10 px-6"
                >
                  Workspace Panel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-xl w-full mx-auto px-6 text-center space-y-6">
            <div className="bg-white border border-dashed border-[#C5C2BB] p-8 rounded-md space-y-4">
              <span className="text-[10px] font-mono tracking-widest text-[#64748B] uppercase font-bold">
                Analytical Sandboxing
              </span>
              <p className="text-sm text-slate-600 font-light leading-relaxed max-w-md mx-auto">
                Access advanced overpass sidewalk geometry mapping, micro-climate insulation grids, and custom coefficient indexes. Initialize a secure session key.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="editorial-button-primary text-xs h-10 px-6"
              >
                Initialize Session Key
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-[#E5E2DC] bg-[#FAF9F6]">
        <div className="max-w-6xl w-full mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#64748B] font-mono gap-4">
          <span>© 2026 CivicStride Platform. Built for SDGs 11 & 13.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#1E293B] underline underline-offset-4 flex items-center gap-1.5 transition-colors">
              <Compass className="h-3.5 w-3.5" /> Overpass API Status
            </a>
            <a href="#" className="hover:text-[#1E293B] underline underline-offset-4 flex items-center gap-1.5 transition-colors">
              <FileText className="h-3.5 w-3.5" /> Platform Documentation
            </a>
          </div>
        </div>
      </footer>

      {/* Authentication Modal Overlay */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onSuccess={() => {
          // Instantly redirect to dashboard upon successful login/signup
          navigate('/dashboard');
        }}
      />

      {/* User Profile Panel Overlay */}
      <UserProfile 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />

    </div>
  );
}
