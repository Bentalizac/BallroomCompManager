import { Database } from "../dal/database.types";
import { CompEvent, EntryType } from "@ballroomcompmanager/shared";

export function hydrateEvent(
  eventRow: Database["public"]["Tables"]["event_info"]["Row"],
): CompEvent {
  var entrytype = EntryType;

  return {
    id: eventRow.id,
    competitionId: eventRow.comp_id,
    // category: eventRow.category_ruleset_id, // TODO Fetch category ruleset and map to EventType
    name: eventRow.name,
    startDate: new Date(eventRow.start_at),
    endDate: new Date(eventRow.end_at),
    competitors: [], // TODO Fetch competitors and hydrate
    judges: [], // TODO Fetch judges and hydrate
    // scoring: eventRow. // TODO Fetch scoring method from ruleset
    entryType: stringToEnumValue<typeof EntryType>(
      EntryType,
      eventRow.entry_type!,
    )!,
  };
}

/**
 * Maps a string to a string enum value.
 * Returns the enum value if found, otherwise undefined.
 */
export function stringToEnumValue<T extends { [key: string]: string }>(
  enumObj: T,
  value: string,
): T[keyof T] | undefined {
  const values = Object.values(enumObj) as string[];
  return values.includes(value) ? (value as T[keyof T]) : undefined;
}
