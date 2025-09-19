import { supabase } from "@/lib/supabaseClient";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

// Auth service interface
export interface AuthService {
  signUp(email: string, password: string): Promise<{ data: any; error: any }>;
  signIn(email: string, password: string): Promise<{ data: any; error: any }>;
  signOut(): Promise<{ error: any }>;
  getCurrentSession(): Promise<{ data: { session: Session | null }; error: any }>;
  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): { data: { subscription: { unsubscribe: () => void } } };
  getCurrentUser(): Promise<User | null>;
}

// Supabase implementation of AuthService
class SupabaseAuthService implements AuthService {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  async getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();
    return { data: { session: data.session }, error };
  }

  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return supabase.auth.onAuthStateChange(callback);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }
      return data.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}

// Export singleton instance
const authService: AuthService = new SupabaseAuthService();

export default authService;
