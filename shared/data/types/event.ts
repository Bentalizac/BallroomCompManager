import { EventType } from "../enums/eventTypes";
import { ScoringMethods } from "../enums/scoringMethods";
import { Competition } from "./competition";
import { Participant } from "./user";

export interface CompEvent {
    id: string,
    competitionId: string,
    /** Event category as submitted by competition organizer */
    category: EventType,
    /** Event name */
    name: string,
    /**Participants assigned to event with competitor role */
    competitors: Participant[]
    /**Participants assigned to event with judge role */
    judges: Participant[]
    /**Scoring type */
    scoring: ScoringMethods

    startDate: Date | null;
    endDate: Date | null;
}