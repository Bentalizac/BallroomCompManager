import type { Competition } from "@ballroomcompmanager/shared";
import type { VenueRow } from "./venueMapper";
import {
  EventRowEnriched,
  mapEventRowEnrichedToCompEvent,
  type EventRow,
} from "./eventMapper";
import { mapVenueRowToDTO } from "./venueMapper";

export type CompRow = {
  id: string;
  slug: string;
  name: string;
  start_date: string;
  end_date: string;
  time_zone: string;
  venue: VenueRow | null;
};

/**
 * Map competition database row to Competition domain type.
 *
 * Note: The events array from the competition query contains minimal event data
 * (EventRow without entry_type). For full event details including participants,

 * judges, and entry types, use the dedicated getCompetitionEvents endpoint.
 **/
export function mapCompetitionRowToDTO(row: CompRow): Competition {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    startDate: new Date(row.start_date),
    endDate: new Date(row.end_date),
    timeZone: row.time_zone,
    venue: row.venue ? mapVenueRowToDTO(row.venue) : null,

  };
}
