import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

type SupabaseClientType = SupabaseClient<Database>;

// Centralized field selection for basic event queries
const EVENT_FIELDS =
  "id, name, comp_id, category_ruleset_id, entry_type, start_at, end_at" as const;

// Enriched fields with category, ruleset, and scoring method for full domain mapping
const EVENT_FIELDS_ENRICHED = `
  id,
  name,
  comp_id,
  category_ruleset_id,
  entry_type,
  start_at,
  end_at,
  category_ruleset:category_ruleset_id (
    id,
    event_category:category_id (
      id,
      dance_style:dance_styles_id (
        id,
        name
      ),
      event_level:event_levels_id (
        id,
        name
      ),
    ),
    ruleset:ruleset_id (
      id,
      name,
      scoring_method:scoring_method_id (
        id,
        name
      )
    )
  )
` as const;

/**
 * Get events for a competition with basic fields
 */
export async function getCompetitionEvents(
  supabase: SupabaseClientType,
  competitionId: string,
): Promise<any> {
  return await supabase
    .from("event_info")
    .select(EVENT_FIELDS)
    .eq("comp_id", competitionId)
    .order("start_at", { ascending: true, nullsFirst: false });
}

/**
 * Get events for a competition with enriched data (category, ruleset, scoring)
 */
export async function getCompetitionEventsEnriched(
  supabase: SupabaseClientType,
  competitionId: string,
): Promise<any> {
  return await supabase
    .from("event_info")
    .select(EVENT_FIELDS_ENRICHED)
    .eq("comp_id", competitionId)
    .order("start_at", { ascending: true, nullsFirst: false });
}

/**
 * Get single event by ID with basic fields
 */
export async function getEventById(
  supabase: SupabaseClientType,
  eventId: string,
): Promise<any> {
  return await supabase
    .from("event_info")
    .select(EVENT_FIELDS)
    .eq("id", eventId)
    .single();
}

/**
 * Get single event by ID with enriched data
 */
export async function getEventByIdEnriched(
  supabase: SupabaseClientType,
  eventId: string,
): Promise<any> {
  return await supabase
    .from("event_info")
    .select(EVENT_FIELDS_ENRICHED)
    .eq("id", eventId)
    .single();
}

/**
 * Create a new event
 */
export async function createEvent(
  supabase: SupabaseClientType,
  data: Record<string, any>,
): Promise<any> {
  return await supabase
    .from("event_info")
    .insert(data as any)
    .select(EVENT_FIELDS_ENRICHED)
    .single();
}

/**
 * Update an event
 */
export async function updateEvent(
  supabase: SupabaseClientType,
  eventId: string,
  data: Partial<{
    name: string;
    start_at: string | null;
    end_at: string | null;
    start_date: string | null;
    end_date: string | null;
  }>,
): Promise<any> {
  return await supabase
    .from("event_info")
    .update(data as any)
    .eq("id", eventId)
    .select(EVENT_FIELDS_ENRICHED)
    .single();
}

/**
 * Delete an event
 */
export async function deleteEvent(
  supabase: SupabaseClientType,
  eventId: string,
): Promise<any> {
  return await supabase.from("event_info").delete().eq("id", eventId);
}

/**
 * Get event's competition ID
 */
export async function getEventCompetitionId(
  supabase: SupabaseClientType,
  eventId: string,
): Promise<any> {
  return await supabase
    .from("event_info")
    .select("comp_id")
    .eq("id", eventId)
    .single();
}

export async function getOrCreateEventCategory(
  supabase: SupabaseClientType,
  danceStyleId: string,
  eventLevelId: string,
): Promise<any> {
  // First try to get existing
  const { data: existing, error: fetchError } = await supabase
    .from("event_categories")
    .select("id")
    .eq("dance_style", danceStyleId)
    .eq("event_level", eventLevelId)
    .maybeSingle();

  if (!fetchError && existing) {
    return { data: existing, error: null };
  }

  // If not found (PGRST116), create it
  if (fetchError && fetchError.code === "PGRST116") {
    return await supabase
      .from("event_categories")
      .insert({
        dance_style: danceStyleId,
        event_levels: eventLevelId,
      })
      .select("id")
      .single();
  }

  // Return the error if it wasn't a "not found" error
  return { data: null, error: fetchError };
}

/**
 * Get or create category-ruleset combination
 */
export async function getOrCreateCategoryRuleset(
  supabase: SupabaseClientType,
  categoryId: string,
  rulesetId: string,
): Promise<any> {
  // First try to get existing
  const { data: existing, error: fetchError } = await supabase
    .from("category_ruleset")
    .select("id")
    .eq("category_id", categoryId)
    .eq("ruleset_id", rulesetId)
    .single();

  if (!fetchError && existing) {
    return { data: existing, error: null };
  }

  // If not found (PGRST116), create it
  if (fetchError && fetchError.code === "PGRST116") {
    return await supabase
      .from("category_ruleset")
      .insert({
        category_id: categoryId,
        ruleset_id: rulesetId,
      })
      .select("id")
      .single();
  }

  // Return the error if it wasn't a "not found" error
  return { data: null, error: fetchError };
}
