import { z } from 'zod';

// Event Status Enum
export const EventStatus = z.enum(['scheduled', 'current', 'completed', 'cancelled']);
export type EventStatus = z.infer<typeof EventStatus>;

// Venue API Schema
export const VenueApi = z.object({
  id: z.string().uuid(),
  name: z.string(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
});
export type VenueApi = z.infer<typeof VenueApi>;

// Event API Schema
export const EventApi = z.object({
  id: z.string().uuid(),
  name: z.string(),
  startAt: z.string().datetime(), // ISO 8601 UTC timestamp
  endAt: z.string().datetime(),   // ISO 8601 UTC timestamp
  competitionId: z.string().uuid(),
  categoryRulesetId: z.string().uuid(),
  eventStatus: EventStatus,
  timeZone: z.string(), // Competition's time zone (e.g., 'America/New_York')
});
export type EventApi = z.infer<typeof EventApi>;

// Competition API Schema
export const CompetitionApi = z.object({
  id: z.string().uuid(),
  name: z.string(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format (date-only)
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),   // YYYY-MM-DD format (date-only)
  timeZone: z.string(), // IANA time zone identifier (e.g., 'America/New_York')
  venue: VenueApi.nullable().optional(),
  events: z.array(EventApi),
});
export type CompetitionApi = z.infer<typeof CompetitionApi>;
