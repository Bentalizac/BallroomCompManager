import { supabase } from '@/lib/supabaseClient';

async function signUp(email: string, password: string) {

  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
}

async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

const authService = {
    signUp,
    signIn,
};

export default authService;