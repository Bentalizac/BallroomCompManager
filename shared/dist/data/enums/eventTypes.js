"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundLevel = exports.EventType = void 0;
var EventType;
(function (EventType) {
    EventType[EventType["Ballroom"] = 0] = "Ballroom";
    EventType[EventType["Latin"] = 1] = "Latin";
    EventType[EventType["Other"] = 2] = "Other";
})(EventType || (exports.EventType = EventType = {}));
var RoundLevel;
(function (RoundLevel) {
    RoundLevel[RoundLevel["Final"] = 0] = "Final";
    RoundLevel[RoundLevel["Semifinal"] = 1] = "Semifinal";
    RoundLevel[RoundLevel["Quarterfinal"] = 2] = "Quarterfinal";
    RoundLevel[RoundLevel["Prelim"] = 3] = "Prelim";
})(RoundLevel || (exports.RoundLevel = RoundLevel = {}));
//# sourceMappingURL=eventTypes.js.map