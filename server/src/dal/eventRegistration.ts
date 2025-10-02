import { getSupabaseUser, getSupabaseAdmin } from './supabase';
import type { Database } from './database.types';

type EventRegistration = Database['public']['Tables']['event_registration']['Row'];
type EventRegistrationInsert = Database['public']['Tables']['event_registration']['Insert'];
type CompParticipant = Database['public']['Tables']['comp_participant']['Row'];
type UserInfo = Database['public']['Tables']['user_info']['Row'];

/**
 * Register a user for a specific event
 */
export async function registerUserForEvent(
  userId: string,
  eventId: string,
  role: 'competitor' | 'judge' | 'scrutineer' = 'competitor'
): Promise<EventRegistration> {
  // Use admin client to bypass RLS for system operations
  const supabase = getSupabaseAdmin();
  
  console.log('🎯 Starting event registration:', { userId, eventId, role });

  // 1. Get the event info to find the competition ID
  const { data: eventInfo, error: eventError } = await supabase
    .from('event_info')
    .select('id, comp_id, name')
    .eq('id', eventId)
    .single();
    
  if (eventError || !eventInfo) {
    console.error('❌ Event not found:', eventError);
    throw new Error(`Event not found: ${eventId}`);
  }
  
  console.log('✅ Found event:', eventInfo.name, 'in competition:', eventInfo.comp_id);

  // 2. Check if user exists in user_info table
  const { data: existingUserInfo, error: userInfoError } = await supabase
    .from('user_info')
    .select('id, email, firstname, lastname')
    .eq('id', userId)
    .single();
    
  if (userInfoError && userInfoError.code !== 'PGRST116') { // PGRST116 = not found
    console.error('❌ Error checking user_info:', userInfoError);
    throw new Error('Error checking user information');
  }

  // 3. If user doesn't exist in user_info, create them
  // Note: In production, this might be handled by triggers when users sign up
  if (!existingUserInfo) {
    console.log('👤 User not found in user_info, will be created by trigger or needs manual creation');
    // For now, we'll assume the user_info entry should exist
    throw new Error('User information not found. Please ensure user profile is complete.');
  }

  console.log('✅ User info found:', existingUserInfo.email);

  // 4. Check if user is already a participant in this competition
  let { data: compParticipant, error: participantError } = await supabase
    .from('comp_participant')
    .select('id, role, participation_status')
    .eq('user_id', userId)
    .eq('comp_id', eventInfo.comp_id)
    .single();

  // If participant doesn't exist, create them
  if (participantError && participantError.code === 'PGRST116') {
    console.log('👥 Creating comp_participant entry...');
    
    const participantRole = role === 'competitor' ? 'competitor' : 'judge';
    
    const { data: newParticipant, error: createParticipantError } = await supabase
      .from('comp_participant')
      .insert({
        user_id: userId,
        comp_id: eventInfo.comp_id,
        role: participantRole,
        participation_status: 'active'
      })
      .select()
      .single();
      
    if (createParticipantError || !newParticipant) {
      console.error('❌ Error creating comp_participant:', createParticipantError);
      throw new Error('Failed to create participant record');
    }
    
    compParticipant = newParticipant;
    console.log('✅ Created comp_participant:', compParticipant.id);
  } else if (participantError) {
    console.error('❌ Error checking comp_participant:', participantError);
    throw new Error('Error checking participant status');
  }

  if (!compParticipant) {
    throw new Error('Failed to get or create participant record');
  }

  console.log('✅ Comp participant found/created:', compParticipant.id);

  // 5. Check if user is already registered for this specific event
  const { data: existingRegistration, error: registrationCheckError } = await supabase
    .from('event_registration')
    .select('id, role, registration_status')
    .eq('comp_participant_id', compParticipant.id)
    .eq('event_info_id', eventId)
    .single();
    
  if (registrationCheckError && registrationCheckError.code !== 'PGRST116') {
    console.error('❌ Error checking existing registration:', registrationCheckError);
    throw new Error('Error checking existing registration');
  }

  if (existingRegistration) {
    console.log('⚠️  User already registered for this event');
    throw new Error('User is already registered for this event');
  }

  // 6. Create the event registration
  console.log('📝 Creating event registration...');
  const { data: registration, error: registrationError } = await supabase
    .from('event_registration')
    .insert({
      comp_participant_id: compParticipant.id,
      event_info_id: eventId,
      role: role,
      registration_status: 'active'
    })
    .select()
    .single();
    
  if (registrationError || !registration) {
    console.error('❌ Error creating event registration:', registrationError);
    throw new Error('Failed to create event registration');
  }

  console.log('🎉 Event registration created successfully:', registration.id);
  return registration;
}

/**
 * Get user's registrations for a competition
 */
export async function getUserEventRegistrations(
  userId: string,
  competitionId: string
): Promise<EventRegistration[]> {
  const supabase = getSupabaseAdmin();
  
  const { data: registrations, error } = await supabase
    .from('event_registration')
    .select(`
      *,
      event_info (
        id,
        name,
        start_date,
        end_date,
        event_status
      ),
      comp_participant!inner (
        id,
        user_id,
        comp_id
      )
    `)
    .eq('comp_participant.user_id', userId)
    .eq('comp_participant.comp_id', competitionId);
    
  if (error) {
    console.error('Error fetching user registrations:', error);
    throw new Error('Failed to fetch user registrations');
  }
  
  return registrations || [];
}

/**
 * Cancel/withdraw from an event registration  
 */
export async function cancelEventRegistration(
  userId: string,
  registrationId: string
): Promise<void> {
  const supabase = getSupabaseAdmin();
  
  // First verify the registration belongs to the user
  const { data: registration, error: fetchError } = await supabase
    .from('event_registration')
    .select(`
      id,
      comp_participant!inner (
        user_id
      )
    `)
    .eq('id', registrationId)
    .eq('comp_participant.user_id', userId)
    .single();
    
  if (fetchError || !registration) {
    throw new Error('Registration not found or access denied');
  }
  
  // Update registration status to cancelled
  const { error: updateError } = await supabase
    .from('event_registration')
    .update({ registration_status: 'cancelled' })
    .eq('id', registrationId);
    
  if (updateError) {
    console.error('Error cancelling registration:', updateError);
    throw new Error('Failed to cancel registration');
  }
}