import { Competition } from "../../data/types/competition";
import { CompEvent } from "../../data/types/event";
import { Registration } from "../../data/types/registration";
import { ScoringMethods } from "../../data/enums/scoringMethods";
import { EntryType, EventType } from "../../data/enums/eventTypes";
import { mockParticipants, mockUsers } from "../user/fakeUsers";
import { BallroomCompetitor } from "../../data/types/userExtensions";

// Mock Events
export const mockEvents: CompEvent[] = [
  {
    id: "event-1",
    competitionId: "comp-1",
    category: EventType.Other,
    name: "Newcomer Standard",
    startDate: new Date("2024-03-15T09:00:00"),
    endDate: new Date("2024-03-15T11:00:00"),
    competitors: mockParticipants.filter(
      (p) => p.eventId === "event-1" && p.role === "competitor",
    ),
    judges: mockParticipants.filter(
      (p) => p.eventId === "event-1" && p.role === "judge",
    ),
    scoring: ScoringMethods.Ballroom,
    entryType: EntryType.Partner,
  },
  {
    id: "event-2",
    competitionId: "comp-1",
    category: EventType.Other,
    name: "Newcomer Latin",
    startDate: new Date("2024-03-15T13:00:00"),
    endDate: new Date("2024-03-15T15:00:00"),
    competitors: mockParticipants.filter(
      (p) => p.eventId === "event-2" && p.role === "competitor",
    ),
    judges: mockParticipants.filter(
      (p) => p.eventId === "event-2" && p.role === "judge",
    ),
    scoring: ScoringMethods.Ballroom,
    entryType: EntryType.Partner,
  },
  {
    id: "event-3",
    competitionId: "comp-1",
    category: EventType.Other,
    name: "Bronze Standard",
    startDate: new Date("2024-03-15T16:00:00"),
    endDate: new Date("2024-03-15T17:30:00"),
    competitors: mockParticipants.filter(
      (p) => p.eventId === "event-3" && p.role === "competitor",
    ),
    judges: mockParticipants.filter(
      (p) => p.eventId === "event-3" && p.role === "judge",
    ),
    scoring: ScoringMethods.Ballroom,
    entryType: EntryType.Partner,
  },
];

// Mock Competitions
export const mockCompetitions: Competition[] = [
  {
    id: "BYU",
    slug: "byu-dancesport-2025",
    name: "BYU DanceSport",
    startDate: new Date("2025-10-15T08:00:00"),
    endDate: new Date("2026-03-15T08:00:00"),
    events: mockEvents,
  },
  {
    id: "comp-2",
    slug: "spring-fling-dance-competition-2024",
    name: "Spring Fling Dance Competition",
    startDate: new Date("2024-04-20T08:00:00"),
    endDate: new Date("2024-04-20T22:00:00"),
    events: [],
  },
  {
    id: "comp-3",
    slug: "summer-salsa-showdown-2024",
    name: "Summer Salsa Showdown",
    startDate: new Date("2024-05-25T08:00:00"),
    endDate: new Date("2024-05-25T22:00:00"),
    events: [],
  },
];

export const mockRegistrations: Registration[] = [
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
): Registration[] => {
  return mockRegistrations.filter((reg) => reg.competitionId === competitionId);
};

export const getRegistrationByUserAndComp = (
  userId: string,
  competitionId: string,
): Registration | undefined => {
  return mockRegistrations.find(
    (reg) => reg.userId === userId && reg.competitionId === competitionId,
  );
};

export const getAllCompetitions = (): Competition[] => {
  return mockCompetitions;
};

export const getCompEvents = (id: string): CompEvent[] => {
  var events = mockEvents.filter((event) => event.competitionId == id);
  return events;
};

export const getEventCompetitors = (eventId: string): BallroomCompetitor[] => {
  return [];
};
