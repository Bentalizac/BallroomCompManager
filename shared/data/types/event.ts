import { EventType, RoundLevel } from "../enums/eventTypes";
import { ScoringMethods } from "../enums/scoringMethods";
import { Participant } from "./user";

export interface CompEvent {
  id: string;
  competitionId: string;
  /** Event category as submitted by competition organizer */
  category: EventType;
  /** Event name */
  name: string;
  /**Participants assigned to event with competitor role */
  competitors: Participant[];
  /**Participants assigned to event with judge role */
  judges: Participant[];
  /**Scoring type */
  scoring: ScoringMethods;

  startDate: Date | null;
  endDate: Date | null;
}

export interface EventRound {
  id: string;
  // eventID this round belongs to
  eventId: string;
  roundLevel: RoundLevel;

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
