"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractYearFromSlug = exports.extractNameFromSlug = exports.isValidCompetitionSlug = exports.generateCompetitionSlugWithSuffix = exports.generateCompetitionSlug = exports.competitionApiToDomain = exports.eventApiToDomain = exports.venueApiToDomain = exports.getEventInfoSchema = exports.createEventSchema = exports.getCompetitionInfoSchema = exports.createCompetitionSchema = exports.registerForCompSchema = exports.CompetitionApi = exports.EventApi = exports.VenueApi = exports.EventStatus = exports.mockParticipants = exports.mockBallroomCompetitors = exports.mockUsers = exports.EventRoles = exports.CompRoles = exports.ScoringMethods = exports.CompetitionRole = void 0;
// Enums exports
var roles_1 = require("./data/enums/roles");
Object.defineProperty(exports, "CompetitionRole", { enumerable: true, get: function () { return roles_1.CompetitionRole; } });
var scoringMethods_1 = require("./data/enums/scoringMethods");
Object.defineProperty(exports, "ScoringMethods", { enumerable: true, get: function () { return scoringMethods_1.ScoringMethods; } });
var eventRoles_1 = require("./data/enums/eventRoles");
Object.defineProperty(exports, "CompRoles", { enumerable: true, get: function () { return eventRoles_1.CompRoles; } });
Object.defineProperty(exports, "EventRoles", { enumerable: true, get: function () { return eventRoles_1.EventRoles; } });
// Fake data exports
var fakeUsers_1 = require("./fakedata/user/fakeUsers");
Object.defineProperty(exports, "mockUsers", { enumerable: true, get: function () { return fakeUsers_1.mockUsers; } });
Object.defineProperty(exports, "mockBallroomCompetitors", { enumerable: true, get: function () { return fakeUsers_1.mockBallroomCompetitors; } });
Object.defineProperty(exports, "mockParticipants", { enumerable: true, get: function () { return fakeUsers_1.mockParticipants; } });
//export { mockCompetitions } from './fakedata/competition/fakeCompetitions';
//export { mockEvents } from './fakedata/event/fakeEvents';
// API types exports
var schemas_1 = require("./api/schemas");
Object.defineProperty(exports, "EventStatus", { enumerable: true, get: function () { return schemas_1.EventStatus; } });
Object.defineProperty(exports, "VenueApi", { enumerable: true, get: function () { return schemas_1.VenueApi; } });
Object.defineProperty(exports, "EventApi", { enumerable: true, get: function () { return schemas_1.EventApi; } });
Object.defineProperty(exports, "CompetitionApi", { enumerable: true, get: function () { return schemas_1.CompetitionApi; } });
Object.defineProperty(exports, "registerForCompSchema", { enumerable: true, get: function () { return schemas_1.registerForCompSchema; } });
Object.defineProperty(exports, "createCompetitionSchema", { enumerable: true, get: function () { return schemas_1.createCompetitionSchema; } });
Object.defineProperty(exports, "getCompetitionInfoSchema", { enumerable: true, get: function () { return schemas_1.getCompetitionInfoSchema; } });
Object.defineProperty(exports, "createEventSchema", { enumerable: true, get: function () { return schemas_1.createEventSchema; } });
Object.defineProperty(exports, "getEventInfoSchema", { enumerable: true, get: function () { return schemas_1.getEventInfoSchema; } });
// Domain mappers exports
var mappers_1 = require("./domain/mappers");
Object.defineProperty(exports, "venueApiToDomain", { enumerable: true, get: function () { return mappers_1.venueApiToDomain; } });
Object.defineProperty(exports, "eventApiToDomain", { enumerable: true, get: function () { return mappers_1.eventApiToDomain; } });
Object.defineProperty(exports, "competitionApiToDomain", { enumerable: true, get: function () { return mappers_1.competitionApiToDomain; } });
// Utility exports
var slugs_1 = require("./utils/slugs");
Object.defineProperty(exports, "generateCompetitionSlug", { enumerable: true, get: function () { return slugs_1.generateCompetitionSlug; } });
Object.defineProperty(exports, "generateCompetitionSlugWithSuffix", { enumerable: true, get: function () { return slugs_1.generateCompetitionSlugWithSuffix; } });
Object.defineProperty(exports, "isValidCompetitionSlug", { enumerable: true, get: function () { return slugs_1.isValidCompetitionSlug; } });
Object.defineProperty(exports, "extractNameFromSlug", { enumerable: true, get: function () { return slugs_1.extractNameFromSlug; } });
Object.defineProperty(exports, "extractYearFromSlug", { enumerable: true, get: function () { return slugs_1.extractYearFromSlug; } });
//# sourceMappingURL=index.js.map