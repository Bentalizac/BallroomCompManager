import { useState, useCallback } from 'react';
import { Event, ScheduledEvent } from '../types';
import { mockEvents } from '../data/mockData';
import { scheduledEventToBasicEvent } from '../utils';

export interface ScheduleState {
  selectedEvent: ScheduledEvent | null;
  availableEvents: Event[];
  scheduledEvents: ScheduledEvent[];
}

export interface ScheduleActions {
  setSelectedEvent: (event: ScheduledEvent | null) => void;
  setAvailableEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  setScheduledEvents: React.Dispatch<React.SetStateAction<ScheduledEvent[]>>;
  handleEventDrop: (event: Event) => void;
  handleEventReturnToList: (event: ScheduledEvent) => void;
  handleEventUpdate: (eventId: string, updates: Partial<ScheduledEvent>) => void;
  handleEventDelete: (event: ScheduledEvent) => void;
}

export function useScheduleState(): ScheduleState & ScheduleActions {
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null);
  const [availableEvents, setAvailableEvents] = useState<Event[]>(mockEvents);
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([]);

  const handleEventDrop = useCallback((event: Event) => {
    // Remove from available events when dropped on timeline
    setAvailableEvents(prev => prev.filter(e => e.event.id !== event.event.id));
  }, []);

  const handleEventReturnToList = useCallback((event: ScheduledEvent) => {
    // Convert back to basic Event and add to available events
    const basicEvent = scheduledEventToBasicEvent(event);
    
    setAvailableEvents(prev => [...prev, basicEvent]);
    
    // Remove from scheduled events
    setScheduledEvents(prev => prev.filter(e => e.event.id !== event.event.id));
    
    // Clear selection if this was the selected event
    if (selectedEvent?.event.id === event.event.id) {
      setSelectedEvent(null);
    }
  }, [selectedEvent]);

  const handleEventUpdate = useCallback((eventId: string, updates: Partial<ScheduledEvent>) => {
    setScheduledEvents(prev => 
      prev.map(event => 
        event.event.id === eventId ? { ...event, ...updates } : event
      )
    );
    
    // Update selected event if it's the one being updated
    if (selectedEvent?.event.id === eventId) {
      setSelectedEvent(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedEvent]);

  const handleEventDelete = useCallback((event: ScheduledEvent) => {
    handleEventReturnToList(event);
  }, [handleEventReturnToList]);

  return {
    // State
    selectedEvent,
    availableEvents,
    scheduledEvents,
    // Actions
    setSelectedEvent,
    setAvailableEvents,
    setScheduledEvents,
    handleEventDrop,
    handleEventReturnToList,
    handleEventUpdate,
    handleEventDelete,
  };
}