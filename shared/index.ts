// Types exports
export type { User, Participant } from "./data/types/user";
export type { Competition } from "./data/types/competition";
export type { CompEvent } from "./data/types/event";
export type { BallroomCompetitor } from "./data/types/userExtensions";
export type {
  Registration,
  EventRegistration,
} from "./data/types/registration";

// Enums exports
export { CompetitionRole } from "./data/enums/roles";
export { ScoringMethods } from "./data/enums/scoringMethods";
export { CompRoles, EventRoles } from "./data/enums/eventRoles";

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

// Domain types exports
export type {
  Venue as DomainVenue,
  Event as DomainEvent,
  Competition as DomainCompetition,
} from "./domain/types";

// Domain mappers exports
export {
  venueApiToDomain,
  eventApiToDomain,
  competitionApiToDomain,
} from "./domain/mappers";
