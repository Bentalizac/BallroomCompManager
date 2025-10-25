import { useState, useCallback } from 'react';
import { Event, ScheduledEvent, ScheduledBlock } from '../types';
import { mockEvents } from '../data/mockData';
import { scheduledEventToBasicEvent, clampTimeToSchedule, isTimeInSchedule } from '../utils';
import { Venue } from '../types';
import { TIME_CONSTANTS } from '../constants';

export interface ScheduleState {
  selectedEvent: ScheduledEvent | null;
  availableEvents: Event[];
  scheduledEvents: ScheduledEvent[];
  scheduledBlocks: ScheduledBlock[];
  days: Date[];
  locations: Venue[];
}

export interface ScheduleActions {
  setSelectedEvent: (event: ScheduledEvent | null) => void;
  setAvailableEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  setScheduledEvents: React.Dispatch<React.SetStateAction<ScheduledEvent[]>>;
  setScheduledBlocks: React.Dispatch<React.SetStateAction<ScheduledBlock[]>>;
  setDays: React.Dispatch<React.SetStateAction<Date[]>>;
  setLocations: React.Dispatch<React.SetStateAction<Venue[]>>;
  handleEventDrop: (event: Event) => void;
  handleEventReturnToList: (event: ScheduledEvent) => void;
  handleEventUpdate: (eventId: string, updates: Partial<ScheduledEvent>) => void;
  handleEventDelete: (event: ScheduledEvent) => void;
}

export function useScheduleState(): ScheduleState & ScheduleActions {
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null);
  const [availableEvents, setAvailableEvents] = useState<Event[]>(mockEvents);
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([]);
  const [scheduledBlocks, setScheduledBlocks] = useState<ScheduledBlock[]>([]);
  const [days, setDays] = useState<Date[]>([new Date('2025-10-09'), new Date('2025-10-10')]);
  const [locations, setLocations] = useState<Venue[]>([{ name: 'Wilk' }, { name: 'RB' }]);

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
    // Apply constraints to the updates
    const constrainedUpdates = { ...updates };
    
    // Constrain start time if provided
    if (constrainedUpdates.startTime !== undefined) {
      constrainedUpdates.startTime = clampTimeToSchedule(constrainedUpdates.startTime);
    }
    
    // For duration updates, ensure the end time doesn't exceed bounds
    if (constrainedUpdates.duration !== undefined) {
      const currentEvent = scheduledEvents.find(e => e.event.id === eventId);
      if (currentEvent) {
        const startTime = constrainedUpdates.startTime ?? currentEvent.startTime;
        const endTime = startTime + constrainedUpdates.duration;
        
        // If end time exceeds bounds, adjust duration
        if (endTime > TIME_CONSTANTS.END_TIME) {
          constrainedUpdates.duration = TIME_CONSTANTS.END_TIME - startTime;
        }
        
        // Ensure minimum duration
        if (constrainedUpdates.duration < TIME_CONSTANTS.LINE_INTERVAL) {
          constrainedUpdates.duration = TIME_CONSTANTS.LINE_INTERVAL;
        }
      }
    }
    
    setScheduledEvents(prev => 
      prev.map(event => 
        event.event.id === eventId ? { ...event, ...constrainedUpdates } : event
      )
    );
    
    // Update selected event if it's the one being updated
    if (selectedEvent?.event.id === eventId) {
      setSelectedEvent(selectedEvent ? { ...selectedEvent, ...constrainedUpdates } : null);
    }
  }, [selectedEvent, scheduledEvents]);

  const handleEventDelete = useCallback((event: ScheduledEvent) => {
    handleEventReturnToList(event);
  }, [handleEventReturnToList]);

  return {
    // State
    selectedEvent,
    availableEvents,
    scheduledEvents,
    scheduledBlocks,
    // Actions
    setSelectedEvent,
    setAvailableEvents,
    setScheduledEvents,
    setScheduledBlocks,
    handleEventDrop,
    handleEventReturnToList,
    handleEventUpdate,
    handleEventDelete,
    days,
    setDays,
    locations,
    setLocations
  };
}