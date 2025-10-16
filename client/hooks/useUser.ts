import { useUser as useUserContext } from "@/providers/user/userProvider";
import type { ExtendedUser } from "@/providers/user/userProvider";

/**
 * Main user hook - provides access to all user data and methods
 * 
 * @example
 * ```tsx
 * const { user, isAuthenticated, isLoading } = useUser();
 * 
 * if (isLoading) return <div>Loading...</div>;
 * if (!isAuthenticated) return <div>Please log in</div>;
 * 
 * return <div>Hello {user?.displayName}!</div>;
 * ```
 */
export function useUser() {
  const context = useUserContext();
  
  return {
    // User data
    user: context.user,
    profile: context.profile,
    
    // Computed states
    isAuthenticated: !!context.user,
    isLoading: context.loading,
    isProfileLoading: context.profileLoading,
    
    // Auth methods
    signIn: context.signIn,
    signUp: context.signUp,
    signOut: context.signOut,
    
    // Profile methods
    refreshProfile: context.refreshProfile,
    updateProfile: context.updateProfile,
  };
}

/**
 * Hook for checking user authentication status
 * 
 * @example
 * ```tsx
 * const { isAuthenticated, isLoading, user } = useAuth();
 * 
 * if (isLoading) return <Spinner />;
 * 
 * return isAuthenticated ? <DashboardPage /> : <LoginPage />;
 * ```
 */
export function useAuth() {
  const { user, loading } = useUserContext();
  
  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user: user,
  };
}

/**
 * Hook for profile completion status and missing fields
 * 
 * @example
 * ```tsx
 * const { isComplete, missingFields, requiresSetup } = useProfileCompletion();
 * 
 * if (requiresSetup) {
 *   return <ProfileSetupPrompt missingFields={missingFields} />;
 * }
 * ```
 */
export function useProfileCompletion() {
  const { user, profileLoading } = useUserContext();
  
  const missingFields = {
    firstname: !user?.firstname?.trim(),
    lastname: !user?.lastname?.trim(),
    email: !user?.email?.trim(),
  };
  
  const isComplete = user?.isProfileComplete || false;
  const requiresSetup = !!user && !isComplete;
  
  return {
    isComplete,
    requiresSetup,
    missingFields,
    isLoading: profileLoading,
    user,
  };
}

/**
 * Hook for user display information
 * 
 * @example
 * ```tsx
 * const { displayName, initials, hasAvatar } = useUserDisplay();
 * 
 * return (
 *   <div className="flex items-center">
 *     <Avatar fallback={initials} />
 *     <span>{displayName}</span>
 *   </div>
 * );
 * ```
 */
export function useUserDisplay() {
  const { user } = useUserContext();
  
  const getInitials = (firstname?: string | null, lastname?: string | null, email?: string) => {
    if (firstname && lastname) {
      return `${firstname[0]}${lastname[0]}`.toUpperCase();
    }
    if (firstname) return firstname[0].toUpperCase();
    if (lastname) return lastname[0].toUpperCase();
    if (email) return email[0].toUpperCase();
    return "U";
  };
  
  return {
    displayName: user?.displayName || "User",
    initials: getInitials(user?.firstname, user?.lastname, user?.email),
    firstname: user?.firstname,
    lastname: user?.lastname,
    email: user?.email,
    hasAvatar: false, // TODO: Implement avatar system
    user,
  };
}

/**
 * Hook for user role and permissions
 * 
 * @example
 * ```tsx
 * const { role, isAdmin, canManageUsers } = useUserRole();
 * 
 * return (
 *   <div>
 *     <p>Role: {role}</p>
 *     {canManageUsers && <AdminPanel />}
 *   </div>
 * );
 * ```
 */
export function useUserRole() {
  const { user } = useUserContext();
  
  const role = user?.role || "user";
  const isAdmin = role === "admin";
  const isModerator = role === "moderator" || isAdmin;
  
  return {
    role,
    isAdmin,
    isModerator,
    canManageUsers: isAdmin,
    canModerateContent: isModerator,
    user,
  };
}

/**
 * Hook for profile management operations
 * 
 * @example
 * ```tsx
 * const { updateProfile, isUpdating, refresh } = useProfileManager();
 * 
 * const handleSave = async (formData) => {
 *   await updateProfile({
 *     firstname: formData.firstName,
 *     lastname: formData.lastName
 *   });
 * };
 * ```
 */
export function useProfileManager() {
  const { updateProfile, refreshProfile, profileLoading, user } = useUserContext();
  
  const update = async (updates: {
    firstname?: string;
    lastname?: string;
    email?: string;
  }) => {
    try {
      await updateProfile(updates);
      return { success: true, error: null };
    } catch (error) {
      console.error("Profile update failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Update failed" 
      };
    }
  };
  
  return {
    updateProfile: update,
    refreshProfile,
    isUpdating: profileLoading,
    user,
    profile: user,
  };
}

/**
 * Hook for checking if user meets certain requirements
 * 
 * @example
 * ```tsx
 * const { canAccessFeature, missingRequirements } = useUserRequirements({
 *   requiresProfile: true,
 *   requiresEmail: true,
 *   requiredRole: "admin"
 * });
 * 
 * if (!canAccessFeature) {
 *   return <RequirementsMessage missing={missingRequirements} />;
 * }
 * ```
 */
export function useUserRequirements(requirements: {
  requiresAuth?: boolean;
  requiresProfile?: boolean;
  requiresEmail?: boolean;
  requiredRole?: string;
} = {}) {
  const { user } = useUserContext();
  
  const {
    requiresAuth = true,
    requiresProfile = false,
    requiresEmail = false,
    requiredRole,
  } = requirements;
  
  const missingRequirements: string[] = [];
  
  if (requiresAuth && !user) {
    missingRequirements.push("authentication");
  }
  
  if (requiresProfile && !user?.isProfileComplete) {
    missingRequirements.push("complete profile");
  }
  
  if (requiresEmail && !user?.email) {
    missingRequirements.push("email address");
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    missingRequirements.push(`${requiredRole} role`);
  }
  
  return {
    canAccessFeature: missingRequirements.length === 0,
    missingRequirements,
    user,
  };
}

/**
 * Hook for user's registration date and account age
 * 
 * @example
 * ```tsx
 * const { registrationDate, accountAge, isNewUser } = useUserRegistration();
 * 
 * return (
 *   <div>
 *     <p>Member since: {registrationDate}</p>
 *     {isNewUser && <Badge>New Member</Badge>}
 *   </div>
 * );
 * ```
 */
export function useUserRegistration() {
  const { user } = useUserContext();
  
  const registrationDate = user?.createdAt ? new Date(user.createdAt) : null;
  const now = new Date();
  
  // Calculate account age in days
  const accountAgeDays = registrationDate 
    ? Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const isNewUser = accountAgeDays < 7; // Less than a week old
  
  const getAccountAge = () => {
    if (accountAgeDays < 1) return "Today";
    if (accountAgeDays === 1) return "1 day";
    if (accountAgeDays < 7) return `${accountAgeDays} days`;
    if (accountAgeDays < 30) return `${Math.floor(accountAgeDays / 7)} weeks`;
    if (accountAgeDays < 365) return `${Math.floor(accountAgeDays / 30)} months`;
    return `${Math.floor(accountAgeDays / 365)} years`;
  };
  
  const formatRegistrationDate = (format: "short" | "long" | "relative" = "long") => {
    if (!registrationDate) return "Unknown";
    
    switch (format) {
      case "short":
        return registrationDate.toLocaleDateString();
      case "long":
        return registrationDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      case "relative":
        return getAccountAge() + " ago";
      default:
        return registrationDate.toLocaleDateString();
    }
  };
  
  return {
    registrationDate,
    accountAgeDays,
    isNewUser,
    accountAge: getAccountAge(),
    formatDate: formatRegistrationDate,
    user,
  };
}

// Export the ExtendedUser type for convenience
export type { ExtendedUser };