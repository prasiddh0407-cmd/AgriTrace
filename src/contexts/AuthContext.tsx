import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, type Profile, type Role } from '../lib/supabase';

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  signIn: (role: Role) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored mock profile or real session
    const stored = localStorage.getItem('agritrace_profile');
    if (stored) {
      setProfile(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const signIn = async (role: Role) => {
    // Simulating login for demo purposes
    const mockProfile: Profile = {
      id: Math.random().toString(36).substring(7),
      role,
      full_name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      wallet_address: `0x${Math.random().toString(16).substring(2, 12)}...`
    };
    setProfile(mockProfile);
    localStorage.setItem('agritrace_profile', JSON.stringify(mockProfile));
  };

  const signOut = async () => {
    setProfile(null);
    localStorage.removeItem('agritrace_profile');
  };

  return (
    <AuthContext.Provider value={{ profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
