"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockParticipants = exports.mockBallroomCompetitors = exports.mockUsers = exports.ScoringMethods = exports.CompetitionRole = void 0;
// Enums exports
var roles_1 = require("./data/enums/roles");
Object.defineProperty(exports, "CompetitionRole", { enumerable: true, get: function () { return roles_1.CompetitionRole; } });
var scoringMethods_1 = require("./data/enums/scoringMethods");
Object.defineProperty(exports, "ScoringMethods", { enumerable: true, get: function () { return scoringMethods_1.ScoringMethods; } });
// Fake data exports
var fakeUsers_1 = require("./fakedata/user/fakeUsers");
Object.defineProperty(exports, "mockUsers", { enumerable: true, get: function () { return fakeUsers_1.mockUsers; } });
Object.defineProperty(exports, "mockBallroomCompetitors", { enumerable: true, get: function () { return fakeUsers_1.mockBallroomCompetitors; } });
Object.defineProperty(exports, "mockParticipants", { enumerable: true, get: function () { return fakeUsers_1.mockParticipants; } });
//export { mockCompetitions } from './fakedata/competition/fakeCompetitions';
//export { mockEvents } from './fakedata/event/fakeEvents';
// API types exports
//# sourceMappingURL=index.js.map