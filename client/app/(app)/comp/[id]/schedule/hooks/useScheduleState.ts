import { useState, useCallback } from 'react';
import { Event, ScheduledEvent } from '../types';
import { mockEvents, mockScheduledEvents } from '../data/mockData';

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
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>(mockScheduledEvents);

  const handleEventDrop = useCallback((event: Event) => {
    // Remove from available events when dropped on timeline
    setAvailableEvents(prev => prev.filter(e => e.event.id !== event.event.id));
  }, []);

  const handleEventReturnToList = useCallback((event: ScheduledEvent) => {
    // Convert back to basic Event and add to available events
    const basicEvent: Event = {
      event: {
        id: event.event.id.startsWith('scheduled-') ? `${Date.now()}` : event.event.id,
        name: event.event.name,
        category: event.event.category,
        division: event.event.division,
        type: event.event.type
      },
      color: event.color
    };
    
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