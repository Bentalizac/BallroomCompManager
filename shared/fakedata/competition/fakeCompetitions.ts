import { Competition } from "../../data/types/competition";
import { CompEvent } from "../../data/types/event";
import { ScoringMethods } from "../../data/enums/scoringMethods";
import { mockParticipants, mockUsers } from "../user/fakeUsers";

// Mock Events
export const mockEvents: CompEvent[] = [
  {
    id: "event-1",
    competitionId: "comp-1",
    category: "Amateur",
    name: "Newcomer Standard",
    startDate: new Date("2024-03-15T09:00:00"),
    endDate: new Date("2024-03-15T11:00:00"),
    events: [], // Self-reference, empty for events
    competitors: mockParticipants.filter(
      (p) => p.eventId === "event-1" && p.role === "competitor",
    ),
    judges: mockParticipants.filter(
      (p) => p.eventId === "event-1" && p.role === "judge",
    ),
    scoring: ScoringMethods.Ballroom,
  },
  {
    id: "event-2",
    competitionId: "comp-1",
    category: "Amateur",
    name: "Newcomer Latin",
    startDate: new Date("2024-03-15T13:00:00"),
    endDate: new Date("2024-03-15T15:00:00"),
    events: [],
    competitors: mockParticipants.filter(
      (p) => p.eventId === "event-2" && p.role === "competitor",
    ),
    judges: mockParticipants.filter(
      (p) => p.eventId === "event-2" && p.role === "judge",
    ),
    scoring: ScoringMethods.Ballroom,
  },
  {
    id: "event-3",
    competitionId: "comp-1",
    category: "Pro-Am",
    name: "Bronze Standard",
    startDate: new Date("2024-03-15T16:00:00"),
    endDate: new Date("2024-03-15T17:30:00"),
    events: [],
    competitors: mockParticipants.filter(
      (p) => p.eventId === "event-3" && p.role === "competitor",
    ),
    judges: mockParticipants.filter(
      (p) => p.eventId === "event-3" && p.role === "judge",
    ),
    scoring: ScoringMethods.Ballroom,
  },
];

// Mock Competitions
export const mockCompetitions: Competition[] = [
  {
    id: "BYU",
    startDate: new Date("2025-10-15T08:00:00"),
    endDate: new Date("2026-03-15T08:00:00"),
    events: mockEvents,
  },
  {
    id: "comp-2",
    startDate: new Date("2024-04-20T08:00:00"),
    endDate: new Date("2024-04-20T22:00:00"),
    events: [],
  },
  {
    id: "comp-3",
    startDate: new Date("2024-05-25T08:00:00"),
    endDate: new Date("2024-05-25T22:00:00"),
    events: [],
  },
];

// Registration data
export interface CompetitionRegistration {
  id: string;
  competitionId: string;
  userId: string;
  registrationDate: Date;
  status: "pending" | "confirmed" | "cancelled";
}

export const mockRegistrations: CompetitionRegistration[] = [
  {
    id: "reg-1",
    competitionId: "comp-1",
    userId: "user-1",
    registrationDate: new Date("2024-02-01T10:00:00"),
    status: "confirmed",
  },
  {
    id: "reg-2",
    competitionId: "comp-1",
    userId: "user-2",
    registrationDate: new Date("2024-02-01T10:30:00"),
    status: "confirmed",
  },
  {
    id: "reg-3",
    competitionId: "comp-1",
    userId: "user-3",
    registrationDate: new Date("2024-02-02T14:00:00"),
    status: "pending",
  },
];

// Helper functions
export const getCompetitionById = (id: string): Competition | undefined => {
  return mockCompetitions.find((comp) => comp.id === id);
};

export const getEventById = (id: string): CompEvent | undefined => {
  return mockEvents.find((event) => event.id === id);
};

export const getRegistrationsByCompetition = (
  competitionId: string,
): CompetitionRegistration[] => {
  return mockRegistrations.filter((reg) => reg.competitionId === competitionId);
};

export const getRegistrationByUserAndComp = (
  userId: string,
  competitionId: string,
): CompetitionRegistration | undefined => {
  return mockRegistrations.find(
    (reg) => reg.userId === userId && reg.competitionId === competitionId,
  );
};

export const getAllCompetitions = (): Competition[] => {
  return mockCompetitions;
};
