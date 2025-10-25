import { EventType } from '@/../shared/data/enums/eventTypes';
import { CompEvent } from '@/../shared/data/types/event';

export interface Event {
  event: CompEvent;
  color: string;
}

export interface Block {
  id: string;
  name: string;
  startTime: number; // minutes from midnight
  duration: number; // minutes
}

export interface ScheduledBlock extends Block {
  day: Date;
  venue: Venue;
}

export interface ScheduledEvent extends Event {
  startTime: number; // minutes from midnight
  duration: number; // minutes
  day: Date;
  venue: Venue;
  /** Optional local state flag for scheduling lifecycle */
  state?: string;
}

export interface EventPosition {
  column: number;
  totalColumns: number;
}

export interface Venue {
  name: string;
}

export interface DayColumnProps {
  day: Date;
  onEventDrop: (event: Event | Block, day: Date, venue: Venue, timeSlot: number) => void;
  onEventMove: (eventId: string, newDay: Date, newVenue: Venue, newTimeSlot: number) => void;
  scheduledEvents: ScheduledEvent[];
  scheduledBlocks: ScheduledBlock[];
  onEventSelect: (event: ScheduledEvent | null) => void;
  selectedEvent: ScheduledEvent | null;
  onEventUpdate: (eventId: string, updates: Partial<ScheduledEvent>) => void;
  locations: Venue[];
}


export interface TimelineProps {
    onEventSelect: (event: ScheduledEvent | null) => void;
    selectedEvent: ScheduledEvent | null;
    scheduledEvents: ScheduledEvent[];
    scheduledBlocks: ScheduledBlock[];
    setScheduledEvents: React.Dispatch<React.SetStateAction<ScheduledEvent[]>>;
    setScheduledBlocks: React.Dispatch<React.SetStateAction<ScheduledBlock[]>>;
    setAvailableEvents?: React.Dispatch<React.SetStateAction<Event[]>>;
    onEventMove?: (eventId: string, updates: Partial<ScheduledEvent>) => void;
    days: Date[];
    locations: Venue[];
}

export interface VenueColumnProps {
  day: Date;
  venue: Venue;
  onEventDrop: (event: Event | Block, day: Date, venue: Venue, timeSlot: number) => void;
  onEventMove: (eventId: string, newDay: Date, newVenue: Venue, newTimeSlot: number) => void;
  scheduledEvents: ScheduledEvent[];
  scheduledBlocks: ScheduledBlock[];
  onEventSelect: (event: ScheduledEvent | null) => void;
  selectedEvent: ScheduledEvent | null;
  onEventUpdate: (eventId: string, updates: Partial<ScheduledEvent>) => void;
}

export interface ScheduledEventProps {
  event: ScheduledEvent;
  onEventSelect: (event: ScheduledEvent | null) => void;
  selectedEvent: ScheduledEvent | null;
  onEventUpdate: (eventId: string, updates: Partial<ScheduledEvent>) => void;
  onEventMove: (eventId: string, newDay: Date, newVenue: Venue, newTimeSlot: number) => void;
}

export interface SidePanelProps {
  selectedEvent: ScheduledEvent | null;
  onEventUpdate?: (eventId: string, updates: Partial<ScheduledEvent>) => void;
}