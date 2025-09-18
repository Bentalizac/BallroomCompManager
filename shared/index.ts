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

// Fake data exports
export {
  mockUsers,
  mockBallroomCompetitors,
  mockParticipants,
} from "./fakedata/user/fakeUsers";
//export { mockCompetitions } from './fakedata/competition/fakeCompetitions';
//export { mockEvents } from './fakedata/event/fakeEvents';

// API types exports
