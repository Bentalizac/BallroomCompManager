import { z } from "zod";

import { CompRoles } from "../data/enums/eventRoles";

// Event Status Enum
export const EventStatus = z.enum([
  "scheduled",
  "current",
  "completed",
  "cancelled",
]);
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
  endAt: z.string().datetime(), // ISO 8601 UTC timestamp
  competitionId: z.string().uuid(),
  categoryRulesetId: z.string().uuid(),
  eventStatus: EventStatus,
  timeZone: z.string(), // Competition's time zone (e.g., 'America/New_York')
});
export type EventApi = z.infer<typeof EventApi>;

// Competition API Schema
export const CompetitionApi = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format (date-only)
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format (date-only)
  timeZone: z.string(), // IANA time zone identifier (e.g., 'America/New_York')
  venue: VenueApi.nullable().optional(),
  events: z.array(EventApi),
});
export type CompetitionApi = z.infer<typeof CompetitionApi>;

// Request and Response Schemas
export const getCompetitionInfoSchema = z.object({
  id: z.string(),
});
/**
 * Info to create a comp
 */
export const createCompetitionSchema = z.object({
  name: z.string().min(1, "Competition name is required"),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  location: z.string().optional(),
  description: z.string().optional(),
});

/**
 *Schemas for competition-related operations, used for getting a comp or for getting all info of a category for a comp
 */
export const getEventInfoSchema = z.object({
  id: z.string(),
});
/**
 * Info to create a comp
 */
export const createEventSchema = z.object({
  name: z.string().min(1, "Competition name is required"),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  location: z.string().optional(),
  description: z.string().optional(),
});

export const registerForCompSchema = {
  userId: z.string().uuid(),
  competitionId: z.string().uuid(),
  roles: z.array(z.enum(CompRoles)).min(1),
};
