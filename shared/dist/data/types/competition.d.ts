import { CompEvent } from "./event";
/**
 * Represents a competition.
 *
 * @field id - Unique identifier for the competition.
 * @field slug - URL-friendly identifier for the competition.
 * @field startDate - The start date of the competition.
 * @field endDate - The end date of the competition.
 * @field timeZone - IANA time zone identifier (e.g., 'America/New_York').
 * @field events - List of events in the competition.
 * @field name - Name of the competition.
 * @field venue - Venue where the competition is held (nullable - some competitions may not have venue assigned yet).
 */
export interface Competition {
    id: string;
    slug: string;
    startDate: Date;
    endDate: Date;
    timeZone: string;
    events: CompEvent[];
    name: string;
    venue: Venue | null;
}
export interface Venue {
    id: string;
    name: string;
    address: Address | null;
    floors?: DanceFloor[];
}
export interface DanceFloor {
    size: string;
}
export interface Address {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}
//# sourceMappingURL=competition.d.ts.map