import { Participant, User } from "./user";

/**
 * Extra information needed for a competitor in a ballroom event
 */
export interface BallroomCompetitor extends Participant {
  /**
   * User ID for partner, is nullable for events such as WCS or other circumstances
   */
  partner?: User;
  /**
   * Number for the competitor, if it's a woman, this will be the same as the man's number
   */
  competitorNumber: string;
  /**
   * Is this competitor the lead? (Usually the man) Relevant for WCS events and being able to tell gender/role
   */
  lead?: boolean;
}
