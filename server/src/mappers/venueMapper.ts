import type { Database } from '../dal/database.types';
import type { VenueApi } from '@ballroomcompmanager/shared';

export type VenueRow = Pick<Database['public']['Tables']['venue']['Row'], 'id' | 'name' | 'city' | 'state'>;

/**
 * Map venue database row to VenueApi DTO
 */
export function mapVenueRowToDTO(row: VenueRow): VenueApi {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    state: row.state,
  };
}
