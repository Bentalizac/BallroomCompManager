import { useState } from "react";
import { trpc } from "@/lib/trpc";

/**
 * Hook for fetching events for a competition
 */
export function useEvents(competitionId?: string, enabled = true) {
  return trpc.event.getEvents.useQuery(
    { competitionId: competitionId || "" },
    {
      enabled: enabled && !!competitionId,
      staleTime: 1000 * 60 * 0.5, // 30 seconds, events may update frequently
    },
  );
}

/**
 * Hook for managing event creation
 */
export function useEventCreate(competitionId?: string) {
  const [isCreating, setIsCreating] = useState(false);
  const utils = trpc.useContext();

  const createMutation = trpc.event.create.useMutation({
    onMutate: () => {
      setIsCreating(true);
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      if (competitionId) {
        utils.event.getEvents.invalidate({ competitionId });
        utils.competition.getEvents.invalidate({ competitionId });
        utils.competition.getBySlug.invalidate();
      }
      setIsCreating(false);
    },
    onError: (error) => {
      console.error("Event creation failed:", error);
      setIsCreating(false);
      throw error; // Re-throw to allow component to handle it
    },
  });

  const createEvent = async (eventData: {
    competitionId: string;
    name: string;
    startDate: Date | null;
    endDate: Date | null;
    categoryId: string;
    rulesetId: string;
  }) => {
    return createMutation.mutateAsync(eventData);
  };

  return {
    createEvent,
    isCreating,
    createMutation,
  };
}

/**
 * Hook for managing event updates (including scheduling)
 */
export function useEventUpdate(competitionId?: string) {
  const [updatingEventIds, setUpdatingEventIds] = useState<Set<string>>(
    new Set(),
  );
  const utils = trpc.useContext();

  // Helper functions to manage per-event loading states
  const addUpdatingEventId = (eventId: string) => {
    setUpdatingEventIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(eventId);
      return newSet;
    });
  };

  const removeUpdatingEventId = (eventId: string) => {
    setUpdatingEventIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(eventId);
      return newSet;
    });
  };

  const isEventUpdating = (eventId: string) => {
    return updatingEventIds.has(eventId);
  };

  const updateMutation = trpc.event.update.useMutation({
    onMutate: ({ id }) => {
      addUpdatingEventId(id);
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch related queries
      if (competitionId) {
        utils.event.getEvents.invalidate({ competitionId });
        utils.competition.getEvents.invalidate({ competitionId });
        utils.competition.getBySlug.invalidate();
      }
      removeUpdatingEventId(id);
    },
    onError: (error, { id }) => {
      console.error("Event update failed:", error);
      removeUpdatingEventId(id);
      throw error; // Re-throw to allow component to handle it
    },
  });

  const updateEvent = async (updateData: {
    id: string;
    name?: string;
    startDate?: Date | null;
    endDate?: Date | null;
  }) => {
    return updateMutation.mutateAsync(updateData);
  };

  // Convenience method for scheduling events
  const scheduleEvent = async (
    eventId: string,
    startDate: Date,
    endDate: Date,
  ) => {
    return updateEvent({ id: eventId, startDate, endDate });
  };

  return {
    updateEvent,
    scheduleEvent,
    isEventUpdating,
    updateMutation,
  };
}

/**
 * Hook for managing event deletion
 */
export function useEventDelete(competitionId?: string) {
  const [deletingEventIds, setDeletingEventIds] = useState<Set<string>>(
    new Set(),
  );
  const utils = trpc.useContext();

  // Helper functions to manage per-event loading states
  const addDeletingEventId = (eventId: string) => {
    setDeletingEventIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(eventId);
      return newSet;
    });
  };

  const removeDeletingEventId = (eventId: string) => {
    setDeletingEventIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(eventId);
      return newSet;
    });
  };

  const isEventDeleting = (eventId: string) => {
    return deletingEventIds.has(eventId);
  };

  const deleteMutation = trpc.event.delete.useMutation({
    onMutate: ({ id }) => {
      addDeletingEventId(id);
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch related queries
      if (competitionId) {
        utils.event.getEvents.invalidate({ competitionId });
        utils.competition.getEvents.invalidate({ competitionId });
        utils.competition.getBySlug.invalidate();
      }
      removeDeletingEventId(id);
    },
    onError: (error, { id }) => {
      console.error("Event deletion failed:", error);
      removeDeletingEventId(id);
      throw error; // Re-throw to allow component to handle it
    },
  });

  const deleteEvent = async (eventId: string) => {
    return deleteMutation.mutateAsync({ id: eventId });
  };

  return {
    deleteEvent,
    isEventDeleting,
    deleteMutation,
  };
}

/**
 * Comprehensive hook that combines all event management functionality
 */
export function useEventManager(competitionId?: string) {
  const events = useEvents(competitionId);
  const eventCreate = useEventCreate(competitionId);
  const eventUpdate = useEventUpdate(competitionId);
  const eventDelete = useEventDelete(competitionId);

  return {
    // Events data
    events: events.data,
    isLoadingEvents: events.isLoading,
    eventsError: events.error,
    refetchEvents: events.refetch,

    // Creation
    createEvent: eventCreate.createEvent,
    isCreating: eventCreate.isCreating,
    createMutation: eventCreate.createMutation,

    // Update/Scheduling
    updateEvent: eventUpdate.updateEvent,
    scheduleEvent: eventUpdate.scheduleEvent,
    isEventUpdating: eventUpdate.isEventUpdating,
    updateMutation: eventUpdate.updateMutation,

    // Deletion
    deleteEvent: eventDelete.deleteEvent,
    isEventDeleting: eventDelete.isEventDeleting,
    deleteMutation: eventDelete.deleteMutation,
  };
}
