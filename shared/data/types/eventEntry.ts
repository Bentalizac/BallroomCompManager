import { EventRoles } from "../enums/eventRoles";

export type EntryType = 'individual' | 'pair' | 'team';
export type RegistrationStatus = 'active' | 'inactive' | 'withdrawn';

export interface EventEntry {
  id: string;
  eventInfoId: string;
  entryName?: string; // Optional team/pair name (e.g., "Smith & Jones")
  entryType: EntryType;
  registrationStatus: RegistrationStatus;
  createdAt: Date;
  participants?: EventEntryParticipant[]; // Optional populated field
}

export interface EventEntryParticipant {
  id: string;
  eventEntryId: string;
  compParticipantId: string;
  role: EventRoles;
  createdAt: Date;
  // Optional populated fields
  compParticipant?: {
    id: string;
    userId: string;
    userInfo?: {
      firstname: string;
      lastname: string;
      email: string;
    };
  };
}

export interface EventRegistration {
  id: string;
  eventEntryId: string;
  eventInfoId: string;
  role: string;
  registrationStatus: RegistrationStatus;
  // Optional populated fields
  eventEntry?: EventEntry;
}

// Helper types for creating new entries
export interface CreateEventEntryRequest {
  eventInfoId: string;
  entryName?: string;
  entryType: EntryType;
  participants: Array<{
    compParticipantId: string;
    role: EventRoles;
  }>;
}

export interface EventEntryWithParticipants extends EventEntry {
  participants: EventEntryParticipant[];
}