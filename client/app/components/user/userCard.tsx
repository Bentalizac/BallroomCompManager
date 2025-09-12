"use client";

import { BallroomCompetitor, Participant } from "@listit/shared";

interface ParticipantBoxProps<T extends Participant> {
  participant: T;
}

export default function ParticipantBox<T extends Participant>({ participant }: ParticipantBoxProps<T>) {
  return (
    <div>
      <p><strong>ID:</strong> {participant.id}</p>
      <p><strong>User ID:</strong> {participant.userId}</p>
      <p><strong>Competition ID:</strong> {participant.competitionId}</p>
      <p><strong>Event ID:</strong> {participant.eventId}</p>
      <p><strong>Role:</strong> {participant.role ?? "None"}</p>

      {/* Extension-specific renderers */}
      {participant.eventType == 0 && (
        <BallroomFields participant={participant as unknown as BallroomCompetitor} />
      )}
      
    </div>
  );
}

/* --- Subcomponents --- */
function BallroomFields({ participant }: { participant: BallroomCompetitor }) {
  return (
    <>
      <p><strong>Number:</strong> {participant.competitorNumber}</p>
      <p><strong>Partner ID:</strong> {participant.partnerID ?? "None"}</p>
      {participant.lead && (
        <p><strong>Leader:</strong>{participant.lead}</p>
      )}
    </>
  );
}