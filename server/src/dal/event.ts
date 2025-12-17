import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types";
import type { EventCategory } from "@ballroomcompmanager/shared";

type SupabaseClientType = SupabaseClient<Database>;

// Centralized field selection for basic event queries
const EVENT_FIELDS =
  "id, name, comp_id, dance_style, event_level, ruleset_id, entry_type, start_at, end_at" as const;

// Enriched fields with direct joins to dance_styles, event_levels, and rulesets
const EVENT_FIELDS_ENRICHED = `
  id,
  name,
  comp_id,
  entry_type,
  start_at,
  end_at,
  dance_style:dance_style (
    id,
    name
  ),
  event_level:event_level (
    id,
    name
  ),
  ruleset:ruleset_id (
    id,
    name,
    scoring_method:scoring_method_id (
      id,
      name
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

/**
 * Look up dance style ID by name
 */
export async function lookupDanceStyleId(
  supabase: SupabaseClientType,
  styleName: string,
): Promise<{ data: string | null; error: any }> {
  const { data: danceStyle, error } = await supabase
    .from("dance_styles")
    .select("id")
    .eq("name", styleName)
    .single();

  if (error || !danceStyle) {
    return {
      data: null,
      error: error || new Error(`Dance style '${styleName}' not found`),
    };
  }

  return { data: danceStyle.id, error: null };
}

/**
 * Look up event level ID by name
 */
export async function lookupEventLevelId(
  supabase: SupabaseClientType,
  levelName: string,
): Promise<{ data: string | null; error: any }> {
  const { data: eventLevel, error } = await supabase
    .from("event_levels")
    .select("id")
    .eq("name", levelName)
    .single();

  if (error || !eventLevel) {
    return {
      data: null,
      error: error || new Error(`Event level '${levelName}' not found`),
    };
  }

  return { data: eventLevel.id, error: null };
}
