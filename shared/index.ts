// Types exports
export type { User, Participant } from "./data/types/user";
export type { Competition, Venue, Address } from "./data/types/competition";
export type { CompEvent } from "./data/types/event";
export type { BallroomCompetitor } from "./data/types/userExtensions";
export type {
  Registration,
  EventRegistration,
  EventRegistrationParticipant,
  EventRegistrationEntry,
  EventRegistrationApi,
} from "./data/types/registration";

// Enums exports
export { CompetitionRole } from "./data/enums/roles";
export { ScoringMethods } from "./data/enums/scoringMethods";
export { CompRoles, EventRoles } from "./data/enums/eventRoles";
export {
  RegistrationRoles,
  AllEventRegistrationRoles,
} from "./data/enums/eventRoles";
export type {
  RegistrationRole,
  AllEventRegistrationRole,
} from "./data/enums/eventRoles";
export {
  EntryType,
  RoundLevel,
  DanceStyle,
  BallroomLevel,
  WCSLevel,
  CountrySwingLevel,
  type EventCategory,
  type EventLevel,
} from "./data/enums/eventTypes";

// Validation exports
export {
  CompRoleSchema,
  EventRoleSchema,
  RegistrationRoleSchema,
  AllEventRegistrationRoleSchema,
  ScoringMethodSchema,
  EntryTypeSchema,
  DanceStyleSchema,
  BallroomLevelSchema,
} from "./validation/zodEnums";

// Utility exports
export {
  generateCompetitionSlug,
  generateCompetitionSlugWithSuffix,
  isValidCompetitionSlug,
  extractNameFromSlug,
  extractYearFromSlug,
} from "./utils/slugs";
