import { useContext } from 'react';
import { NavigationContext } from '../App';
import { Home } from 'lucide-react';

export default function SidebarHeader() {
  const { navigate } = useContext(NavigationContext);

  return (
    <div className="flex items-center justify-between border-b border-[#E5E2DC] pb-4 mb-2">
      {/* Brand Signpost */}
      <span className="font-serif text-lg font-medium tracking-tight text-[#1E293B] select-none">
        CivicStride
      </span>

      {/* Minimalist Home Routing Node */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-[10px] font-mono text-[#64748B] hover:text-[#2E4F3B] hover:bg-[#F5F5F0] border border-[#E5E2DC] px-2.5 py-1.5 rounded transition-all tracking-wider uppercase font-semibold cursor-pointer"
        title="Go back to Home landing page"
      >
        <Home className="h-3 w-3 text-[#64748B] hover:text-[#2E4F3B]" />
        <span>Home</span>
      </button>
    </div>
  );
}
