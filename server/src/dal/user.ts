import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

type SupabaseClientType = SupabaseClient<Database>;

// Centralized field selections
const USER_REGISTRATION_FIELDS = `
  id,
  role,
  registration_status,
  event_info (
    id,
    name,
    start_date,
    end_date,
    event_status,
    comp_id,
    comp_info:comp_id (
      id,
      name,
      start_date,
      end_date
    )
  ),
  comp_participant!inner (
    user_id
  )
` as const;

const COMP_PARTICIPANT_FIELDS = `
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
` as const;

/**
 * Get all event registrations for a user
 */
export async function getUserEventRegistrations(
  supabase: SupabaseClientType,
  userId: string
) {
  return await supabase
    .from('event_registrations')
    .select(USER_REGISTRATION_FIELDS)
    .eq('comp_participant.user_id', userId)
    .order('event_info.start_date', { ascending: true });
}

/**
 * Check if user is already registered for a competition
 */
export async function checkCompetitionRegistration(
  supabase: SupabaseClientType,
  userId: string,
  competitionId: string
) {
  return await supabase
    .from('comp_participant')
    .select('id')
    .eq('user_id', userId)
    .eq('comp_id', competitionId);
}

/**
 * Create competition participant entries for user
 */
export async function createCompetitionParticipants(
  supabase: SupabaseClientType,
  userId: string,
  competitionId: string,
  roles: Array<'spectator' | 'competitor' | 'organizer' | 'judge'>
) {
  const inserts = roles.map(role => ({
    user_id: userId,
    comp_id: competitionId,
    role,
    participation_status: 'active' as const,
  }));

  return await supabase
    .from('comp_participant')
    .insert(inserts)
    .select();
}

/**
 * Update user profile
 */
export async function updateUserInfo(
  supabase: SupabaseClientType,
  userId: string,
  data: {
    firstname?: string;
    lastname?: string;
    email?: string;
  }
) {
  return await supabase
    .from('user_info')
    .update(data)
    .eq('id', userId)
    .select()
    .single();
}

/**
 * Check if user is competition admin
 */
export async function checkUserIsCompetitionAdmin(
  supabase: SupabaseClientType,
  competitionId: string,
  userId: string
) {
  return await supabase
    .from('competition_admins')
    .select('id')
    .eq('comp_id', competitionId)
    .eq('user_id', userId)
    .single();
}

/**
 * Get user's participant roles in competition
 */
export async function getUserParticipantRoles(
  supabase: SupabaseClientType,
  competitionId: string,
  userId: string
) {
  return await supabase
    .from('comp_participant')
    .select('id, role, participation_status')
    .eq('comp_id', competitionId)
    .eq('user_id', userId)
    .eq('participation_status', 'active');
}

/**
 * Create organizer participant role for user
 */
export async function createOrganizerParticipant(
  supabase: SupabaseClientType,
  competitionId: string,
  userId: string
) {
  return await supabase
    .from('comp_participant')
    .insert({
      user_id: userId,
      comp_id: competitionId,
      role: 'organizer',
      participation_status: 'active',
    });
}
