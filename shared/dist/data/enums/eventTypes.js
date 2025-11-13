"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryType = exports.RoundLevel = exports.OtherLevel = exports.CountrySwingLevel = exports.WCSLevel = exports.BallroomLevel = exports.DanceStyle = void 0;
/**
 * Represents the dance style of an event.
 */
var DanceStyle;
(function (DanceStyle) {
    DanceStyle["Ballroom"] = "ballroom";
    DanceStyle["Latin"] = "latin";
    DanceStyle["Smooth"] = "smooth";
    DanceStyle["Rhythm"] = "rhythm";
    DanceStyle["WestCoast"] = "west_coast";
    DanceStyle["CountrySwing"] = "country_swing";
    DanceStyle["Other"] = "other";
})(DanceStyle || (exports.DanceStyle = DanceStyle = {}));
/** Standard NDCA / collegiate progression */
var BallroomLevel;
(function (BallroomLevel) {
    BallroomLevel["Newcomer"] = "newcomer";
    BallroomLevel["Bronze"] = "bronze";
    BallroomLevel["Silver"] = "silver";
    BallroomLevel["Gold"] = "gold";
    BallroomLevel["Novice"] = "novice";
    BallroomLevel["PreChamp"] = "prechamp";
    BallroomLevel["Champ"] = "champ";
    BallroomLevel["Professional"] = "professional";
})(BallroomLevel || (exports.BallroomLevel = BallroomLevel = {}));
/** Common WSDC West Coast Swing levels */
var WCSLevel;
(function (WCSLevel) {
    WCSLevel["Newcomer"] = "newcomer";
    WCSLevel["Novice"] = "novice";
    WCSLevel["Intermediate"] = "intermediate";
    WCSLevel["Advanced"] = "advanced";
    WCSLevel["AllStar"] = "allstar";
    WCSLevel["Champions"] = "champions";
})(WCSLevel || (exports.WCSLevel = WCSLevel = {}));
/** Country Swing / UCWDC style levels */
var CountrySwingLevel;
(function (CountrySwingLevel) {
    CountrySwingLevel["Newcomer"] = "newcomer";
    CountrySwingLevel["Novice"] = "novice";
    CountrySwingLevel["Intermediate"] = "intermediate";
    CountrySwingLevel["Advanced"] = "advanced";
    CountrySwingLevel["Superstar"] = "superstar";
})(CountrySwingLevel || (exports.CountrySwingLevel = CountrySwingLevel = {}));
/** Placeholder for styles with custom divisions */
var OtherLevel;
(function (OtherLevel) {
    OtherLevel["Open"] = "open";
    OtherLevel["Showcase"] = "showcase";
    OtherLevel["Team"] = "team";
    OtherLevel["Other"] = "other";
})(OtherLevel || (exports.OtherLevel = OtherLevel = {}));
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