import type { Database } from '../dal/database.types';
import type { EventApi, EventStatus, CompEvent } from '@ballroomcompmanager/shared';
import { EventType, ScoringMethods } from '@ballroomcompmanager/shared';

export type EventRow = Pick<Database['public']['Tables']['event_info']['Row'], 
  'id' | 'name' | 'start_date' | 'end_date' | 'event_status' | 'comp_id' | 'category_ruleset_id'>;

// Extended event row for full CompEvent mapping
export type EventRowFull = Pick<Database['public']['Tables']['event_info']['Row'],
  'id' | 'name' | 'comp_id' | 'category_ruleset_id' | 'entry_type' | 'start_at' | 'end_at'>;

// Enriched event row with joined category, ruleset, and scoring data
export interface EventRowEnriched {
  id: string;
  name: string;
  comp_id: string;
  category_ruleset_id: string;
  entry_type: string | null;
  start_at: string | null;
  end_at: string | null;
  category_ruleset?: {
    id: string;
    event_category?: {
      id: string;
      name: string;
    };
    ruleset?: {
      id: string;
      name: string;
      scoring_method?: {
        id: string;
        method_name: string;
      };
    };
  };
}

/**
 * Map event database row to EventApi DTO (legacy)
 * @deprecated Use mapEventRowToCompEvent instead
 */
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

/**
 * Map event database row to CompEvent domain model (legacy - basic fields)
 * @deprecated Use mapEventRowEnrichedToCompEvent for full domain mapping
 */
export function mapEventRowToCompEvent(row: EventRowFull): CompEvent {
  // Map database entry_type to domain EntryType enum (database uses same values)
  const entryType: any = row.entry_type || 'solo'; // Default to 'solo'

  return {
    id: row.id,
    competitionId: row.comp_id,
    category: 'Standard' as any, // TODO: fetch from category_ruleset join
    name: row.name,
    competitors: [], // TODO: fetch from event_registration_participants
    judges: [], // TODO: fetch from event_registration_participants
    scoring: 'Skating' as any, // TODO: fetch from category_ruleset -> ruleset -> scoring_method
    entryType,
    startDate: row.start_at ? new Date(row.start_at) : null,
    endDate: row.end_at ? new Date(row.end_at) : null,
  };
}

/**
 * Map enriched event database row to CompEvent domain model
 * This is the primary mapper for events with full type safety
 */
export function mapEventRowEnrichedToCompEvent(row: EventRowEnriched): CompEvent {
  // Map database entry_type to domain EntryType enum (database uses same string values)
  const entryType: any = row.entry_type || 'solo'; // Default to 'solo'

  // Map category name to EventType numeric enum
  // EventType enum: Ballroom = 0, Latin = 1, Other = 2
  let category: EventType = EventType.Other; // Default to Other (2)
  const categoryName = row.category_ruleset?.event_category?.name?.toLowerCase();
  if (categoryName) {
    switch (categoryName) {
      case 'ballroom':
      case 'standard':
      case 'smooth':
        category = EventType.Ballroom;
        break;
      case 'latin':
      case 'rhythm':
        category = EventType.Latin;
        break;
      default:
        category = EventType.Other;
    }
  }

  // Map scoring method name to ScoringMethods enum
  // Currently only ScoringMethods.Ballroom = "ballroom" is defined
  let scoring: ScoringMethods = ScoringMethods.Ballroom; // Default to ballroom
  const scoringName = row.category_ruleset?.ruleset?.scoring_method?.method_name?.toLowerCase();
  if (scoringName) {
    // When more scoring methods are added to the enum, add cases here
    switch (scoringName) {
      case 'ballroom':
      case 'skating':
      default:
        scoring = ScoringMethods.Ballroom;
    }
  }

  return {
    id: row.id,
    competitionId: row.comp_id,
    category,
    name: row.name,
    competitors: [], // TODO: fetch from event_registration_participants
    judges: [], // TODO: fetch from event_registration_participants
    scoring,
    entryType,
    startDate: row.start_at ? new Date(row.start_at) : null,
    endDate: row.end_at ? new Date(row.end_at) : null,
  };
}
