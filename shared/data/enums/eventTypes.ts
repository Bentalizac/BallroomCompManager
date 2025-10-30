/**
 * Represents the type of event in a dance competition.
 * @enum {number}
 */
export enum EventType {
  Ballroom = 0,
  Latin = 1,
  Other = 2,
}

/**
 * Represents the level of a competition round.
 * @enum {number}
 */
export enum RoundLevel {
  Final = 0,
  Semifinal = 1,
  Quarterfinal = 2,
  Prelim = 3,
}
/**
 * Represents the type of entry in a competition.
 * @enum {string}
 * @property {string} Solo - "solo"
 * @property {string} Partner - "partner"
 * @property {string} Team - "team"
 */
export enum EntryType {
  Solo = "solo",
  Partner = "partner",
  Team = "team",
}
