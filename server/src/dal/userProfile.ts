import { getSupabaseUser } from './supabase';
import type { Database } from './database.types';

type UserInfo = Database['public']['Tables']['user_info']['Row'];

export interface ProfileUpdateData {
  email?: string;
  firstname?: string;
  lastname?: string;
}

export interface ProfileStatus {
  isComplete: boolean;
  missingFields: string[];
  profile?: UserInfo;
}

/**
 * Get user profile information
 */
export async function getUserProfile(
  userToken: string,
  userId: string
): Promise<UserInfo | null> {
  const supabase = getSupabaseUser(userToken);
  
  const { data: userInfo, error } = await supabase
    .from('user_info')
    .select('id, role, email, firstname, lastname, created_at')
    .eq('id', userId)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // User not found
      return null;
    }
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
  
  return userInfo;
}

/**
 * Update user profile information
 */
export async function updateUserProfile(
  userToken: string,
  userId: string,
  updates: ProfileUpdateData
): Promise<UserInfo> {
  const supabase = getSupabaseUser(userToken);
  
  const { data: updatedProfile, error } = await supabase
    .from('user_info')
    .update({
      email: updates.email,
      firstname: updates.firstname,
      lastname: updates.lastname
    })
    .eq('id', userId)
    .select('id, role, email, firstname, lastname, created_at')
    .single();
    
  if (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
  
  return updatedProfile;
}

/**
 * Check if user profile is complete and return status
 */
export async function checkProfileStatus(
  userToken: string,
  userId: string
): Promise<ProfileStatus> {
  const profile = await getUserProfile(userToken, userId);
  
  if (!profile) {
    return {
      isComplete: false,
      missingFields: ['profile_not_found'],
    };
  }
  
  const missingFields: string[] = [];
  
  if (!profile.email || profile.email.trim() === '') {
    missingFields.push('email');
  }
  if (!profile.firstname || profile.firstname.trim() === '') {
    missingFields.push('firstname');
  }
  if (!profile.lastname || profile.lastname.trim() === '') {
    missingFields.push('lastname');
  }
  
  return {
    isComplete: missingFields.length === 0,
    missingFields,
    profile
  };
}