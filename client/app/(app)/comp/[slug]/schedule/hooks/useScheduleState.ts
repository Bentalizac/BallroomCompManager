import { useState, useCallback, useEffect } from 'react';
import { Event, Block } from '../types';
import { mockBlocks, mockEvents } from '../data/mockData';
import { Venue } from '../types';
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
  
  const [days, setDays] = useState<Date[]>([day1, day2]);
  const [locations, setLocations] = useState<Venue[]>([{ name: 'Wilk' }, { name: 'RB' }]);
  
  const [selectedItemID, setSelectedItemIDState] = useState<string | null>(null);
  
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [blocks, setBlocks] = useState<Block[]>(mockBlocks);

  // Wrapper for setSelectedItemID with logging
  const setSelectedItemID = useCallback((id: string | null) => {
    console.log('setSelectedItemID called with:', id);
    setSelectedItemIDState(id);
  }, []);

  useEffect(() => {
    console.log('selectedItemID changed to:', selectedItemID);
  }, [selectedItemID]);

  const getAvailableEvents = useCallback((): Event[] => {
    return events.filter(event => event.state === STATE_TYPES.AVAILABLE || event.state === STATE_TYPES.INFINITE);
  }, [events]);

  const getAvailableBlocks = useCallback((): Block[] => {
    return blocks.filter(block => block.state === STATE_TYPES.AVAILABLE || block.state === STATE_TYPES.INFINITE);
  }, [blocks]);

  const getScheduledEvents = useCallback((): Event[] => {
    return events.filter(event => event.state === STATE_TYPES.SCHEDULED);
  }, [events]);

  const getScheduledBlocks = useCallback((): Block[] => {
    return blocks.filter(block => block.state === STATE_TYPES.SCHEDULED);
  }, [blocks]);

  
  const handleEventUpdate = (eventID: string, updates: Partial<Event>) => {
    setEvents(prev => {
      const updated = prev.map(event => {
        if (event.id === eventID) {
          const merged = { ...event, ...updates };
          return merged;
        }
        return event;
      });
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
    const blockToDelete = blocks.find(b => b.id === blockID);
    if (blockToDelete) {
      blockToDelete.eventIds?.forEach(eventID => {
        handleEventUpdate(eventID, { state: STATE_TYPES.AVAILABLE, venue: null, startDate: null, endDate: null });
      });
    }
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
    handleEventCopy,

    blocks,
    setBlocks,
    getAvailableBlocks,
    getScheduledBlocks,
    handleBlockUpdate,
    handleBlockDelete,
    handleBlockCopy
  };
}