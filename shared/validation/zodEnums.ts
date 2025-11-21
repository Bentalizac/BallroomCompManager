import { z } from "zod";
import {
  CompRoles,
  EventRoles,
  RegistrationRoles,
  AllEventRegistrationRoles,
} from "../data/enums/eventRoles";
import { ScoringMethods } from "../data/enums/scoringMethods";
import { EntryType, DanceStyle, BallroomLevel } from "../data/enums/eventTypes";

/**
 * Utility to create Zod enum from readonly array
 * Ensures validation schemas stay in sync with enum definitions
 */
function zodEnumFromArray(arr: readonly string[]) {
  if (arr.length === 0) throw new Error("Array must have at least one element");
  const [first, ...rest] = arr;
  return z.enum([first!, ...rest] as [string, ...string[]]);
}

// Competition and Event Roles
export const CompRoleSchema = z.nativeEnum(CompRoles);
export const EventRoleSchema = z.nativeEnum(EventRoles);
export const RegistrationRoleSchema = zodEnumFromArray(RegistrationRoles);
export const AllEventRegistrationRoleSchema = zodEnumFromArray(AllEventRegistrationRoles);

// Scoring and Entry Types
export const ScoringMethodSchema = z.nativeEnum(ScoringMethods);
export const EntryTypeSchema = z.nativeEnum(EntryType);
export const DanceStyleSchema = z.nativeEnum(DanceStyle);
export const BallroomLevelSchema = z.nativeEnum(BallroomLevel);
