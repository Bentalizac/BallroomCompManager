"use client";

import React, { createContext, useContext } from "react";
import { TRPCClientErrorLike } from "@trpc/client";
import { useEventManager } from "@/hooks/useEvents";
import type { CompEvent, DanceStyle, BallroomLevel } from "@ballroomcompmanager/shared";

type EventProviderContextType = {
  // Event data
  events: CompEvent[] | undefined;
  isLoadingEvents: boolean;
  eventsError: TRPCClientErrorLike<any> | null;
  refetchEvents: () => void;
  
  // Event management actions
  createEvent: (eventData: {
    competitionId: string;
    name: string;
    startDate: Date | null;
    endDate: Date | null;
    categoryId: string;
    rulesetId: string;
    category: {
      style: DanceStyle.Ballroom | DanceStyle.Latin | DanceStyle.Smooth | DanceStyle.Rhythm;
      level: BallroomLevel;
    };
  }) => Promise<CompEvent>;
  isCreating: boolean;
  
  updateEvent: (updateData: {
    id: string;
    name?: string;
    startDate?: Date | null;
    endDate?: Date | null;
  }) => Promise<CompEvent>;
  scheduleEvent: (eventId: string, startDate: Date, endDate: Date) => Promise<CompEvent>;
  isEventUpdating: (eventId: string) => boolean;
  
  deleteEvent: (eventId: string) => Promise<{ success: boolean }>;
  isEventDeleting: (eventId: string) => boolean;
  
  // Context info
  competitionId: string | undefined;
};

const EventContext = createContext<EventProviderContextType | null>(null);

type EventProviderProps = {
  competitionId?: string;
  children: React.ReactNode;
};

export const EventProvider: React.FC<EventProviderProps> = ({
  competitionId,
  children,
}) => {
  const eventManager = useEventManager(competitionId);

  const contextValue: EventProviderContextType = {
    // Event data
    events: eventManager.events,
    isLoadingEvents: eventManager.isLoadingEvents,
    eventsError: eventManager.eventsError,
    refetchEvents: eventManager.refetchEvents,
    
    // Event management actions
    createEvent: async (eventData) => {
      const newEvent = await eventManager.createEvent(eventData);
      return {
        ...newEvent,
        startDate: newEvent.startDate ? new Date(newEvent.startDate) : null,
        endDate: newEvent.endDate ? new Date(newEvent.endDate) : null,
      };
    },
    isCreating: eventManager.isCreating,
    
    updateEvent: async (updateData) => {
      const updatedEvent = await eventManager.updateEvent(updateData);
      return {
        ...updatedEvent,
        startDate: updatedEvent.startDate ? new Date(updatedEvent.startDate) : null,
        endDate: updatedEvent.endDate ? new Date(updatedEvent.endDate) : null,
      };
    },
    scheduleEvent: async (eventId, startDate, endDate) => {
      const scheduledEvent = await eventManager.scheduleEvent(eventId, startDate, endDate);
      return {
        ...scheduledEvent,
        startDate: scheduledEvent.startDate ? new Date(scheduledEvent.startDate) : null,
        endDate: scheduledEvent.endDate ? new Date(scheduledEvent.endDate) : null,
      };
    },
    isEventUpdating: eventManager.isEventUpdating,
    
    deleteEvent: eventManager.deleteEvent,
    isEventDeleting: eventManager.isEventDeleting,
    
    // Context info
    competitionId,
  };

  return (
    <EventContext.Provider value={contextValue}>{children}</EventContext.Provider>
  );
};

// Custom hook to use the event context
export const useEvent = () => {
  const context = useContext(EventContext);

  if (!context) {
    throw new Error("useEvent must be used within an EventProvider");
  }

  return context;
};

// Hook for components that need just the events data (with loading/error handling)
export const useEvents = () => {
  const { events, isLoadingEvents, eventsError, refetchEvents } = useEvent();

  return {
    events,
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents,
  };
};

// Hook for components that need event creation functionality
export const useEventCreation = () => {
  const { createEvent, isCreating } = useEvent();

  return {
    createEvent,
    isCreating,
  };
};

// Hook for components that need event update functionality (including scheduling)
export const useEventUpdates = () => {
  const { updateEvent, scheduleEvent, isEventUpdating } = useEvent();

  return {
    updateEvent,
    scheduleEvent,
    isEventUpdating,
  };
};

// Hook for components that need event deletion functionality
export const useEventDeletion = () => {
  const { deleteEvent, isEventDeleting } = useEvent();

  return {
    deleteEvent,
    isEventDeleting,
  };
};

// Hook for components that need comprehensive event management
export const useEventManagement = () => {
  const context = useEvent();

  return {
    // Data
    events: context.events,
    isLoadingEvents: context.isLoadingEvents,
    eventsError: context.eventsError,
    refetchEvents: context.refetchEvents,
    
    // Creation
    createEvent: context.createEvent,
    isCreating: context.isCreating,
    
    // Updates
    updateEvent: context.updateEvent,
    scheduleEvent: context.scheduleEvent,
    isEventUpdating: context.isEventUpdating,
    
    // Deletion
    deleteEvent: context.deleteEvent,
    isEventDeleting: context.isEventDeleting,
    
    // Context
    competitionId: context.competitionId,
  };
};