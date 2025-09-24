import { EventType } from "../enums/eventTypes";
import { CompetitionRole } from "../enums/roles";
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}
/**
 * User information relative to a specific event, represents join between events and user tables
 * */
export interface Participant {
    /**Supabase ID */
    id: string;
    /**Supabase ID for applicable user */
    user: User;
    /**Supabase ID for the competition */
    competitionId: string;
    /**Supabase ID for the event */
    eventId: string;
    /**Role enum */
    role: CompetitionRole;
    /**What type of event is this */
    eventType: EventType;
}
//# sourceMappingURL=user.d.ts.map