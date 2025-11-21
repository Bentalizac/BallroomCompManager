export enum EventRoles {
  Competitor = "competitor",
  Judge = "judge",
  Organizer = "organizer",
  Volunteer = "volunteer",
  Spectator = "spectator",
  Scrutineer = "scrutineer",
}

export enum CompRoles {
  Organizer = "organizer",
  Competitor = "competitor",
  Judge = "judge",
  Spectator = "spectator",
}

/**
 * Registration-specific roles
 * Roles used when registering for events (partner dance specific)
 */
export const RegistrationRoles = ["lead", "follow", "coach", "member"] as const;
export type RegistrationRole = (typeof RegistrationRoles)[number];

/**
 * All valid roles that can be assigned during event registration
 * Combines EventRoles and RegistrationRoles
 */
export const AllEventRegistrationRoles = [
  "competitor",
  "judge",
  "scrutineer",
  ...RegistrationRoles,
] as const;
export type AllEventRegistrationRole = (typeof AllEventRegistrationRoles)[number];
