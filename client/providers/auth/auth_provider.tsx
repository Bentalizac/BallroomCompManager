import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

const AuthContext = createContext<User | null>(null);

export const AuthProvider = async ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>((await supabase.auth.getUser()).data?.user ?? null);
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
