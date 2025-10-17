import { useState } from 'react';
import { trpc } from '@/lib/trpc';

/**
 * Hook for managing event registration
 */
export function useEventRegistration(competitionId?: string) {
  const [registeringEventIds, setRegisteringEventIds] = useState<Set<string>>(new Set());
  const [profileMissingFields, setProfileMissingFields] = useState<string[]>([]);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  
  const utils = trpc.useContext();

  // Helper functions to manage per-event loading states
  const addRegisteringEventId = (eventId: string) => {
    setRegisteringEventIds(prev => new Set([...prev, eventId]));
  };
  
  const removeRegisteringEventId = (eventId: string) => {
    setRegisteringEventIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(eventId);
      return newSet;
    });
  };
  
  const isEventRegistering = (eventId: string) => {
    return registeringEventIds.has(eventId);
  };

  // Register for event mutation
  const registerMutation = trpc.event.registerForEvent.useMutation({
    onMutate: ({ eventId }) => {
      addRegisteringEventId(eventId);
    },
    onSuccess: (_, { eventId }) => {
      // Invalidate and refetch related queries
      if (competitionId) {
        utils.event.getUserEventRegistrations.invalidate({ competitionId });
        utils.competition.getRegistrations.invalidate({ competitionId });
      }
      removeRegisteringEventId(eventId);
    },
    onError: (error, { eventId }) => {
      console.error("Registration failed:", error);
      
      // Handle profile incomplete errors
      if (error.data?.code === "PRECONDITION_FAILED" && 
          (error as any).cause?.code === "PROFILE_INCOMPLETE") {
        setProfileMissingFields((error as any).cause?.missingFields || []);
        setShowProfileDialog(true);
      }
      
      removeRegisteringEventId(eventId);
      throw error; // Re-throw to allow component to handle it
    },
  });

  // Team/paired registration mutation
  const createRegistrationMutation = trpc.event.createRegistration.useMutation({
    onMutate: ({ eventId }) => {
      addRegisteringEventId(eventId);
    },
    onSuccess: (_, { eventId }) => {
      // Invalidate and refetch related queries
      if (competitionId) {
        utils.event.getUserEventRegistrations.invalidate({ competitionId });
        utils.competition.getRegistrations.invalidate({ competitionId });
      }
      removeRegisteringEventId(eventId);
    },
    onError: (error, { eventId }) => {
      console.error("Team registration failed:", error);
      
      // Handle profile incomplete errors
      if (error.data?.code === "PRECONDITION_FAILED" && 
          (error as any).cause?.code === "PROFILE_INCOMPLETE") {
        setProfileMissingFields((error as any).cause?.missingFields || []);
        setShowProfileDialog(true);
      }
      
      removeRegisteringEventId(eventId);
      throw error; // Re-throw to allow component to handle it
    },
  });

  // Registration reactivation mutation
  const reactivateRegistrationMutation = trpc.event.reactivateRegistration.useMutation({
    onMutate: ({ eventId }) => {
      addRegisteringEventId(eventId);
    },
    onSuccess: (_, { eventId }) => {
      // Invalidate and refetch related queries
      if (competitionId) {
        utils.event.getUserEventRegistrations.invalidate({ competitionId });
        utils.competition.getRegistrations.invalidate({ competitionId });
      }
      removeRegisteringEventId(eventId);
    },
    onError: (error, { eventId }) => {
      console.error("Registration reactivation failed:", error);
      removeRegisteringEventId(eventId);
      throw error; // Re-throw to allow component to handle it
    },
  });

  const register = async (eventId: string, role?: 'competitor' | 'judge' | 'scrutineer' | 'lead' | 'follow' | 'coach' | 'member') => {
    return registerMutation.mutateAsync({ eventId, role });
  };

  const createTeamRegistration = async (params: {
    eventId: string;
    participants: Array<{
      userId: string;
      role: 'lead' | 'follow' | 'coach' | 'member';
    }>;
    teamName?: string;
  }) => {
    return createRegistrationMutation.mutateAsync(params);
  };

  const reactivateRegistration = async (eventId: string, teamName?: string) => {
    return reactivateRegistrationMutation.mutateAsync({ eventId, teamName });
  };

  const handleProfileComplete = () => {
    setShowProfileDialog(false);
    setProfileMissingFields([]);
    // Invalidate queries to refetch with updated profile
    if (competitionId) {
      utils.event.getUserEventRegistrations.invalidate({ competitionId });
    }
  };

  return {
    // State
    isEventRegistering, // Function to check if specific event is registering
    profileMissingFields,
    showProfileDialog,
    
    // Actions
    register,
    createTeamRegistration,
    reactivateRegistration,
    handleProfileComplete,
    setShowProfileDialog,
    
    // Mutation objects (for accessing loading states, errors, etc.)
    registerMutation,
    createRegistrationMutation,
    reactivateRegistrationMutation,
  };
}

/**
 * Hook for managing event registration cancellation
 */
export function useEventRegistrationCancel(competitionId?: string) {
  const [cancellingRegIds, setCancellingRegIds] = useState<Set<string>>(new Set());
  
  const utils = trpc.useContext();

  // Helper functions to manage per-registration loading states
  const addCancellingRegId = (regId: string) => {
    setCancellingRegIds(prev => new Set([...prev, regId]));
  };
  
  const removeCancellingRegId = (regId: string) => {
    setCancellingRegIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(regId);
      return newSet;
    });
  };
  
  const isRegistrationCancelling = (regId: string) => {
    return cancellingRegIds.has(regId);
  };

  const cancelMutation = trpc.event.cancelEventRegistration.useMutation({
    onMutate: ({ registrationId }) => {
      addCancellingRegId(registrationId);
    },
    onSuccess: (_, { registrationId }) => {
      // Invalidate and refetch related queries
      if (competitionId) {
        utils.event.getUserEventRegistrations.invalidate({ competitionId });
        utils.competition.getRegistrations.invalidate({ competitionId });
      }
      removeCancellingRegId(registrationId);
    },
    onError: (error, { registrationId }) => {
      console.error("Cancellation failed:", error);
      removeCancellingRegId(registrationId);
      throw error; // Re-throw to allow component to handle it
    },
  });

  const cancel = async (registrationId: string) => {
    return cancelMutation.mutateAsync({ registrationId });
  };

  return {
    // State
    isRegistrationCancelling, // Function to check if specific registration is cancelling
    
    // Actions
    cancel,
    
    // Mutation object
    cancelMutation,
  };
}

/**
 * Hook for fetching user's event registrations for a competition
 */
export function useUserEventRegistrations(competitionId?: string, enabled = true) {
  return trpc.event.getUserEventRegistrations.useQuery(
    { competitionId: competitionId || '' },
    { 
      enabled: enabled && !!competitionId,
      staleTime: 1000 * 60, // 1 minute
    }
  );
}

/**
 * Hook for fetching competition events
 */
export function useCompetitionEvents(competitionId?: string, enabled = true) {
  return trpc.competition.getEvents.useQuery(
    { competitionId: competitionId || '' },
    { 
      enabled: enabled && !!competitionId,
      staleTime: 1000 * 60 * 5, // 5 minutes (events don't change as often)
    }
  );
}

/**
 * Comprehensive hook that combines all event registration functionality
 */
export function useEventRegistrationManager(competitionId?: string) {
  const eventRegistration = useEventRegistration(competitionId);
  const eventCancellation = useEventRegistrationCancel(competitionId);
  const userRegistrations = useUserEventRegistrations(competitionId);
  const events = useCompetitionEvents(competitionId);

  return {
    // Registration
    ...eventRegistration,
    
    // Cancellation
    cancel: eventCancellation.cancel,
    isRegistrationCancelling: eventCancellation.isRegistrationCancelling,
    cancelMutation: eventCancellation.cancelMutation,
    
    // Data
    userRegistrations: userRegistrations.data,
    isLoadingRegistrations: userRegistrations.isLoading,
    registrationsError: userRegistrations.error,
    refetchRegistrations: userRegistrations.refetch,
    
    events: events.data,
    isLoadingEvents: events.isLoading,
    eventsError: events.error,
    refetchEvents: events.refetch,
  };
}