import { CompEvent } from "./event";
/**
 * Represents a competition.
 *
 * @field id - Unique identifier for the competition.
 * @field slug - URL-friendly identifier for the competition.
 * @field startDate - The start date of the competition.
 * @field endDate - The end date of the competition.
 * @field events - List of events in the competition.
 * @field name - Name of the competition.
 */
export interface Competition {
  id: string;
  slug: string;
  startDate: Date;
  endDate: Date;
  events: CompEvent[];
  name: string;
  location: Venue;
}

export interface Venue {
  name: string;
  address: Address;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
