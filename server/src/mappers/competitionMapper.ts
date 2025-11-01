import type { CompetitionApi } from '@ballroomcompmanager/shared';
import type { VenueRow } from './venueMapper';
import type { EventRow } from './eventMapper';
import { mapVenueRowToDTO } from './venueMapper';
import { mapEventRowToDTO } from './eventMapper';

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
export function mapCompetitionRowToDTO(row: CompRow): CompetitionApi {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    timeZone: row.time_zone,
    venue: row.venue ? mapVenueRowToDTO(row.venue) : null,
    events: row.events ? row.events.map(event => mapEventRowToDTO(event, row.time_zone)) : [],
  };
}
