import { EntryType, EventCategory, RoundLevel } from "../enums/eventTypes";
import { Participant } from "./user";
import { ScoringMethods } from "../enums/scoringMethods";

/**
 * Represents a competition event.
 * @property {string} id - Unique identifier for the event.
 * @property {string} competitionId - Identifier for the competition this event belongs to.
 * @property {EventType} category - Event category as submitted by competition organizer.
 * @property {string} name - Event name.
 * @property {Participant[]} competitors - Participants assigned to event with competitor role.
 * @property {Participant[]} judges - Participants assigned to event with judge role.
 * @property {ScoringMethods} scoring - Scoring type.
 * @property {EntryType} entryType - Entry type for the event.
 * @property {Date | null} startDate - Event start date.
 * @property {Date | null} endDate - Event end date.
 */
export interface CompEvent {
  id: string;
  competitionId: string;
  /** Event category as submitted by competition organizer */
  category: EventCategory;
  /** Event name */
  name: string;
  /**Participants assigned to event with competitor role */
  competitors: Participant[];
  /**Participants assigned to event with judge role */
  judges: Participant[];
  /**Scoring type */
  scoring: ScoringMethods;

  entryType: EntryType;

  startDate: Date | null;
  endDate: Date | null;
}

export interface EventRound {
  id: string;
  // eventID this round belongs to
  eventId: string;
  roundLevel: RoundLevel;
  dances: string[];
  //Time needs to be accurate to the minute
  startTime: Date | null;
  endTime: Date | null;
}

export interface RoundHeat {
  id: string;
  roundId: string;
  heatNumber: number;

  startTime: Date | null;
  endTime: Date | null;
}
