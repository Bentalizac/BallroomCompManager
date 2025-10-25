import { useCallback } from 'react';
import { Event, ScheduledEvent, Venue, Block, ScheduledBlock } from '../types';
import { LAYOUT_CONSTANTS } from '../constants';
import { createScheduledEvent } from '../utils';

export interface TimelineOperations {
  handleEventDrop: (event: Event | Block, day: Date, venue: Venue, timeSlot: number) => void;
  handleEventMove: (eventId: string, newDay: Date, newVenue: Venue, newTimeSlot: number) => void;
  handleEventUpdate: (eventId: string, updates: Partial<ScheduledEvent>) => void;
}

export interface UseTimelineOperationsProps {
  setScheduledEvents: React.Dispatch<React.SetStateAction<ScheduledEvent[]>>;
  setScheduledBlocks: React.Dispatch<React.SetStateAction<ScheduledBlock[]>>;
  setAvailableEvents?: React.Dispatch<React.SetStateAction<Event[]>>;
  onEventUpdate?: (eventId: string, updates: Partial<ScheduledEvent>) => void;
  onEventMove?: (eventId: string, updates: Partial<ScheduledEvent>) => void;
}

export function useTimelineOperations({
  setScheduledEvents,
  setScheduledBlocks,
  setAvailableEvents,
  onEventUpdate,
  onEventMove
}: UseTimelineOperationsProps): TimelineOperations {
  
  const handleEventDrop = useCallback((
    item: Event | Block, 
    day: Date, 
    venue: Venue, 
    timeSlot: number
  ) => {
    // Check if it's a Block
    if ('id' in item && !('event' in item)) {
      // This is a Block
      const newScheduledBlock: ScheduledBlock = {
        id: item.id || `block-${Date.now()}`,
        name: item.name || 'New Block',
        startTime: timeSlot,
        duration: item.duration || 60, // Default 60 minutes
        day,
        venue
      };
      
      setScheduledBlocks(prev => [...prev, newScheduledBlock]);
    } else {
      // This is an Event
      const event = item as Event;
      const newScheduledEvent = createScheduledEvent(
        event,
        timeSlot,
        LAYOUT_CONSTANTS.DEFAULT_EVENT_DURATION,
        day,
        venue
      );
      
      // Ensure newly dropped events are marked as Scheduled
      setScheduledEvents(prev => [...prev, { ...newScheduledEvent, state: "Scheduled" }]);
      
      // Remove from available events
      if (setAvailableEvents) {
        setAvailableEvents(prev => prev.filter(e => e.event.id !== event.event.id));
      }
    }
  }, [setScheduledEvents, setScheduledBlocks, setAvailableEvents]);

  const handleEventMove = useCallback((
    eventId: string, 
    newDay: Date, 
    newVenue: Venue, 
    newTimeSlot: number
  ) => {
    // Mark moved events as Scheduled as part of the update
    const updates = { day: newDay, venue: newVenue, startTime: newTimeSlot, State: "Scheduled" };
    
    setScheduledEvents(prev => 
      prev.map(event => 
        event.event.id === eventId 
          ? { ...event, ...updates }
          : event
      )
    );
    
    // Notify parent about the move so it can update selectedEvent if needed
    if (onEventMove) {
      onEventMove(eventId, updates);
    }
  }, [setScheduledEvents, onEventMove]);

  const handleEventUpdate = useCallback((eventId: string, updates: Partial<ScheduledEvent>) => {
    // Always include state: "scheduled" in update operations
    const mergedUpdates: Partial<ScheduledEvent> = { ...updates, state: "scheduled" };

    setScheduledEvents(prev => 
      prev.map(event => 
        event.event.id === eventId ? { ...event, ...mergedUpdates } : event
      )
    );
    
    // Call the external update handler if provided
    if (onEventUpdate) {
      onEventUpdate(eventId, mergedUpdates);
    }
  }, [setScheduledEvents, onEventUpdate]);

  return {
    handleEventDrop,
    handleEventMove,
    handleEventUpdate,
  };
}