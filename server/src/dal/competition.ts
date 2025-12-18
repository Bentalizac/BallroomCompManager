import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

type SupabaseClientType = SupabaseClient<Database>;

// Type for competition row with venue relation
type CompetitionRow = {
  id: string;
  slug: string;
  name: string;
  start_date: string;
  end_date: string;
  time_zone: string;
  venue: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    street: string | null;
    postal_code: string | null;
    country: string;
    google_maps_url: string | null;
  } | null;
};

// Centralized field selection - update here when schema changes
const COMPETITION_FIELDS = `
  id,
  slug,
  name,
  start_date,
  end_date,
  time_zone,
  venue:venue_id (
    id,
    name,
    city,
    state,
    street,
    postal_code,
    country,
    google_maps_url
  )
`;

const EVENT_FIELDS =
  "id, name, comp_id, dance_style, event_level, ruleset_id, entry_type, start_at, end_at" as const;
// The use of Promise<any> is intentional here since the typing of the returns was a cluster *word I won't put here*
/**
 * Get all competitions
 */
export async function getAllCompetitions(
  supabase: SupabaseClientType,
): Promise<any> {
  return await supabase
    .from("comp_info")
    .select(COMPETITION_FIELDS)
    .order("start_date", { ascending: true });
}

/**
 * Get competition by ID
 */
export async function getCompetitionById(
  supabase: SupabaseClientType,
  id: string,
): Promise<any> {
  return await supabase
    .from("comp_info")
    .select(COMPETITION_FIELDS)
    .eq("id", id)
    .single();
}

/**
 * Get competition by slug
 */
export async function getCompetitionBySlug(
  supabase: SupabaseClientType,
  slug: string,
): Promise<any> {
  return await supabase
    .from("comp_info")
    .select(COMPETITION_FIELDS)
    .eq("slug", slug)
    .single();
}

/**
 * Get events for a competition
 */
export async function getCompetitionEvents(
  supabase: SupabaseClientType,
  competitionId: string,
) {
  return await supabase
    .from("event_info")
    .select(EVENT_FIELDS)
    .eq("comp_id", competitionId)
    .order("start_at", { ascending: true, nullsFirst: false });
}

/**
 * Get competition time zone
 */
export async function getCompetitionTimeZone(
  supabase: SupabaseClientType,
  competitionId: string,
) {
  return await supabase
    .from("comp_info")
    .select("time_zone")
    .eq("id", competitionId)
    .single();
}

/**
 * Create a new competition
 */
export async function createCompetition(
  supabase: SupabaseClientType,
  data: {
    name: string;
    slug: string;
    start_date: string;
    end_date: string;
    time_zone: string;
    venue_id: string | null;
  },
) {
  return await supabase
    .from("comp_info")
    .insert(data)
    .select("id, slug, name, start_date, end_date, time_zone, venue_id")
    .single();
}

/**
 * Update a competition
 */
export async function updateCompetition(
  supabase: SupabaseClientType,
  id: string,
  data: Partial<{
    name: string;
    start_date: string;
    end_date: string;
    time_zone: string;
    venue_id: string | null;
  }>,
) {
  return await supabase
    .from("comp_info")
    .update(data)
    .eq("id", id)
    .select()
    .single();
}

/**
 * Delete a competition
 */
export async function deleteCompetition(
  supabase: SupabaseClientType,
  id: string,
) {
  return await supabase.from("comp_info").delete().eq("id", id);
}

/**
 * Check if user is admin of competition
 */
export async function isCompetitionAdmin(
  supabase: SupabaseClientType,
  competitionId: string,
  userId: string,
) {
  return await supabase
    .from("competition_admins")
    .select("id")
    .eq("comp_id", competitionId)
    .eq("user_id", userId)
    .single();
}

/**
 * Make user a competition admin
 */
export async function createCompetitionAdmin(
  supabase: SupabaseClientType,
  competitionId: string,
  userId: string,
) {
  return await supabase.from("competition_admins").insert({
    user_id: userId,
    comp_id: competitionId,
  });
}

/**
 * Make user a competition participant
 */
export async function createCompetitionParticipant(
  supabase: SupabaseClientType,
  competitionId: string,
  userId: string,
  role: "spectator" | "competitor" | "organizer" | "judge",
) {
  return await supabase.from("comp_participant").insert({
    user_id: userId,
    comp_id: competitionId,
    role,
    participation_status: "active",
  });
}

/**
 * Get user's registration for a competition
 */
export async function getUserCompetitionRegistration(
  supabase: SupabaseClientType,
  competitionId: string,
  userId: string,
) {
  return await supabase
    .from("comp_participant")
    .select(
      `
      user_id,
      role,
      participation_status,
      created_at,
      user_info!comp_participant_user_id_fkey (
        id,
        firstname,
        lastname,
        email,
        role,
        created_at
      )
      `,
    )
    .eq("comp_id", competitionId)
    .eq("user_id", userId)
    .single();
}

/**
 * Get all registrations for a competition
 */
export async function getCompetitionRegistrations(
  supabase: SupabaseClientType,
  competitionId: string,
) {
  return await supabase
    .from("comp_participant")
    .select(
      `
      user_id,
      role,
      participation_status,
      created_at,
      user_info!comp_participant_user_id_fkey (
        id,
        firstname,
        lastname,
        email,
        role,
        created_at
      )
      `,
    )
    .eq("comp_id", competitionId)
    .order("role", { ascending: true });
}

/**
 * Get all event registrations for a competition
 */
export async function getCompetitionEventRegistrations(
  supabase: SupabaseClientType,
  competitionId: string,
): Promise<any> {
  return await supabase
    .from("event_registrations")
    .select(
      `
      id,
      role,
      registration_status,
      event_info!inner (
        id,
        name,
        comp_id
      ),
      comp_participant (
        id,
        user_info (
          id,
          firstname,
          lastname,
          email
        )
      )
      `,
    )
    .eq("event_info.comp_id", competitionId)
    .order("event_info.start_date", { ascending: true });
}
