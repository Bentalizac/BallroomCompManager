import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Server-side Supabase client with service role key for export operations
let supabaseAdmin: SupabaseClient<Database> | null = null;

/**
 * Get admin Supabase client (service role key)
 * Used for CSV exports and other admin operations that bypass RLS
 */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!supabaseAdmin) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required'
      );
    }
    
    supabaseAdmin = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }
  
  return supabaseAdmin;
}

/**
 * Get anonymous Supabase client (respects RLS, no user context)
 * Used for public operations like viewing competitions, events
 */
export function getSupabaseAnon(): SupabaseClient<Database> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required'
    );
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Get user-context Supabase client (respects RLS with user context)
 * Used when we need to perform operations as a specific authenticated user
 */
export function getSupabaseUser(userToken: string): SupabaseClient<Database> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required'
    );
  }
  
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey);
  
  // Set the user's JWT token to respect RLS with user context
  client.auth.setSession({
    access_token: userToken,
    refresh_token: '', // Not needed for server-side operations
  });
  
  return client;
}

/**
 * Verify if a user is an admin for a specific competition
 * Used for gating CSV export endpoints
 */
export async function isCompetitionAdmin(
  userId: string, 
  competitionId: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('competition_admins')
      .select('id')
      .eq('user_id', userId)
      .eq('comp_id', competitionId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking competition admin:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in isCompetitionAdmin:', error);
    return false;
  }
}

/**
 * Get competition ID from event ID
 */
export async function getCompetitionIdFromEvent(eventId: string): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('event_info')
      .select('comp_id')
      .eq('id', eventId)
      .single();
    
    if (error) {
      console.error('Error getting competition ID from event:', error);
      return null;
    }
    
    return data.comp_id;
  } catch (error) {
    console.error('Error in getCompetitionIdFromEvent:', error);
    return null;
  }
}
