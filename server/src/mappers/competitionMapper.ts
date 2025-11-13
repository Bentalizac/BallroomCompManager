import type { Competition } from "@ballroomcompmanager/shared";
import type { VenueRow } from "./venueMapper";
import type { EventRow } from "./eventMapper";
import { mapVenueRowToDTO } from "./venueMapper";
import { mapEventRowEnrichedToCompEvent } from "./eventMapper";

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
 * Map competition database row to CompetitionApi DTO
 */
export function mapCompetitionRowToDTO(row: CompRow): Competition {
  var r = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    startDate: new Date(row.start_date),
    endDate: new Date(row.end_date),
    timeZone: row.time_zone,
    venue: row.venue ? mapVenueRowToDTO(row.venue) : null,
    events: row.events
      ? row.events.map((event) => mapEventRowEnrichedToCompEvent(event))
      : [],
  };
  return r;
}
