import { useCallback } from 'react';
import { Event, ScheduledEvent } from '../types';
import { LAYOUT_CONSTANTS } from '../constants';
import { createScheduledEvent } from '../utils';

export interface TimelineOperations {
  handleEventDrop: (event: Event, day: '10/9' | '10/10', venue: 'Wilk' | 'RB', timeSlot: number) => void;
  handleEventMove: (eventId: string, newDay: '10/9' | '10/10', newVenue: 'Wilk' | 'RB', newTimeSlot: number) => void;
  handleEventUpdate: (eventId: string, updates: Partial<ScheduledEvent>) => void;
}

export interface UseTimelineOperationsProps {
  setScheduledEvents: React.Dispatch<React.SetStateAction<ScheduledEvent[]>>;
  onEventUpdate?: (eventId: string, updates: Partial<ScheduledEvent>) => void;
}

export function useTimelineOperations({
  setScheduledEvents,
  onEventUpdate
}: UseTimelineOperationsProps): TimelineOperations {
  
  const handleEventDrop = useCallback((
    event: Event, 
    day: '10/9' | '10/10', 
    venue: 'Wilk' | 'RB', 
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
  }, [setScheduledEvents]);

  const handleEventMove = useCallback((
    eventId: string, 
    newDay: '10/9' | '10/10', 
    newVenue: 'Wilk' | 'RB', 
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