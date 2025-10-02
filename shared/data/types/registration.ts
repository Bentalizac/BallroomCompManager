import { EventRoles } from "../enums/eventRoles";

export interface Registration {
  id: string;
  competitionId: string;
  userId: string;
  registrationDate: Date;
  status: "pending" | "confirmed" | "cancelled";
}

export interface EventRegistration extends Registration {
  eventId: string;
  role: EventRoles;
}
