import type { Database } from "../dal/database.types";
import type {
  CompEvent,
  CountrySwingLevel,
  WCSLevel,
} from "@ballroomcompmanager/shared";
import {
  BallroomLevel,
  DanceStyle,
  EventCategory,
  ScoringMethods,
} from "@ballroomcompmanager/shared";
import { OtherLevel } from "@ballroomcompmanager/shared/dist/data/enums/eventTypes";

export type EventRow = Pick<
  Database["public"]["Tables"]["event_info"]["Row"],
  | "id"
  | "name"
  | "start_at"
  | "end_at"
  | "event_status"
  | "comp_id"
  | "dance_style"
  | "event_level"
  | "ruleset_id"
>;

// Extended event row for full CompEvent mapping
export type EventRowFull = Pick<
  Database["public"]["Tables"]["event_info"]["Row"],
  | "id"
  | "name"
  | "comp_id"
  | "dance_style"
  | "event_level"
  | "ruleset_id"
  | "entry_type"
  | "start_at"
  | "end_at"
>;

// Enriched event row with direct joins to dance_styles, event_levels, and rulesets
export interface EventRowEnriched {
  id: string;
  name: string;
  comp_id: string;
  entry_type: string | null;
  start_at: string | null;
  end_at: string | null;
  dance_style?: {
    id: string;
    name: string;
  };
  event_level?: {
    id: string;
    name: string;
  };
  ruleset?: {
    id: string;
    name: string;
    scoring_method?: {
      id: string;
      name: string;
    };
  };
}

/**
 * Map enriched event database row to CompEvent domain model
 * This is the primary mapper for events with full type safety
 */
export function mapEventRowEnrichedToCompEvent(
  row: EventRowEnriched,
): CompEvent {
  // Map database entry_type to domain EntryType enum (database uses same string values)
  const entryType: any = row.entry_type || "solo"; // Default to 'solo'

  let category: EventCategory;
  const style = row.dance_style?.name;
  switch (style) {
    case DanceStyle.Ballroom:
    case DanceStyle.Latin:
    case DanceStyle.Smooth:
    case DanceStyle.Rhythm:
      category = {
        style: style,
        level: row.event_level!.name as BallroomLevel,
      };
      break;
    case DanceStyle.WestCoast:
      category = {
        style: style,
        level: row.event_level!.name as WCSLevel,
      };
      break;
    case DanceStyle.CountrySwing:
      category = {
        style: style,
        level: row.event_level!.name as CountrySwingLevel,
      };
      break;
    default:
      category = {
        style: DanceStyle.Other,
        level: OtherLevel.Other,
      };
      break;
  }

  // Map scoring method name to ScoringMethods enum
  // Currently only ScoringMethods.Ballroom = "ballroom" is defined
  let scoring: ScoringMethods = ScoringMethods.Ballroom; // Default to ballroom
  const scoringName = row.ruleset?.scoring_method?.name?.toLowerCase();
  if (scoringName) {
    // When more scoring methods are added to the enum, add cases here
    switch (scoringName) {
      case "ballroom":
      case "skating":
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
