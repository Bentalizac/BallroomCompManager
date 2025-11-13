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
  EntryType,
  RoundLevel,
  DanceStyle,
  BallroomLevel,
  WCSLevel,
  CountrySwingLevel,
  type EventCategory,
  type EventLevel,
} from "./data/enums/eventTypes";

// API types exports
export {
  EventStatus,
  VenueApi,
  EventApi,
  CompetitionApi,
  registerForCompSchema,
  createCompetitionSchema,
  getCompetitionInfoSchema,
  createEventSchema,
  getEventInfoSchema,
  type EventStatus as EventStatusType,
} from "./api/schemas";

// Utility exports
export {
  generateCompetitionSlug,
  generateCompetitionSlugWithSuffix,
  isValidCompetitionSlug,
  extractNameFromSlug,
  extractYearFromSlug,
} from "./utils/slugs";
