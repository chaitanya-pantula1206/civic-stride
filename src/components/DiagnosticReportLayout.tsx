import { ReactNode, useContext } from 'react';
import { NavigationContext } from '../App';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { ChevronLeft } from 'lucide-react';

interface DiagnosticReportLayoutProps {
  title: string;
  description: string;
  indexName: string;
  children: ReactNode;
}

export default function DiagnosticReportLayout({
  title,
  description,
  indexName,
  children,
}: DiagnosticReportLayoutProps) {
  const { navigate } = useContext(NavigationContext);
  const { setActiveView } = useContext(WorkspaceContext);

  const handleBackToDashboard = () => {
    setActiveView('map');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1E293B] font-sans antialiased">
      {/* Editorial Header */}
      <header className="bg-white border-b border-[#E5E2DC] py-6 px-8 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 text-xs font-mono text-[#64748B] hover:text-[#1E293B] transition-colors group cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-[0.2em] font-mono text-[#2E4F3B] bg-[#E8F5E9] px-2.5 py-1 rounded-full font-semibold uppercase">
              {indexName}
            </span>
            <span className="text-xs text-[#64748B] font-mono select-none">CivicStride Analyzer</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-12 px-6 space-y-12">
        {/* Title Section */}
        <section className="space-y-4">
          <h1 className="text-4xl font-serif font-medium tracking-tight text-[#1E293B]">
            {title}
          </h1>
          <p className="text-base text-[#475569] font-light max-w-3xl leading-relaxed">
            {description}
          </p>
        </section>

        {children}
      </main>
    </div>
  );
}
