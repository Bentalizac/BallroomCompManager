import { EventType } from '@/../shared/data/enums/eventTypes';
import { CompEvent } from '@/../shared/data/types/event';
import { STATE_TYPES } from '../components/dnd/drag/draggableItem';

export interface Event extends CompEvent {
  color: string | null;
  venue: Venue | null;
  state: STATE_TYPES;
}

export interface Block {
  id: string;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  venue: Venue | null;
  eventIds?: string[];
  state: STATE_TYPES;
}

export interface EventPosition {
  column: number;
  totalColumns: number;
}

export interface Venue {
  name: string;
}


export interface ScheduledEventProps {
  event: Event;
  onEventSelect: (event: Event | null) => void;
  selectedEvent: Event | null;
  onEventUpdate: (eventId: string, updates: Partial<Event>) => void;
  onEventMove: (eventId: string, newDay: Date, newVenue: Venue, newTimeSlot: number) => void;
}

export interface SidePanelProps {
  selectedEvent: Event | null;
  onEventUpdate?: (eventId: string, updates: Partial<Event>) => void;
}