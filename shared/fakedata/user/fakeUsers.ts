import { User, Participant } from "../../data/types/user";
import { BallroomCompetitor } from "../../data/types/userExtensions";
import { CompetitionRole } from "../../data/enums/roles";
import { EventType } from "../../data/enums/eventTypes";

// Mock Users
export const mockUsers: User[] = [
    {
        id: "user-1",
        firstName: "Emma",
        lastName: "Rodriguez",
        email: "emma.rodriguez@email.com"
    },
    {
        id: "user-2",
        firstName: "Marcus",
        lastName: "Chen",
        email: "marcus.chen@email.com"
    },
    {
        id: "user-3",
        firstName: "Sofia",
        lastName: "Thompson",
        email: "sofia.thompson@email.com"
    },
    {
        id: "user-4",
        firstName: "Alessandro",
        lastName: "Williams",
        email: "alessandro.williams@email.com"
    },
    {
        id: "user-5",
        firstName: "Isabella",
        lastName: "Johnson",
        email: "isabella.johnson@email.com"
    },
    {
        id: "user-6",
        firstName: "Victor",
        lastName: "Davis",
        email: "victor.davis@email.com"
    },
    {
        id: "user-7",
        firstName: "Anastasia",
        lastName: "Miller",
        email: "anastasia.miller@email.com"
    },
    {
        id: "user-8",
        firstName: "Dimitri",
        lastName: "Anderson",
        email: "dimitri.anderson@email.com"
    },
    {
        id: "user-9",
        firstName: "Valentina",
        lastName: "Garcia",
        email: "valentina.garcia@email.com"
    },
    {
        id: "user-10",
        firstName: "Rafael",
        lastName: "Martinez",
        email: "rafael.martinez@email.com"
    },
    {
        id: "user-11",
        firstName: "Judge",
        lastName: "Stevens",
        email: "judge.stevens@email.com"
    },
    {
        id: "user-12",
        firstName: "Judge",
        lastName: "Patterson",
        email: "judge.patterson@email.com"
    },
    {
        id: "user-13",
        firstName: "Judge",
        lastName: "Brooks",
        email: "judge.brooks@email.com"
    },
    {
        id: "user-14",
        firstName: "Sarah",
        lastName: "Event Organizer",
        email: "sarah.organizer@email.com"
    }
];

// Mock Participants
export const mockParticipants: Participant[] = [
    // Competitors
    {
        id: "participant-1",
        userId: "user-1",
        competitionId: "comp-1",
        eventId: "event-1",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom
    },
    {
        id: "participant-2",
        userId: "user-2",
        competitionId: "comp-1",
        eventId: "event-1",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom
    },
    {
        id: "participant-3",
        userId: "user-3",
        competitionId: "comp-1",
        eventId: "event-1",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom
    },
    {
        id: "participant-4",
        userId: "user-4",
        competitionId: "comp-1",
        eventId: "event-1",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom
    },
    {
        id: "participant-5",
        userId: "user-5",
        competitionId: "comp-1",
        eventId: "event-2",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom
    },
    {
        id: "participant-6",
        userId: "user-6",
        competitionId: "comp-1",
        eventId: "event-2",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom
    },
    {
        id: "participant-7",
        userId: "user-7",
        competitionId: "comp-1",
        eventId: "event-2",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom
    },
    {
        id: "participant-8",
        userId: "user-8",
        competitionId: "comp-1",
        eventId: "event-2",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom
    },
    {
        id: "participant-9",
        userId: "user-9",
        competitionId: "comp-1",
        eventId: "event-3",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom
    },
    {
        id: "participant-10",
        userId: "user-10",
        competitionId: "comp-1",
        eventId: "event-3",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom
    },
    // Judges
    {
        id: "participant-11",
        userId: "user-11",
        competitionId: "comp-1",
        eventId: "event-1",
        role: CompetitionRole.Judge,
        eventType: EventType.Ballroom
    },
    {
        id: "participant-12",
        userId: "user-12",
        competitionId: "comp-1",
        eventId: "event-1",
        role: CompetitionRole.Judge,
        eventType: EventType.Ballroom
    },
    {
        id: "participant-13",
        userId: "user-13",
        competitionId: "comp-1",
        eventId: "event-2",
        role: CompetitionRole.Judge,
        eventType: EventType.Ballroom
    },
    {
        id: "participant-14",
        userId: "user-11",
        competitionId: "comp-1",
        eventId: "event-2",
        role: CompetitionRole.Judge,
        eventType: EventType.Ballroom
    },
    // Organizer
    {
        id: "participant-15",
        userId: "user-14",
        competitionId: "comp-1",
        eventId: "event-1",
        role: CompetitionRole.Organizer,
        eventType: EventType.Ballroom
    }
];

// Mock Ballroom Competitors with partnership data
export const mockBallroomCompetitors: BallroomCompetitor[] = [
    // Partnership 1: Emma & Marcus (couple #101)
    {
        id: "participant-1",
        userId: "user-1",
        competitionId: "comp-1",
        eventId: "event-1",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom,
        partnerID: "user-2",
        competitorNumber: "101",
        lead: false // Emma is the follow
    },
    {
        id: "participant-2",
        userId: "user-2",
        competitionId: "comp-1",
        eventId: "event-1",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom,
        partnerID: "user-1",
        competitorNumber: "101",
        lead: true // Marcus is the lead
    },
    // Partnership 2: Sofia & Alessandro (couple #102)
    {
        id: "participant-3",
        userId: "user-3",
        competitionId: "comp-1",
        eventId: "event-1",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom,
        partnerID: "user-4",
        competitorNumber: "102",
        lead: false // Sofia is the follow
    },
    {
        id: "participant-4",
        userId: "user-4",
        competitionId: "comp-1",
        eventId: "event-1",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom,
        partnerID: "user-3",
        competitorNumber: "102",
        lead: true // Alessandro is the lead
    },
    // Partnership 3: Isabella & Victor (couple #103)
    {
        id: "participant-5",
        userId: "user-5",
        competitionId: "comp-1",
        eventId: "event-2",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom,
        partnerID: "user-6",
        competitorNumber: "103",
        lead: false // Isabella is the follow
    },
    {
        id: "participant-6",
        userId: "user-6",
        competitionId: "comp-1",
        eventId: "event-2",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom,
        partnerID: "user-5",
        competitorNumber: "103",
        lead: true // Victor is the lead
    },
    // Partnership 4: Anastasia & Dimitri (couple #104)
    {
        id: "participant-7",
        userId: "user-7",
        competitionId: "comp-1",
        eventId: "event-2",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom,
        partnerID: "user-8",
        competitorNumber: "104",
        lead: false // Anastasia is the follow
    },
    {
        id: "participant-8",
        userId: "user-8",
        competitionId: "comp-1",
        eventId: "event-2",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom,
        partnerID: "user-7",
        competitorNumber: "104",
        lead: true // Dimitri is the lead
    },
    // Solo competitors (e.g., for WCS or when partner is missing)
    {
        id: "participant-9",
        userId: "user-9",
        competitionId: "comp-1",
        eventId: "event-3",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom,
        partnerID: undefined, // No partner for this event
        competitorNumber: "105",
        lead: false // Valentina is a follow looking for a lead
    },
    {
        id: "participant-10",
        userId: "user-10",
        competitionId: "comp-1",
        eventId: "event-3",
        role: CompetitionRole.Competitor,
        eventType: EventType.Ballroom,
        partnerID: undefined, // No partner for this event
        competitorNumber: "106",
        lead: true // Rafael is a lead looking for a follow
    }
];

// Helper functions to get related data
export const getUserById = (id: string): User | undefined => {
    return mockUsers.find(user => user.id === id);
};

export const getParticipantsByCompetition = (competitionId: string): Participant[] => {
    return mockParticipants.filter(participant => participant.competitionId === competitionId);
};

export const getParticipantsByEvent = (eventId: string): Participant[] => {
    return mockParticipants.filter(participant => participant.eventId === eventId);
};

export const getBallroomCompetitorsByEvent = (eventId: string): BallroomCompetitor[] => {
    return mockBallroomCompetitors.filter(competitor => competitor.eventId === eventId);
};

export const getPartnershipsByEvent = (eventId: string): BallroomCompetitor[][] => {
    const competitors = getBallroomCompetitorsByEvent(eventId);
    const partnerships: BallroomCompetitor[][] = [];
    const processed = new Set<string>();
    
    competitors.forEach(competitor => {
        if (!processed.has(competitor.userId) && competitor.partnerID) {
            const partner = competitors.find(c => c.userId === competitor.partnerID);
            if (partner) {
                partnerships.push([competitor, partner]);
                processed.add(competitor.userId);
                processed.add(partner.userId);
            }
        }
    });
    
    return partnerships;
};
