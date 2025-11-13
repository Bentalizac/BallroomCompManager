/**
 * Represents the category of an event in a dance competition.
 * DanceStyle and EventLevel
 */
export type EventCategory = {
    style: DanceStyle.Ballroom | DanceStyle.Latin | DanceStyle.Smooth | DanceStyle.Rhythm;
    level: BallroomLevel;
} | {
    style: DanceStyle.WestCoast;
    level: WCSLevel;
} | {
    style: DanceStyle.CountrySwing;
    level: CountrySwingLevel;
} | {
    style: DanceStyle.Other;
    level: OtherLevel;
};
/**
 * Represents the type of event in a dance competition.
 */
export type EventLevel = BallroomLevel | WCSLevel | CountrySwingLevel | OtherLevel;
/**
 * Represents the dance style of an event.
 */
export declare enum DanceStyle {
    Ballroom = "ballroom",
    Latin = "latin",
    Smooth = "smooth",
    Rhythm = "rhythm",
    WestCoast = "west_coast",
    CountrySwing = "country_swing",
    Other = "other"
}
/** Standard NDCA / collegiate progression */
export declare enum BallroomLevel {
    Newcomer = "newcomer",
    Bronze = "bronze",
    Silver = "silver",
    Gold = "gold",
    Novice = "novice",
    PreChamp = "prechamp",
    Champ = "champ",
    Professional = "professional"
}
/** Common WSDC West Coast Swing levels */
export declare enum WCSLevel {
    Newcomer = "newcomer",
    Novice = "novice",
    Intermediate = "intermediate",
    Advanced = "advanced",
    AllStar = "allstar",
    Champions = "champions"
}
/** Country Swing / UCWDC style levels */
export declare enum CountrySwingLevel {
    Newcomer = "newcomer",
    Novice = "novice",
    Intermediate = "intermediate",
    Advanced = "advanced",
    Superstar = "superstar"
}
/** Placeholder for styles with custom divisions */
export declare enum OtherLevel {
    Open = "open",
    Showcase = "showcase",
    Team = "team",
    Other = "other"
}
/**
 * Represents the level of a competition round.
 * @enum {number}
 */
export declare enum RoundLevel {
    Final = 0,
    Semifinal = 1,
    Quarterfinal = 2,
    Prelim = 3
}
/**
 * Represents the type of entry in a competition.
 * @enum {string}
 * @property {string} Solo - "solo"
 * @property {string} Partner - "partner"
 * @property {string} Team - "team"
 */
export declare enum EntryType {
    Solo = "solo",
    Partner = "partner",
    Team = "team"
}
//# sourceMappingURL=eventTypes.d.ts.map