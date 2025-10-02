import type { VenueApi, EventApi, CompetitionApi } from '../api/schemas';
import type { Venue, Event, Competition } from './types';

// Helper function to safely parse date strings
function parseDate(dateString: string): Date {
  const date = new Date(dateString + 'T00:00:00.000Z'); // Treat as UTC to avoid timezone issues
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  return date;
}

// Convert VenueApi to Domain Venue
export function venueApiToDomain(venueApi: VenueApi): Venue {
  return {
    id: venueApi.id,
    name: venueApi.name,
    city: venueApi.city,
    state: venueApi.state,
  };
}

// Convert EventApi to Domain Event
export function eventApiToDomain(eventApi: EventApi): Event {
  return {
    id: eventApi.id,
    name: eventApi.name,
    startDate: parseDate(eventApi.startDate),
    endDate: parseDate(eventApi.endDate),
    status: eventApi.status,
  };
}

// Convert CompetitionApi to Domain Competition
export function competitionApiToDomain(competitionApi: CompetitionApi): Competition {
  return {
    id: competitionApi.id,
    name: competitionApi.name,
    startDate: parseDate(competitionApi.startDate),
    endDate: parseDate(competitionApi.endDate),
    venue: competitionApi.venue ? venueApiToDomain(competitionApi.venue) : competitionApi.venue,
    events: competitionApi.events.map(eventApiToDomain),
  };
}