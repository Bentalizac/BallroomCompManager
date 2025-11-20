import { z } from "zod";
import type { Competition, CompEvent, Venue } from "@ballroomcompmanager/shared";
import { EntryType, ScoringMethods } from "@ballroomcompmanager/shared";

/**
 * Validation schemas for domain types.
 * 
 * Architecture principle: Domain types (TypeScript interfaces in shared/) are the
 * canonical source of truth. Zod schemas are used ONLY for runtime validation at
 * API boundaries within the server.
 * 
 * These schemas handle wire format transformations (e.g., ISO date strings → Date objects)
 * and validate that incoming data conforms to the domain model.
 * 
 * The client does NOT use these schemas - it receives fully-typed domain objects
 * through tRPC's type inference.
 * 
 * @see rag/design/architecture/adr-004-type-system-architecture.md
 */

/**
 * Wire format for Venue data (partial representation for API responses).
 * Full Venue domain type includes address and floors which may not always be transmitted.
 */
export const VenueSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
});

export type VenueWireFormat = z.infer<typeof VenueSchema>;

/**
 * Wire format for CompEvent data.
 * Dates are transmitted as ISO strings and transformed to Date objects.
 * 
 * Note: EventCategory is a complex discriminated union that requires special handling.
 * For now, we validate it as 'any' since the mapper handles proper type construction.
 * Participant arrays are also loosely typed until we implement full participant validation.
 */
export const CompEventSchema = z.object({
  id: z.string().uuid(),
  competitionId: z.string().uuid(),
  category: z.any(), // EventCategory is a discriminated union - validated by mapper
  name: z.string(),
  competitors: z.array(z.any()), // Participant[] - validated when participant schema is added
  judges: z.array(z.any()), // Participant[] - validated when participant schema is added
  scoring: z.nativeEnum(ScoringMethods),
  entryType: z.nativeEnum(EntryType),
  startDate: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .nullable(),
  endDate: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .nullable(),
});

/**
 * Wire format for Competition data.
 * 
 * Wire format differences from domain type:
 * - startDate/endDate are ISO strings (transformed to Date objects)
 * - venue is a partial Venue representation (only id, name, city, state)
 * - events are recursively validated CompEvents
 * 
 * Usage: CompetitionSchema.parse(wireData) validates and transforms to domain type.
 * 
 * Example:
 * ```typescript
 * const wireData = {
 *   id: "uuid",
 *   slug: "comp-2025",
 *   name: "Test Competition",
 *   startDate: "2025-01-01T00:00:00Z",
 *   endDate: "2025-01-02T00:00:00Z",
 *   timeZone: "America/New_York",
 *   venue: null,
 *   events: []
 * };
 * const competition: Competition = CompetitionSchema.parse(wireData);
 * ```
 */
export const CompetitionSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  startDate: z
    .string()
    .datetime()
    .transform((str) => new Date(str)),
  endDate: z
    .string()
    .datetime()
    .transform((str) => new Date(str)),
  timeZone: z.string(),
  venue: VenueSchema.nullable().optional(),
  events: z.array(z.lazy(() => CompEventSchema)),
}) as z.ZodType<Competition>;

export type CompetitionWireFormat = z.input<typeof CompetitionSchema>;
