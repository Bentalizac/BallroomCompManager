export interface EventData {
  id: string;
  name: string;
  category: 'Latin' | 'Ballroom' | 'Other';
  division?: string;
  type?: string;
}

export interface Event {
  event: EventData;
  color: string;
}

export interface ScheduledEvent extends Event {
  startTime: number; // minutes from midnight
  duration: number; // minutes
  day: '10/9' | '10/10';
  venue: 'Wilk' | 'RB';
}

export interface EventPosition {
  column: number;
  totalColumns: number;
}

// Enums for better type safety
export enum Venue {
  WILK = 'Wilk',
  RB = 'RB'
}

export enum Day {
  DAY_1 = '10/9',
  DAY_2 = '10/10'
}

export enum EventCategory {
  LATIN = 'Latin',
  BALLROOM = 'Ballroom',
  OTHER = 'Other'
}

// Component Props Interfaces
export interface TimelineProps {
  onEventSelect: (event: ScheduledEvent | null) => void;
  selectedEvent: ScheduledEvent | null;
  scheduledEvents: ScheduledEvent[];
  setScheduledEvents: React.Dispatch<React.SetStateAction<ScheduledEvent[]>>;
}

export interface VenueColumnProps {
  day: '10/9' | '10/10';
  venue: 'Wilk' | 'RB';
  onEventDrop: (event: Event, day: '10/9' | '10/10', venue: 'Wilk' | 'RB', timeSlot: number) => void;
  onEventMove: (eventId: string, newDay: '10/9' | '10/10', newVenue: 'Wilk' | 'RB', newTimeSlot: number) => void;
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
  onEventMove: (eventId: string, newDay: '10/9' | '10/10', newVenue: 'Wilk' | 'RB', newTimeSlot: number) => void;
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