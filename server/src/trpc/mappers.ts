import type { Database } from '../dal/database.types';
import type { VenueApi, EventApi, CompetitionApi, EventStatus } from '@ballroomcompmanager/shared';

// Type aliases for selected row shapes using Database types
export type VenueRow = Pick<Database['public']['Tables']['venue']['Row'], 'id' | 'name' | 'city' | 'state'>;

export type EventRow = Pick<Database['public']['Tables']['event_info']['Row'], 'id' | 'name' | 'start_date' | 'end_date' | 'event_status'>;

export type CompRow = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
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
export function mapEventRowToDTO(row: EventRow): EventApi {
  // Validate and coerce event_status to EventStatus enum
  let status: EventStatus;
  switch (row.event_status) {
    case 'scheduled':
    case 'current':
    case 'completed':
    case 'cancelled':
      status = row.event_status;
      break;
    default:
      // Fail fast for unknown statuses
      throw new Error(`Unknown event status: ${row.event_status}`);
  }

  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    status,
  };
}

// Map competition row to DTO
export function mapCompetitionRowToDTO(row: CompRow): CompetitionApi {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    venue: row.venue ? mapVenueRowToDTO(row.venue) : null,
    events: row.events ? row.events.map(mapEventRowToDTO) : [],
  };
}