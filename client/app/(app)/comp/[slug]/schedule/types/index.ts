import { CompEvent } from "@/../shared/data/types/event";
import { STATE_TYPES } from "../components/dnd/drag/draggableItem";

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
  color: string | null;
}

export interface Venue {
  name: string;
}
