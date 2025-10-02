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
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),   // YYYY-MM-DD format
  status: EventStatus,
});
export type EventApi = z.infer<typeof EventApi>;

// Competition API Schema
export const CompetitionApi = z.object({
  id: z.string().uuid(),
  name: z.string(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),   // YYYY-MM-DD format
  venue: VenueApi.nullable().optional(),
  events: z.array(EventApi),
});
export type CompetitionApi = z.infer<typeof CompetitionApi>;