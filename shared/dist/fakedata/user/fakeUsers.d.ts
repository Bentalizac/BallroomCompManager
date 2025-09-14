import { User, Participant } from "../../data/types/user";
import { BallroomCompetitor } from "../../data/types/userExtensions";
export declare const mockUsers: User[];
export declare const mockParticipants: Participant[];
export declare const mockBallroomCompetitors: BallroomCompetitor[];
export declare const getUserById: (id: string) => User | undefined;
export declare const getParticipantsByCompetition: (competitionId: string) => Participant[];
export declare const getParticipantsByEvent: (eventId: string) => Participant[];
export declare const getBallroomCompetitorsByEvent: (eventId: string) => BallroomCompetitor[];
export declare const getPartnershipsByEvent: (eventId: string) => BallroomCompetitor[][];
//# sourceMappingURL=fakeUsers.d.ts.map