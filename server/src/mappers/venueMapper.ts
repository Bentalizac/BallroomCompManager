import type { Database } from "../dal/database.types";
import type { Venue } from "@ballroomcompmanager/shared";

export type VenueRow = Pick<
  Database["public"]["Tables"]["venue"]["Row"],
  | "id"
  | "name"
  | "city"
  | "state"
  | "country"
  | "street"
  | "postal_code"
  | "google_maps_url"
>;

/**
 * Map venue database row to partial Venue domain object.
 *
 * Note: This returns a partial Venue representation. The database currently stores
 * city/state at the venue level, but the domain model uses a structured Address.
 * A database migration proposal will align the schema with the domain model.
 *
 * Temporary mapping creates a minimal address structure from available data.
 */
export function mapVenueRowToDTO(row: VenueRow): Venue {
  return {
    id: row.id,
    name: row.name,
    // Temporary: construct Address from city/state until database migration
    address: {
      street1: row.street || "",
      street2: "", // TODO: add street2 to database schema
      city: row.city || "",
      state: row.state || "",
      postalCode: row.postal_code || "",
      country: row.country || "",
    },
    floors: [], // Empty until database includes floor data
  };
}
