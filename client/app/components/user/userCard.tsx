"use client";

import { BallroomCompetitor, Participant } from "@listit/shared";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ParticipantBoxProps<T extends Participant> {
  participant: T;
}

export default function ParticipantBox<T extends Participant>({ participant }: ParticipantBoxProps<T>) {
  return (
    <div>
      <Card>
  <CardHeader>
    <CardTitle>{participant.user.firstName} {participant.user.lastName}</CardTitle>
    <CardDescription>Email: {participant.user.email}</CardDescription>
    <CardAction></CardAction>
  </CardHeader>
  <CardContent>
    <p></p>
      <p><strong>ID:</strong> {participant.id}</p>
      <p><strong>User ID:</strong> {participant.user.id}</p>
      <p><strong>Competition ID:</strong> {participant.competitionId}</p>
      <p><strong>Event ID:</strong> {participant.eventId}</p>
      <p><strong>Role:</strong> {participant.role ?? "None"}</p>

      {/* Extension-specific renderers */}
      {participant.eventType == 0 && (
        <BallroomFields participant={participant as unknown as BallroomCompetitor} />
      )}
       </CardContent>
  <CardFooter>
    <p></p>
  </CardFooter>
</Card>
    </div>
  );
}

/* --- Subcomponents --- */
function BallroomFields({ participant }: { participant: BallroomCompetitor }) {
  return (
    <>
      <p><strong>Number:</strong> {participant.competitorNumber}</p>
      <p><strong>Partner:</strong> {participant.partner?.firstName ?? "None"} {participant.partner?.lastName ?? ""}</p>
      {participant.lead && (
        <p><strong>Lead</strong>{participant.lead}</p>
      )}
    </>
  );
}