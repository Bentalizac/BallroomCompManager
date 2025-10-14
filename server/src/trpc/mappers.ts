import type { Database } from '../dal/database.types';
import type { VenueApi, EventApi, CompetitionApi, EventStatus } from '@ballroomcompmanager/shared';

// Type aliases for selected row shapes using Database types
export type VenueRow = Pick<Database['public']['Tables']['venue']['Row'], 'id' | 'name' | 'city' | 'state'>;

export type EventRow = Pick<Database['public']['Tables']['event_info']['Row'], 
  'id' | 'name' | 'start_date' | 'end_date' | 'event_status' | 'comp_id' | 'category_ruleset_id'>;

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

// Map venue row to DTO
export function mapVenueRowToDTO(row: VenueRow): VenueApi {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    state: row.state,
  };
}

// Map event row to DTO
export function mapEventRowToDTO(row: EventRow, compTimeZone: string): EventApi {
  // Validate and coerce event_status to EventStatus enum
  let eventStatus: EventStatus;
  switch (row.event_status) {
    case 'scheduled':
    case 'current':
    case 'completed':
    case 'cancelled':
      eventStatus = row.event_status;
      break;
    default:
      // Fail fast for unknown statuses
      throw new Error(`Unknown event status: ${row.event_status}`);
  }

  return {
    id: row.id,
    name: row.name,
    startAt: row.start_date + 'T00:00:00.000Z', // Convert date to ISO UTC timestamp
    endAt: row.end_date + 'T23:59:59.999Z',     // Convert date to ISO UTC timestamp
    competitionId: row.comp_id,
    categoryRulesetId: row.category_ruleset_id,
    eventStatus,
    timeZone: compTimeZone, // Pass competition's time zone
  };
}

// Map competition row to DTO
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
