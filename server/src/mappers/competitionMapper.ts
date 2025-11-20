import type { Competition } from "@ballroomcompmanager/shared";
import type { VenueRow } from "./venueMapper";
import type { EventRow } from "./eventMapper";
import { mapVenueRowToDTO } from "./venueMapper";

export type CompRow = {
  id: string;
  slug: string;
  name: string;
  start_date: string;
  end_date: string;
  time_zone: string;
  venue: VenueRow | null;
  events: EventRow[] | null;
};

/**
 * Map competition database row to Competition domain type.
 * 
 * Note: The events array from the competition query contains minimal event data
 * (EventRow without entry_type). For full event details including participants,
 * judges, and entry types, use the dedicated getCompetitionEvents endpoint.
 * 
 * TODO: Update COMPETITION_FIELDS in dal/competition.ts to include entry_type
 * and other enriched event data to support full CompEvent mapping here.
 */
export function mapCompetitionRowToDTO(row: CompRow): Competition {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    startDate: new Date(row.start_date),
    endDate: new Date(row.end_date),
    timeZone: row.time_zone,
    venue: row.venue ? mapVenueRowToDTO(row.venue) : null,
    // Empty events array - clients should fetch events via dedicated endpoint
    // This prevents type mismatches between EventRow and EventRowEnriched
    events: [],
  };
}
