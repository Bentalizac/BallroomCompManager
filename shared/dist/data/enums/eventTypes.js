"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryType = exports.RoundLevel = exports.EventType = void 0;
/**
 * Represents the type of event in a dance competition.
 * @enum {number}
 */
var EventType;
(function (EventType) {
    EventType[EventType["Ballroom"] = 0] = "Ballroom";
    EventType[EventType["Latin"] = 1] = "Latin";
    EventType[EventType["Other"] = 2] = "Other";
})(EventType || (exports.EventType = EventType = {}));
/**
 * Represents the level of a competition round.
 * @enum {number}
 */
var RoundLevel;
(function (RoundLevel) {
    RoundLevel[RoundLevel["Final"] = 0] = "Final";
    RoundLevel[RoundLevel["Semifinal"] = 1] = "Semifinal";
    RoundLevel[RoundLevel["Quarterfinal"] = 2] = "Quarterfinal";
    RoundLevel[RoundLevel["Prelim"] = 3] = "Prelim";
})(RoundLevel || (exports.RoundLevel = RoundLevel = {}));
/**
 * Represents the type of entry in a competition.
 * @enum {string}
 * @property {string} Solo - "solo"
 * @property {string} Partner - "partner"
 * @property {string} Team - "team"
 */
var EntryType;
(function (EntryType) {
    EntryType["Solo"] = "solo";
    EntryType["Partner"] = "partner";
    EntryType["Team"] = "team";
})(EntryType || (exports.EntryType = EntryType = {}));
//# sourceMappingURL=eventTypes.js.map