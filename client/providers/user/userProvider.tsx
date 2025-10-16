"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/providers/auth/authProvider";
import { trpc } from "@/lib/trpc";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Extended user type combining Supabase auth user with profile data
export interface ExtendedUser {
  // From Supabase auth.users table
  id: string;
  email?: string;
  emailConfirmed?: boolean;
  
  // From user_info table  
  firstname?: string | null;
  lastname?: string | null;
  role?: string;
  createdAt?: string;
  
  // Computed fields
  displayName?: string;
  isProfileComplete?: boolean;
}

type UserContextType = {
  // User data
  user: ExtendedUser | null;
  profile: any | null; // Raw profile data from user_info table
  
  // Loading states
  loading: boolean;
  profileLoading: boolean;
  
  // Auth methods (delegated to auth provider)
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  
  // Profile methods
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: {
    firstname?: string;
    lastname?: string;
    email?: string;
  }) => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  loading: true,
  profileLoading: true,
  signIn: async () => ({ data: null, error: null }),
  signUp: async () => ({ data: null, error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
  updateProfile: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const [extendedUser, setExtendedUser] = useState<ExtendedUser | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch user profile from user_info table
  const { 
    data: profile, 
    isLoading: isProfileLoading, 
    error: profileError,
    refetch: refetchProfile 
  } = trpc.user.getMyProfile.useQuery(
    undefined,
    { 
      enabled: !!authUser && !authLoading,
      refetchOnMount: true,
      staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    }
  );

  // Update profile data when query data changes
  useEffect(() => {
    if (profile) {
      setProfileData(profile);
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = trpc.user.completeProfile.useMutation({
    onSuccess: (updatedProfile) => {
      setProfileData(updatedProfile);
      // Trigger a refetch to ensure we have the latest data
      refetchProfile();
    }
  });

  // Combine auth user with profile data
  useEffect(() => {
    if (!authUser) {
      setExtendedUser(null);
      setProfileData(null);
      return;
    }

    // Helper functions for computed properties
    const getDisplayName = (firstname: string | null, lastname: string | null, email: string | undefined) => {
      if (firstname && lastname) {
        return `${firstname} ${lastname}`.trim();
      }
      if (firstname) return firstname;
      if (lastname) return lastname;
      return email || "User";
    };

    const getIsProfileComplete = (firstname: string | null, lastname: string | null) => {
      return !!(firstname?.trim() && lastname?.trim());
    };

    // Create extended user object
    const extended: ExtendedUser = {
      id: authUser.id,
      email: authUser.email,
      emailConfirmed: authUser.email_confirmed_at != null,
      
      // Profile data (will be null initially until profile loads)
      firstname: profile?.firstname || null,
      lastname: profile?.lastname || null,
      role: profile?.role || "user",
      createdAt: profile?.created_at,
      
      // Computed fields
      displayName: getDisplayName(profile?.firstname || null, profile?.lastname || null, authUser.email),
      isProfileComplete: getIsProfileComplete(profile?.firstname || null, profile?.lastname || null)
    };

    setExtendedUser(extended);
  }, [authUser, profile]);

  // Update profile loading state
  useEffect(() => {
    setProfileLoading(isProfileLoading);
  }, [isProfileLoading]);

  // Methods
  const refreshProfile = async () => {
    if (authUser) {
      await refetchProfile();
    }
  };

  const updateProfile = async (updates: {
    firstname?: string;
    lastname?: string;
    email?: string;
  }) => {
    if (!authUser) {
      throw new Error("User not authenticated");
    }

    try {
      await updateProfileMutation.mutateAsync({
        firstname: updates.firstname || "",
        lastname: updates.lastname || "",
        email: updates.email || authUser.email || "",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const contextValue: UserContextType = {
    user: extendedUser,
    profile: profileData,
    loading: authLoading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateProfile,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// Convenience hooks
export function useUserProfile() {
  const { user, profile, profileLoading, refreshProfile, updateProfile } = useUser();
  return { user, profile, loading: profileLoading, refreshProfile, updateProfile };
}

export function useProfileStatus() {
  const { user, profileLoading } = useUser();
  
  return {
    isComplete: user?.isProfileComplete || false,
    loading: profileLoading,
    missingFields: {
      firstname: !user?.firstname?.trim(),
      lastname: !user?.lastname?.trim(),
    },
    hasUser: !!user,
  };
}