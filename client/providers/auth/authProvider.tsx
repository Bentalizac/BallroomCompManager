"use client";

import { createContext, useContext, useEffect, useState } from "react";
import authService from "@/services/auth/auth";
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ data: null, error: null }),
  signUp: async () => ({ data: null, error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load current session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await authService.getCurrentSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();

    // Subscribe to login/logout events
    const {
      data: { subscription },
    } = authService.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    if (result.data?.user && !result.error) {
      setUser(result.data.user);
    }
    return result;
  };

  const signUp = async (email: string, password: string) => {
    const result = await authService.signUp(email, password);
    if (result.data?.user && !result.error) {
      setUser(result.data.user);
    }
    return result;
  };

  const signOut = async () => {
    try {
      const { error } = await authService.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      setUser(null);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        signIn, 
        signUp, 
        signOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
