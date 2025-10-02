import { useCallback } from 'react';
import { Event, ScheduledEvent, Venue } from '../types';
import { LAYOUT_CONSTANTS } from '../constants';
import { createScheduledEvent } from '../utils';

export interface TimelineOperations {
  handleEventDrop: (event: Event, day: Date, venue: Venue, timeSlot: number) => void;
  handleEventMove: (eventId: string, newDay: Date, newVenue: Venue, newTimeSlot: number) => void;
  handleEventUpdate: (eventId: string, updates: Partial<ScheduledEvent>) => void;
}

export interface UseTimelineOperationsProps {
  setScheduledEvents: React.Dispatch<React.SetStateAction<ScheduledEvent[]>>;
  setAvailableEvents?: React.Dispatch<React.SetStateAction<Event[]>>;
  onEventUpdate?: (eventId: string, updates: Partial<ScheduledEvent>) => void;
}

export function useTimelineOperations({
  setScheduledEvents,
  setAvailableEvents,
  onEventUpdate
}: UseTimelineOperationsProps): TimelineOperations {
  
  const handleEventDrop = useCallback((
    event: Event, 
    day: Date, 
    venue: Venue, 
    timeSlot: number
  ) => {
    const newScheduledEvent = createScheduledEvent(
      event,
      timeSlot,
      LAYOUT_CONSTANTS.DEFAULT_EVENT_DURATION,
      day,
      venue
    );
    
    setScheduledEvents(prev => [...prev, newScheduledEvent]);
    
    // Remove from available events
    if (setAvailableEvents) {
      setAvailableEvents(prev => prev.filter(e => e.event.id !== event.event.id));
    }
  }, [setScheduledEvents, setAvailableEvents]);

  const handleEventMove = useCallback((
    eventId: string, 
    newDay: Date, 
    newVenue: Venue, 
    newTimeSlot: number
  ) => {
    setScheduledEvents(prev => 
      prev.map(event => 
        event.event.id === eventId 
          ? { ...event, day: newDay, venue: newVenue, startTime: newTimeSlot }
          : event
      )
    );
  }, [setScheduledEvents]);

  const handleEventUpdate = useCallback((eventId: string, updates: Partial<ScheduledEvent>) => {
    setScheduledEvents(prev => 
      prev.map(event => 
        event.event.id === eventId ? { ...event, ...updates } : event
      )
    );
    
    // Call the external update handler if provided
    if (onEventUpdate) {
      onEventUpdate(eventId, updates);
    }
  }, [setScheduledEvents, onEventUpdate]);

  return {
    handleEventDrop,
    handleEventMove,
    handleEventUpdate,
  };
}