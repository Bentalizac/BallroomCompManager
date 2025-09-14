import ParticipantBox from "@/components/user/userCard";
import { Participant, mockBallroomCompetitors } from "@ballroomcompmanager/shared";




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