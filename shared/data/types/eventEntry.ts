import { EventRoles } from "../enums/eventRoles";
import { EntryType } from "../enums/eventTypes";
import { User } from "./user";
export type RegistrationStatus = "active" | "inactive" | "withdrawn";

/**
 * EventEntry
 * @property id: string
 * @property eventInfoId: string
 * @property entryName: string | null
 * @property entryType: EntryType
 * @property registrationStatus: RegistrationStatus
 * @property createdAt: Date
 * @property participants: EventEntryParticipant[] | null
 */
export interface EventEntry {
  id: string;
  eventInfoId: string;
  entryName?: string; // Optional team/pair name (e.g., "Smith & Jones")
  entryType: EntryType;
  registrationStatus: RegistrationStatus;
  createdAt: Date;
  participants?: EventEntryParticipant[]; // Optional populated field
}

/**
 * EventEntryParticipant
 * @property id: string
 * @property eventEntryId: string
 * @property compParticipantId: string
 * @property role: EventRoles
 * @property createdAt: Date
 * @property compParticipant?: { id: string; userId: string; userInfo?: User }
 */

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
    userInfo?: User;
  };
}

/**
 * EventRegistration
 * @property id: string
 * @property eventEntryId: string
 * @property eventInfoId: string
 * @property role: string
 * @property registrationStatus: RegistrationStatus
 * @property eventEntry?: EventEntry
 */

export interface EventRegistration {
  id: string;
  eventEntryId: string;
  eventInfoId: string;
  role: string;
  registrationStatus: RegistrationStatus;
  // Optional populated fields
  eventEntry?: EventEntry;
}

/**
 * CreateEventEntryRequest
 * @property eventInfoId: string
 * @property entryName?: string
 * @property entryType: EntryType
 * @property participants: Array<{ compParticipantId: string; role: EventRoles }>
 */

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
/**
 * EventEntryWithParticipants
 * @property participants: EventEntryParticipant[]
 */
export interface EventEntryWithParticipants extends EventEntry {
  participants: EventEntryParticipant[];
}
