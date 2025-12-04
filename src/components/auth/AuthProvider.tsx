import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, authHelpers } from '../../lib/mvp-supabase';
import type { StudentProfile } from '../../lib/mvp-types';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  loading: boolean;
  session: any;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (user) {
      const { profile: userProfile } = await authHelpers.getCurrentProfile();
      setProfile(userProfile);
    }
  };

  const signOut = async () => {
    try {
      // Clear Supabase session
      await authHelpers.signOut();
      
      // Clear local state
      setUser(null);
      setProfile(null);
      
      // Clear any localStorage items
      localStorage.clear();
      sessionStorage.clear();
      
      // Force redirect to home (landing page)
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, clear local state
      setUser(null);
      setProfile(null);
      window.location.href = '/';
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setSession(session);
      
      if (session?.user) {
        const { profile: userProfile } = await authHelpers.getCurrentProfile();
        setProfile(userProfile);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setSession(session);
        
        if (session?.user) {
          const { profile: userProfile } = await authHelpers.getCurrentProfile();
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    session,
    loading,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};