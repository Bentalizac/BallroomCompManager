import { BallroomCompetitor, Participant, User, mockBallroomCompetitors, mockParticipants, mockUsers } from "@listit/shared";
import ParticipantBox from "../components/user/userCard";

export default function Demo() {
    // Displays all fake users in a list

    function buildUserCard(user: Participant) {
        return (
            <ParticipantBox key={user.id} participant={user} />
        );
    }

    return (
        <div>
            <h1>Demo</h1>
            {mockBallroomCompetitors.map(user => buildUserCard(user))}
        </div>
    );
}