import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface User {
  username: string;
  location: string;
}

export interface ResidentRatings {
  roads: number[];
  footpaths: number[];
  parks: number[];
  dustbins: number[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  residentRatings: ResidentRatings;
  login: (username: string, location: string) => void;
  logout: () => void;
  submitRating: (category: keyof ResidentRatings, score: number) => void;
  getAverageRating: (category: keyof ResidentRatings) => number;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  residentRatings: { roads: [], footpaths: [], parks: [], dustbins: [] },
  login: () => {},
  logout: () => {},
  submitRating: () => {},
  getAverageRating: () => 0,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [residentRatings, setResidentRatings] = useState<ResidentRatings>({
    roads: [4, 4, 5, 4],
    footpaths: [3, 3, 2, 4],
    parks: [4, 3, 4, 4],
    dustbins: [2, 2, 3, 1],
  });

  // Load profile from localStorage if present
  useEffect(() => {
    const savedUser = localStorage.getItem('civic_stride_user');
    const savedLocation = localStorage.getItem('civic_stride_location');
    if (savedUser && savedLocation) {
      setUser({ username: savedUser, location: savedLocation });
      setIsAuthenticated(true);
    }

    const savedRatings = localStorage.getItem('civic_stride_ratings');
    if (savedRatings) {
      try {
        setResidentRatings(JSON.parse(savedRatings));
      } catch (e) {
        console.error('Failed to parse saved ratings', e);
      }
    }
  }, []);

  const login = (username: string, location: string) => {
    const newUser = { username, location };
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('civic_stride_user', username);
    localStorage.setItem('civic_stride_location', location);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('civic_stride_user');
    localStorage.removeItem('civic_stride_location');
  };

  const submitRating = (category: keyof ResidentRatings, score: number) => {
    const cleanScore = Math.max(1, Math.min(5, Math.round(score)));
    
    setResidentRatings((prev) => {
      const updated = {
        ...prev,
        [category]: [...prev[category], cleanScore],
      };
      localStorage.setItem('civic_stride_ratings', JSON.stringify(updated));
      return updated;
    });
  };

  const getAverageRating = (category: keyof ResidentRatings): number => {
    const ratings = residentRatings[category];
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, curr) => acc + curr, 0);
    return Number((sum / ratings.length).toFixed(1));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        residentRatings,
        login,
        logout,
        submitRating,
        getAverageRating,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
