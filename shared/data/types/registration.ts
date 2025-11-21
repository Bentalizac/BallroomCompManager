import { EventRoles, type RegistrationRole } from "../enums/eventRoles";

export interface Registration {
  id: string;
  competitionId: string;
  userId: string;
  registrationDate: Date;
  status: "pending" | "confirmed" | "cancelled";
}

// Legacy interface for backward compatibility
export interface EventRegistration extends Registration {
  eventId: string;
  role: EventRoles;
}

// New registration system interfaces
export interface EventRegistrationParticipant {
  registrationId: string;
  userId: string;
  role: RegistrationRole;
}

export interface EventRegistrationEntry {
  id: string;
  eventId: string;
  teamName?: string;
  status: 'active' | 'withdrawn' | 'pending';
  createdAt: Date;
  participants: EventRegistrationParticipant[];
}

// API types for tRPC
export interface EventRegistrationApi {
  id: string;
  eventId: string;
  teamName?: string;
  status: 'active' | 'withdrawn' | 'pending';
  createdAt: string; // ISO string for API transport
  participants: {
    userId: string;
    role: RegistrationRole;
    userInfo?: {
      firstname: string;
      lastname: string;
      email: string;
    };
  }[];
}
