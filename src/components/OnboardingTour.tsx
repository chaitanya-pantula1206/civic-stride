import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

interface OnboardingTourProps {
  onClose?: () => void;
}

interface StepConfig {
  targetId: string;
  title: string;
  content: string;
  placement: 'top' | 'right' | 'bottom' | 'left' | 'center';
}

export default function OnboardingTour({ onClose }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const steps: StepConfig[] = [
    {
      targetId: 'tour-bbox-panel',
      title: '1. Target Extents & Overpass Query',
      content: 'Adjust coordinate bounds for your municipality district here, then click "Query Overpass" to load sidewalk, crossing, and vegetation vectors.',
      placement: 'right',
    },
    {
      targetId: 'tour-metric-sliders',
      title: '2. Tuning Coefficient Weights',
      content: 'Slide to adjust coefficients for Infrastructure, Transit, and Canopy Shade indices, tailoring composite ratings to specific planning projects.',
      placement: 'left',
    },
    {
      targetId: 'tour-composite-score',
      title: '3. Composite Index Score HUD',
      content: 'Review synthesis outcome index scores alongside crowdsourced resident voting averages in real time.',
      placement: 'left',
    }
  ];

  useEffect(() => {
    // Check if user has already completed onboarding
    const completed = localStorage.getItem('civic_stride_onboarding_completed');
    if (completed === 'true') {
      setIsVisible(false);
      return;
    }
    // Small delay to allow the DOM and Leaflet map to fully initialize
    const timer = setTimeout(() => {
      setIsVisible(true);
      updateHighlightCoordinates();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Update target coordinates whenever step changes
  useEffect(() => {
    if (isVisible) {
      updateHighlightCoordinates();
    }
  }, [currentStep, isVisible]);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      if (isVisible) updateHighlightCoordinates();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentStep, isVisible]);

  const updateHighlightCoordinates = () => {
    const step = steps[currentStep];
    const element = document.getElementById(step.targetId);

    if (element) {
      const rect = element.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
      // Scroll into view if needed
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // Fallback to center if element not found yet
      setCoords({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 150,
        width: 300,
        height: 200
      });
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('civic_stride_onboarding_completed', 'true');
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const activeStep = steps[currentStep];

  // Compute position for the tooltip box based on the target coordinates and placement
  const getTooltipStyle = () => {
    if (activeStep.placement === 'right') {
      return {
        top: `${coords.top + coords.height / 2 - 90}px`,
        left: `${coords.left + coords.width + 16}px`,
      };
    }
    if (activeStep.placement === 'left') {
      return {
        top: `${coords.top + coords.height / 2 - 90}px`,
        left: `${coords.left - 336}px`, // 320px width + 16px offset
      };
    }
    if (activeStep.placement === 'top') {
      return {
        top: `${coords.top - 200}px`,
        left: `${coords.left + coords.width / 2 - 160}px`,
      };
    }
    // Fallback/Center
    return {
      top: '30%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      position: 'fixed' as const,
    };
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none select-none">

      {/* SVG Spotlight Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto" style={{ filter: 'none' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Draw a black rounded rectangle to cut out the highlighted element */}
            <rect
              x={coords.left - 4}
              y={coords.top - 4}
              width={coords.width + 8}
              height={coords.height + 8}
              rx="6"
              ry="6"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(30, 41, 59, 0.4)"
          mask="url(#spotlight-mask)"
          onClick={handleSkip}
          className="cursor-pointer"
        />
      </svg>

      {/* Guided Tooltip Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.25, cubicBezier: [0.4, 0, 0.2, 1] }}
          style={getTooltipStyle()}
          className="absolute w-80 bg-white border border-[#E5E2DC] shadow-editorialMd rounded-md p-6 pointer-events-auto flex flex-col gap-4 text-left z-10"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-[#F5F5F0] pb-2">
            <span className="text-[10px] font-mono tracking-wider text-[#2E4F3B] uppercase font-bold flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Workspace Guide
            </span>
            <span className="text-[9px] font-mono text-[#94A3B8]">
              {currentStep + 1} of {steps.length}
            </span>
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <h4 className="font-serif text-sm font-semibold text-[#1E293B] tracking-tight">
              {activeStep.title}
            </h4>
            <p className="text-xs text-slate-600 font-light leading-relaxed">
              {activeStep.content}
            </p>
          </div>

          {/* Actions & Steps */}
          <div className="flex justify-between items-center border-t border-[#F5F5F0] pt-3 mt-1">
            <button
              onClick={handleSkip}
              className="text-[10px] font-mono text-[#64748B] hover:text-[#1E293B] uppercase font-medium transition-colors"
            >
              Skip Intro
            </button>

            <button
              onClick={handleNext}
              className="editorial-button-primary py-1.5 px-3 text-[10px] flex items-center gap-1"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <span>Begin Planning</span>
                  <Check className="h-3 w-3" />
                </>
              ) : (
                <>
                  <span>Next Step</span>
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
