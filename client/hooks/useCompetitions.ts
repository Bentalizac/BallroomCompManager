import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import type {
  CompetitionApiType,
  DomainCompetition,
} from "@ballroomcompmanager/shared";
import { competitionApiToDomain } from "@ballroomcompmanager/shared";

// Hook to get all competitions
export function useCompetitions() {
  return trpc.competition.getAll.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to get a single competition by ID
export function useCompetition(id: string | undefined) {
  return trpc.competition.getById.useQuery(
    { id: id! },
    {
      enabled: !!id, // Only run query if id is provided
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );
}

// Hook to get a single competition by slug
export function useCompetitionBySlug(slug: string | undefined) {
  return trpc.competition.getBySlug.useQuery(
    { slug: slug! },
    {
      enabled: !!slug, // Only run query if slug is provided
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );
}

// Hook to get user's registration for a competition
export function useUserRegistration(
  competitionId: string | undefined,
  userId: string | undefined,
) {
  return trpc.competition.getUserRegistration.useQuery(
    {
      competitionId: competitionId!,
      userId: userId!,
    },
    {
      enabled: !!(competitionId && userId),
      staleTime: 1000 * 60 * 2, // 2 minutes (registration status might change)
    },
  );
}

// Hook to register for a competition
export function useRegisterForCompetition() {
  const utils = trpc.useContext();

  return trpc.user.registerForComp.useMutation({
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      utils.competition.getAll.invalidate();
      utils.competition.getById.invalidate({ id: variables.competitionId });
      utils.competition.getUserRegistration.invalidate({
        competitionId: variables.competitionId,
        userId: variables.userId,
      });
      utils.competition.getRegistrations.invalidate({
        competitionId: variables.competitionId,
      });
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
}

// Hook to get all registrations for a competition (admin/organizer use)
export function useCompetitionRegistrations(competitionId: string | undefined) {
  return trpc.competition.getRegistrations.useQuery(
    { competitionId: competitionId! },
    {
      enabled: !!competitionId,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  );
}

// Custom hook for competition display data with computed fields
export function useCompetitionDisplay(
  competition: CompetitionApiType | undefined,
) {
  return useMemo(() => {
    if (!competition) return null;

    const now = new Date();
    // Parse dates from YYYY-MM-DD string format
    const startDate = new Date(competition.startDate + "T00:00:00.000Z");
    const endDate = new Date(competition.endDate + "T00:00:00.000Z");

    return {
      ...competition,
      formattedStartDate: startDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      formattedStartTime: "All Day", // Date-only format, no time
      formattedEndDate: endDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      isUpcoming: startDate > now,
      isOngoing: startDate <= now && endDate >= now,
      isPast: endDate < now,
      daysUntilStart: Math.ceil(
        (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
      eventCount: competition.events.length,
    };
  }, [competition]);
}

// Hook to check if user can register for a competition
export function useCanRegister(
  competition: CompetitionApiType | undefined,
  userRegistration: { status: string } | undefined,
  isAuthenticated: boolean = true,
) {
  return useMemo(() => {
    if (!competition) {
      return {
        canRegister: false,
        reason: "Competition not found",
      };
    }

    if (!isAuthenticated) {
      return {
        canRegister: false,
        reason: "Please sign in to register",
      };
    }

    if (userRegistration) {
      return {
        canRegister: false,
        reason: `Already registered (Status: ${userRegistration.status})`,
      };
    }

    const now = new Date();
    const startDate = new Date(competition.startDate + "T00:00:00.000Z");

    if (startDate <= now) {
      return {
        canRegister: false,
        reason: "Competition has already started",
      };
    }

    // Add more business logic here as needed
    // e.g., registration deadline, capacity limits, etc.

    return {
      canRegister: true,
      reason: null,
    };
  }, [competition, userRegistration, isAuthenticated]);
}

// Hook to create a new competition
export function useCreateCompetition() {
  const utils = trpc.useContext();

  return trpc.competition.create.useMutation({
    onSuccess: () => {
      // Invalidate competitions list to show new competition
      utils.competition.getAll.invalidate();
    },
    onError: (error) => {
      console.error("Failed to create competition:", error.message);
    },
  });
}

// Hook to update a competition (admin only)
export function useUpdateCompetition() {
  const utils = trpc.useContext();

  return trpc.competition.update.useMutation({
    onSuccess: (data) => {
      // Invalidate and update specific competition cache
      utils.competition.getAll.invalidate();
      utils.competition.getById.invalidate({ id: data.id });
    },
    onError: (error) => {
      console.error("Failed to update competition:", error.message);
    },
  });
}

// Hook to delete a competition (admin only)
export function useDeleteCompetition() {
  const utils = trpc.useContext();

  return trpc.competition.delete.useMutation({
    onSuccess: (_, variables) => {
      // Remove from cache and invalidate list
      utils.competition.getAll.invalidate();
      utils.competition.getById.setData({ id: variables.id }, undefined);
    },
    onError: (error) => {
      console.error("Failed to delete competition:", error.message);
    },
  });
}

// Hook to create a new event for a competition
export function useCreateEvent() {
  const utils = trpc.useContext();

  return trpc.event.create.useMutation({
    onSuccess: (data) => {
      // Invalidate related queries
      utils.competition.getAll.invalidate();
      utils.competition.getById.invalidate({ id: data.competitionId });
      utils.competition.getEvents.invalidate({
        competitionId: data.competitionId,
      });
    },
    onError: (error) => {
      console.error("Failed to create event:", error.message);
    },
  });
}

// Hook to update an event (admin only)
export function useUpdateEvent() {
  const utils = trpc.useContext();

  return trpc.event.update.useMutation({
    onSuccess: (data) => {
      // Invalidate related queries
      utils.competition.getAll.invalidate();
      utils.competition.getById.invalidate({ id: data.competitionId });
      utils.competition.getEvents.invalidate({
        competitionId: data.competitionId,
      });
    },
    onError: (error) => {
      console.error("Failed to update event:", error.message);
    },
  });
}

// Hook to delete an event (admin only)
export function useDeleteEvent() {
  const utils = trpc.useContext();

  return trpc.event.delete.useMutation({
    onSuccess: () => {
      // Invalidate all related queries since we don't know the competition ID
      utils.competition.getAll.invalidate();
      utils.competition.getById.invalidate();
      utils.competition.getEvents.invalidate();
    },
    onError: (error) => {
      console.error("Failed to delete event:", error.message);
    },
  });
}

// Hook to get current user's registrations
export function useMyRegistrations() {
  return trpc.user.getMyRegistrations.useQuery(undefined, {
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook to update user profile
export function useUpdateProfile() {
  const utils = trpc.useContext();

  return trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      // Invalidate user-related queries if you have them
      utils.user.getMyRegistrations.invalidate();
    },
    onError: (error) => {
      console.error("Failed to update profile:", error.message);
    },
  });
}
