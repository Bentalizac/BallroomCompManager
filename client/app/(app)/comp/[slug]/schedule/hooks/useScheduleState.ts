import { useState, useCallback } from 'react';
import { Event, Block } from '../types';
import { mockBlocks, mockEvents } from '../data/mockData';
import { scheduledEventToBasicEvent, clampTimeToSchedule, isTimeInSchedule } from '../utils';
import { Venue } from '../types';
import { TIME_CONSTANTS } from '../constants';
import { STATE_TYPES } from '../components/dnd/drag/draggableItem';


export interface ScheduleState {
  
  days: Date[];
  setDays: React.Dispatch<React.SetStateAction<Date[]>>;

  locations: Venue[];
  setLocations: React.Dispatch<React.SetStateAction<Venue[]>>;
  
  selectedItemID: string | null;
  setSelectedItemID: (id: string | null) => void;

  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  getAvailableEvents: () => Event[];
  getScheduledEvents: () => Event[];
  handleEventUpdate: (eventID: string, updates: Partial<Event>) => void;
  handleEventDelete: (eventID: string) => void;
  handleEventCopy: (eventID: string) => void;
  
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  getAvailableBlocks: () => Block[];
  getScheduledBlocks: () => Block[];
  handleBlockUpdate: (blockID: string, updates: Partial<Block>) => void;
  handleBlockDelete: (blockID: string) => void;
  handleBlockCopy: (blockID: string) => void;
}


export function useScheduleState(): ScheduleState {
  // Initialize dates at midnight local time to avoid timezone issues
  const day1 = new Date(2025, 9, 9); // October 9, 2025 (month is 0-indexed)
  const day2 = new Date(2025, 9, 10); // October 10, 2025
  console.log('Initializing schedule with days:', [day1.toISOString(), day2.toISOString()]);
  
  const [days, setDays] = useState<Date[]>([day1, day2]);
  const [locations, setLocations] = useState<Venue[]>([{ name: 'Wilk' }, { name: 'RB' }]);
  
  const [selectedItemID, setSelectedItemID] = useState<string | null>(null);
  
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [blocks, setBlocks] = useState<Block[]>(mockBlocks);


  const getAvailableEvents = useCallback((): Event[] => {
    const available = events.filter(event => event.state === STATE_TYPES.AVAILABLE || event.state === STATE_TYPES.INFINITE);
    console.log('getAvailableEvents:', available.length, 'of', events.length, 'total');
    return available;
  }, [events]);

  const getAvailableBlocks = useCallback((): Block[] => {
    return blocks.filter(block => block.state === STATE_TYPES.AVAILABLE || block.state === STATE_TYPES.INFINITE);
  }, [blocks]);

  const getScheduledEvents = useCallback((): Event[] => {
    const scheduled = events.filter(event => event.state === STATE_TYPES.SCHEDULED);
    console.log('getScheduledEvents:', scheduled.length, 'scheduled events:', scheduled.map(e => ({ id: e.id, name: e.name, startDate: e.startDate, venue: e.venue })));
    return scheduled;
  }, [events]);

  const getScheduledBlocks = useCallback((): Block[] => {
    return blocks.filter(block => block.state === STATE_TYPES.SCHEDULED);
  }, [blocks]);

  
  const handleEventUpdate = (eventID: string, updates: Partial<Event>) => {
    console.log('handleEventUpdate called with:', eventID, updates);
    setEvents(prev => {
      console.log('setEvents callback - previous events:', prev.map(e => ({ id: e.id, state: e.state })));
      const updated = prev.map(event => {
        if (event.id === eventID) {
          const merged = { ...event, ...updates };
          console.log('Merging event:', event.id, 'old:', event, 'updates:', updates, 'result:', merged);
          return merged;
        }
        return event;
      });
      console.log('setEvents callback - new events:', updated.map(e => ({ id: e.id, state: e.state, startDate: e.startDate })));
      console.log('Scheduled after update:', updated.filter(e => e.state === STATE_TYPES.SCHEDULED));
      return updated;
    });
  };

  const handleEventCopy = (eventID: string) => {
    const eventToCopy = events.find(e => e.id === eventID);
    if (eventToCopy) {
      const newEvent: Event = {
        ...eventToCopy,
        id: `${eventToCopy.id}-copy-${Date.now()}`, // New unique ID
      };
      setEvents(prev => [...prev, newEvent]);
    }
  };

  const handleEventDelete = (eventID: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventID));
  };

  const handleBlockCopy = (blockID: string) => {
    const blockToCopy = blocks.find(b => b.id === blockID);
    if (blockToCopy) {
      const newBlock: Block = {
        ...blockToCopy,
        id: `${blockToCopy.id}-copy-${Date.now()}`, // New unique ID
      };
      setBlocks(prev => [...prev, newBlock]);
    }
  }

  const handleBlockUpdate = (blockID: string, updates: Partial<Block>) => {
    setBlocks(prev =>
      prev.map(block =>
        block.id === blockID ? { ...block, ...updates } : block
      )
    );
  };

  const handleBlockDelete = (blockID: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockID));
  }

  return {
    days,
    setDays,

    locations,
    setLocations,
    
    selectedItemID,
    setSelectedItemID,
    
    events,
    setEvents,
    getAvailableEvents,
    getScheduledEvents,
    handleEventUpdate,
    handleEventDelete,

    blocks,
    setBlocks,
    getAvailableBlocks,
    getScheduledBlocks,
    handleBlockUpdate,
    handleBlockDelete,
    handleBlockCopy
  };
}



/*


handleEventDrop = useCallback((
    item: Event | Block, 
    day: Date, 
    venue: Venue, 
    timeSlot: number
  ) => {
    // Check if it's a Block
    if ('id' in item && !('event' in item)) {
      // This is a Block
      const newScheduledBlock: Block = {
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

  const handleEventUpdate = useCallback((eventId: string, updates: Partial<Event>) => {
    // Always include state: "scheduled" in update operations
    const mergedUpdates: Partial<Event> = { ...updates, state: "scheduled" };

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


*/