import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { login } = useContext(AuthContext);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('San Francisco, CA');
  
  // Form visual & validation states
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (isSignUp) {
      if (!username.trim()) {
        setError('Username is required.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    } else {
      if (!email.trim()) {
        setError('Username or Email is required.');
        return;
      }
      if (!password) {
        setError('Password is required.');
        return;
      }
    }

    setIsLoading(true);

    // Simulate clean network latency for professional micro-interaction feel
    setTimeout(() => {
      setIsLoading(false);
      const activeUser = isSignUp ? username : (email.includes('@') ? email.split('@')[0] : email);
      login(activeUser, location);
      
      // Save supplementary signup metadata to localStorage
      if (isSignUp) {
        localStorage.setItem(`civic_stride_email_${activeUser}`, email);
      }
      
      onSuccess?.();
      onClose();
    }, 800);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#F5F5F0]/80 backdrop-blur-[4px] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white border border-[#E5E2DC] rounded-md shadow-editorialMd p-8 z-10 transition-transform duration-300 transform scale-100 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-medium text-[#1E293B]">
              {isSignUp ? 'Initialize Workspace' : 'Resume Analytics Session'}
            </h2>
            <p className="text-xs text-[#64748B] font-sans font-light">
              {isSignUp 
                ? 'Create a secure urbanist key to start saving analysis regions.' 
                : 'Enter your credentials to access stored weights and maps.'
              }
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-[#94A3B8] hover:text-[#475569] transition-colors rounded-full hover:bg-[#F5F5F0]"
            aria-label="Close Auth Modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Validation Errors */}
        {error && (
          <div className="bg-red-50/50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded font-sans flex items-center justify-between">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div className="editorial-input-group">
              <label className="editorial-input-label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. urbanist_clara"
                className="editorial-input"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="editorial-input-group">
            <label className="editorial-input-label">
              {isSignUp ? 'Email Address' : 'Username or Email'}
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isSignUp ? "e.g. clara@mit.edu" : "e.g. clara@mit.edu or urbanist_clara"}
              className="editorial-input"
              disabled={isLoading}
            />
          </div>

          {isSignUp && (
            <div className="editorial-input-group">
              <label className="editorial-input-label">Default District Boundary</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="editorial-input"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="editorial-input-group">
            <label className="editorial-input-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="editorial-input pr-8"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-2 text-[#94A3B8] hover:text-[#475569] transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className="editorial-input-group">
              <label className="editorial-input-label">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="editorial-input"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full editorial-button-primary disabled:opacity-60 flex items-center justify-center gap-2 mt-2 h-11"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-[#FAF9F6] border-t-transparent rounded-full animate-spin" />
                Synchronizing...
              </span>
            ) : (
              <>
                {isSignUp ? 'Generate Key & Sign Up' : 'Unlock Session'}
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="border-t border-[#E5E2DC] pt-4 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-xs text-[#64748B] hover:text-[#2E4F3B] underline underline-offset-4 font-mono font-medium transition-colors"
          >
            {isSignUp 
              ? 'Already registered? Unlock existing session' 
              : 'New to CivicStride? Register workspace'
            }
          </button>
        </div>

      </div>
    </div>
  );
}
