import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

type SupabaseClientType = SupabaseClient<Database>;

/**
 * Get all venues
 */
export async function getAllVenues(supabase: SupabaseClientType) {
  return await supabase
    .from('venue')
    .select('*')
    .order('name', { ascending: true });
}

/**
 * Get all event categories
 */
export async function getAllEventCategories(supabase: SupabaseClientType) {
  return await supabase
    .from('event_categories')
    .select('*')
    .order('name', { ascending: true });
}

/**
 * Get all rulesets with scoring methods
 */
export async function getAllRulesets(supabase: SupabaseClientType) {
  return await supabase
    .from('rulesets')
    .select(
      `
      *,
      scoring_methods (
        id,
        name,
        description
      )
      `
    )
    .order('name', { ascending: true });
}

/**
 * Get all scoring methods
 */
export async function getAllScoringMethods(supabase: SupabaseClientType) {
  return await supabase
    .from('scoring_methods')
    .select('*')
    .order('name', { ascending: true });
}

/**
 * Create a new venue
 */
export async function createVenue(
  supabase: SupabaseClientType,
  data: {
    name: string;
    street: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
    google_maps_url: string | null;
  }
) {
  return await supabase
    .from('venue')
    .insert(data)
    .select()
    .single();
}
