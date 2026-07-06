import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X, Upload, User, Trash2 } from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToStats: () => void;
}

export default function UserProfile({ isOpen, onClose, onNavigateToStats }: UserProfileProps) {
  const { user, logout } = useContext(AuthContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Avatar profile photo state with local storage persistence
  const [avatar, setAvatar] = useState<string | null>(() => {
    if (!user) return null;
    return localStorage.getItem(`civic_stride_avatar_${user.username}`) || null;
  });

  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen || !user) return null;

  const userEmail = localStorage.getItem(`civic_stride_email_${user.username}`) || `${user.username.toLowerCase()}@civicstride.org`;
  const joinDate = localStorage.getItem(`civic_stride_joindate_${user.username}`) || 'July 6, 2026';
  const accountTier = 'Academic Specialist (Tier II)';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatar(dataUrl);
      localStorage.setItem(`civic_stride_avatar_${user.username}`, dataUrl);
      
      // Also update small initials glyph around the app where applicable
      window.dispatchEvent(new Event('avatar_updated'));
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    localStorage.removeItem(`civic_stride_avatar_${user.username}`);
    window.dispatchEvent(new Event('avatar_updated'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#F5F5F0]/80 backdrop-blur-[4px] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Simplified Profile Card */}
      <div className="relative w-full max-w-md bg-white border border-[#E5E2DC] rounded-md shadow-editorialMd p-8 z-10 flex flex-col gap-6 font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-[#F5F5F0] pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-[#2E4F3B] uppercase font-semibold">
              Identity Profile
            </span>
            <h2 className="text-xl font-serif font-medium text-[#1E293B] tracking-tight">
              {user.username}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-[#94A3B8] hover:text-[#475569] transition-colors rounded-full hover:bg-[#F5F5F0]"
            aria-label="Close Profile"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Interactive Avatar Upload Zone */}
        <div className="flex flex-col items-center gap-4 py-2">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-28 h-28 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 relative group select-none ${
              isDragging ? 'border-[#2E4F3B] bg-[#E8F5E9]/30' : 'border-[#C5C2BB] hover:border-[#2E4F3B] hover:bg-[#FAF9F6]'
            }`}
          >
            {avatar ? (
              <>
                <img src={avatar} alt="Profile Photo" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#1E293B]/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-mono uppercase tracking-wider transition-opacity duration-200">
                  <Upload className="h-4.5 w-4.5 mb-1" />
                  <span>Replace</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-[#64748B] group-hover:text-[#2E4F3B]">
                <User className="h-8 w-8 stroke-[1.25] mb-1" />
                <span className="text-[9px] font-mono uppercase tracking-wider text-center px-2">Upload Photo</span>
              </div>
            )}
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />

          {avatar && (
            <button
              onClick={removeAvatar}
              className="flex items-center gap-1 text-[10px] font-mono text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded transition-all"
            >
              <Trash2 className="h-3 w-3" />
              <span>Remove Photo</span>
            </button>
          )}
        </div>

        {/* Minimal User Metadata Typography Grid */}
        <div className="space-y-4 bg-[#FAF9F6] border border-[#E5E2DC] p-5 rounded-md text-xs">
          <div className="grid grid-cols-2 gap-y-3.5">
            <div>
              <span className="block text-[9px] font-mono uppercase text-[#94A3B8] tracking-wider">Email Address</span>
              <span className="font-medium text-[#334155]">{userEmail}</span>
            </div>
            <div>
              <span className="block text-[9px] font-mono uppercase text-[#94A3B8] tracking-wider">Workspace Extents</span>
              <span className="font-medium text-[#334155]">{user.location}</span>
            </div>
            <div>
              <span className="block text-[9px] font-mono uppercase text-[#94A3B8] tracking-wider">Access Authorization</span>
              <span className="font-medium text-[#334155]">{accountTier}</span>
            </div>
            <div>
              <span className="block text-[9px] font-mono uppercase text-[#94A3B8] tracking-wider">Verification Date</span>
              <span className="font-medium text-[#334155]">{joinDate}</span>
            </div>
          </div>
        </div>

        {/* Secondary View Routing Link */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              onNavigateToStats();
              onClose();
            }}
            className="text-xs text-[#2E4F3B] hover:text-[#1E3527] underline underline-offset-4 font-mono font-medium transition-colors"
          >
            Stats & Monitored Regions →
          </button>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#F5F5F0] pt-4 flex gap-3">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex-1 text-center text-xs font-mono tracking-wider text-red-700 hover:text-white hover:bg-red-700 border border-red-200 py-2.5 rounded transition-all duration-200"
          >
            Sign Out
          </button>
          <button
            onClick={onClose}
            className="flex-1 text-center text-xs font-mono tracking-wider text-[#475569] hover:bg-[#FAF9F6] border border-[#E5E2DC] py-2.5 rounded transition-all duration-200"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
}
