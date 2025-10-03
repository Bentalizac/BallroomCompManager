import { EventType } from '@/../shared/data/enums/eventTypes';
import { CompEvent } from '@/../shared/data/types/event';

export interface Event {
  event: CompEvent;
  color: string;
}

export interface ScheduledEvent extends Event {
  startTime: number; // minutes from midnight
  duration: number; // minutes
  day: Date;
  venue: Venue;
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
  onEventDrop: (event: Event, day: Date, venue: Venue, timeSlot: number) => void;
  onEventMove: (eventId: string, newDay: Date, newVenue: Venue, newTimeSlot: number) => void;
  scheduledEvents: ScheduledEvent[];
  onEventSelect: (event: ScheduledEvent | null) => void;
  selectedEvent: ScheduledEvent | null;
  onEventUpdate: (eventId: string, updates: Partial<ScheduledEvent>) => void;
  locations: Venue[];
}


export interface TimelineProps {
    onEventSelect: (event: ScheduledEvent | null) => void;
    selectedEvent: ScheduledEvent | null;
    scheduledEvents: ScheduledEvent[];
    setScheduledEvents: React.Dispatch<React.SetStateAction<ScheduledEvent[]>>;
    setAvailableEvents?: React.Dispatch<React.SetStateAction<Event[]>>;
    onEventMove?: (eventId: string, updates: Partial<ScheduledEvent>) => void;
    days: Date[];
    locations: Venue[];
}

export interface VenueColumnProps {
  day: Date;
  venue: Venue;
  onEventDrop: (event: Event, day: Date, venue: Venue, timeSlot: number) => void;
  onEventMove: (eventId: string, newDay: Date, newVenue: Venue, newTimeSlot: number) => void;
  scheduledEvents: ScheduledEvent[];
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

export interface EventsListProps {
  events?: Event[];
  onEventDrop?: (event: Event) => void;
}

export interface DraggableEventProps {
  event: Event;
  onDragEnd?: (eventId: string) => void;
}

export interface EventsCategoryProps {
  title: string;
  events: Event[];
  onDragEnd?: (eventId: string) => void;
}