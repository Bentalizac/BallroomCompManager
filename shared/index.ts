// Types exports
export type { User, Participant } from "./data/types/user";
export type { Competition } from "./data/types/competition";
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
export { EntryType, EventType, RoundLevel } from "./data/enums/eventTypes";

// Fake data exports
export {
  mockUsers,
  mockBallroomCompetitors,
  mockParticipants,
} from "./fakedata/user/fakeUsers";
//export { mockCompetitions } from './fakedata/competition/fakeCompetitions';
//export { mockEvents } from './fakedata/event/fakeEvents';

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
  type VenueApi as VenueApiType,
  type EventApi as EventApiType,
  type CompetitionApi as CompetitionApiType,
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
