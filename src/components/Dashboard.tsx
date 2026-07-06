import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { ResidentRatings } from '../context/AuthContext';
import UserProfile from './UserProfile';
import UserStatsPanel from './UserStatsPanel';
import DashboardFrame from './DashboardFrame';
import SidebarFrame from './SidebarFrame';
import OnboardingTour from './OnboardingTour';

export default function Dashboard() {
  const { submitRating } = useContext(AuthContext);

  // States controlled by query callbacks from DashboardFrame
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [densityStats, setDensityStats] = useState<any>(null);

  // Unbiased baseline scoring indices
  const [infraScore, setInfraScore] = useState<number>(0.78);
  const [transitScore, setTransitScore] = useState<number>(0.68);
  const [climateScore, setClimateScore] = useState<number>(0.61);
  const [utmProjection, setUtmProjection] = useState<string>('EPSG:4326 (WGS 84)');

  // Modal Overlay Toggles
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  
  // PDF download simulation states
  const [pdfDownloading, setPdfDownloading] = useState<boolean>(false);
  const [pdfDownloaded, setPdfDownloaded] = useState<boolean>(false);

  // Ratings inputs
  const [selectedCategory, setSelectedCategory] = useState<keyof ResidentRatings>('roads');
  const [ratingInput, setRatingInput] = useState<number>(4);
  const [ratingSuccess, setRatingSuccess] = useState<boolean>(false);

  // Calculate dynamic sub-scores and local UTM projection based on query results
  useEffect(() => {
    if (densityStats) {
      // Dynamic computation matching OSM element density
      const calculatedInfra = Math.min(1.0, 0.45 + (densityStats.sidewalksCount * 0.04));
      const calculatedTransit = Math.min(1.0, 0.35 + (densityStats.busStations.length * 0.12));
      const calculatedClimate = Math.min(1.0, 0.25 + (densityStats.parksCount * 0.20));

      setInfraScore(calculatedInfra);
      setTransitScore(calculatedTransit);
      setClimateScore(calculatedClimate);

      // Determine local UTM projection dynamically from stored session center longitude
      const session = localStorage.getItem('civic_stride_map_session');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          const zone = Math.floor((parsed.lng + 180) / 6) + 1;
          const srid = parsed.lat >= 0 ? 32600 + zone : 32700 + zone;
          setUtmProjection(`EPSG:${srid} (UTM Zone ${zone}${parsed.lat >= 0 ? 'N' : 'S'})`);
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      setInfraScore(0.78);
      setTransitScore(0.68);
      setClimateScore(0.61);
      setUtmProjection('EPSG:4326 (WGS 84)');
    }
  }, [densityStats]);

  // Synchronize with UserStatsPanel edits (if weights were modified there)
  useEffect(() => {
    const handleWeightsUpdate = () => {
      // In unbiased mode, weights sliders are removed from main sidebar, 
      // but we update parameters if they edit stats
      const savedInfra = Number(localStorage.getItem('civic_stride_weight_infra') || '40') / 100;
      const savedTransit = Number(localStorage.getItem('civic_stride_weight_transit') || '30') / 100;
      const savedClimate = Number(localStorage.getItem('civic_stride_weight_climate') || '30') / 100;
      
      loggerDebug('Weights refreshed', savedInfra, savedTransit, savedClimate);
    };

    window.addEventListener('weights_updated', handleWeightsUpdate);
    return () => window.removeEventListener('weights_updated', handleWeightsUpdate);
  }, []);

  const loggerDebug = (...args: any[]) => {
    console.debug('[Dashboard]', ...args);
  };

  // Handle PDF Simulation Download event
  const handlePdfDownload = () => {
    setPdfDownloading(true);
    setPdfDownloaded(false);
    setTimeout(() => {
      setPdfDownloading(false);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3000);
    }, 2000);
  };

  // Submit dynamic rating handler
  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRating(selectedCategory, ratingInput);
    setRatingSuccess(true);
    setTimeout(() => setRatingSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-[#FAF9F6] text-[#1E293B] font-sans antialiased overflow-hidden select-none">
      
      {/* Map Viewport and manual coordinate panel wrapper */}
      <div id="tour-bbox-panel" className="flex-1 relative h-[50%] lg:h-full">
        <DashboardFrame
          onQueryStateChange={setIsQuerying}
          onQueryComplete={(stats) => setDensityStats(stats)}
        />
      </div>

      {/* Sidebar Frame Panel */}
      <SidebarFrame
        isQuerying={isQuerying}
        densityStats={densityStats}
        infraScore={infraScore}
        transitScore={transitScore}
        climateScore={climateScore}
        utmProjection={utmProjection}
        setShowProfileModal={setShowProfileModal}
        pdfDownloading={pdfDownloading}
        pdfDownloaded={pdfDownloaded}
        handlePdfDownload={handlePdfDownload}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        ratingInput={ratingInput}
        setRatingInput={setRatingInput}
        handleRatingSubmit={handleRatingSubmit}
        ratingSuccess={ratingSuccess}
      />

      {/* Simplified User Profile Overlay */}
      {showProfileModal && (
        <UserProfile 
          isOpen={showProfileModal} 
          onClose={() => setShowProfileModal(false)}
          onNavigateToStats={() => setShowStatsModal(true)}
        />
      )}

      {/* User Stats/Tables Secondary Overlay */}
      {showStatsModal && (
        <UserStatsPanel
          isOpen={showStatsModal}
          onClose={() => setShowStatsModal(false)}
        />
      )}

      {/* Interactive Step-by-Step Onboarding Tour */}
      <OnboardingTour />

    </div>
  );
}
