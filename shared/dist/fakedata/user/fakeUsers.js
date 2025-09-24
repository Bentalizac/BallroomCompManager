"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartnershipsByEvent = exports.getBallroomCompetitorsByEvent = exports.getParticipantsByEvent = exports.getParticipantsByCompetition = exports.getUserById = exports.mockBallroomCompetitors = exports.mockParticipants = exports.mockUsers = void 0;
const roles_1 = require("../../data/enums/roles");
const eventTypes_1 = require("../../data/enums/eventTypes");
// Mock Users
exports.mockUsers = [
    {
        id: "user-1",
        firstName: "Emma",
        lastName: "Rodriguez",
        email: "emma.rodriguez@email.com",
    },
    {
        id: "user-2",
        firstName: "Marcus",
        lastName: "Chen",
        email: "marcus.chen@email.com",
    },
    {
        id: "user-3",
        firstName: "Sofia",
        lastName: "Thompson",
        email: "sofia.thompson@email.com",
    },
    {
        id: "user-4",
        firstName: "Alessandro",
        lastName: "Williams",
        email: "alessandro.williams@email.com",
    },
    {
        id: "user-5",
        firstName: "Isabella",
        lastName: "Johnson",
        email: "isabella.johnson@email.com",
    },
    {
        id: "user-6",
        firstName: "Victor",
        lastName: "Davis",
        email: "victor.davis@email.com",
    },
    {
        id: "user-7",
        firstName: "Anastasia",
        lastName: "Miller",
        email: "anastasia.miller@email.com",
    },
    {
        id: "user-8",
        firstName: "Dimitri",
        lastName: "Anderson",
        email: "dimitri.anderson@email.com",
    },
    {
        id: "user-9",
        firstName: "Valentina",
        lastName: "Garcia",
        email: "valentina.garcia@email.com",
    },
    {
        id: "user-10",
        firstName: "Rafael",
        lastName: "Martinez",
        email: "rafael.martinez@email.com",
    },
    {
        id: "user-11",
        firstName: "Judge",
        lastName: "Stevens",
        email: "judge.stevens@email.com",
    },
    {
        id: "user-12",
        firstName: "Judge",
        lastName: "Patterson",
        email: "judge.patterson@email.com",
    },
    {
        id: "user-13",
        firstName: "Judge",
        lastName: "Brooks",
        email: "judge.brooks@email.com",
    },
    {
        id: "user-14",
        firstName: "Sarah",
        lastName: "Event Organizer",
        email: "sarah.organizer@email.com",
    },
];
// Mock Participants
exports.mockParticipants = [
    // Competitors
    {
        id: "participant-1",
        user: exports.mockUsers[0], // Emma Rodriguez
        competitionId: "comp-1",
        eventId: "event-1",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
    },
    {
        id: "participant-2",
        user: exports.mockUsers[1], // Marcus Chen
        competitionId: "comp-1",
        eventId: "event-1",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
    },
    {
        id: "participant-3",
        user: exports.mockUsers[2], // Sofia Thompson
        competitionId: "comp-1",
        eventId: "event-1",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
    },
    {
        id: "participant-4",
        user: exports.mockUsers[3], // Alessandro Williams
        competitionId: "comp-1",
        eventId: "event-1",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
    },
    {
        id: "participant-5",
        user: exports.mockUsers[4], // Isabella Johnson
        competitionId: "comp-1",
        eventId: "event-2",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
    },
    {
        id: "participant-6",
        user: exports.mockUsers[5], // Victor Davis
        competitionId: "comp-1",
        eventId: "event-2",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
    },
    {
        id: "participant-7",
        user: exports.mockUsers[6], // Anastasia Miller
        competitionId: "comp-1",
        eventId: "event-2",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
    },
    {
        id: "participant-8",
        user: exports.mockUsers[7], // Dimitri Anderson
        competitionId: "comp-1",
        eventId: "event-2",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
    },
    {
        id: "participant-9",
        user: exports.mockUsers[8], // Valentina Garcia
        competitionId: "comp-1",
        eventId: "event-3",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
    },
    {
        id: "participant-10",
        user: exports.mockUsers[9], // Rafael Martinez
        competitionId: "comp-1",
        eventId: "event-3",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
    },
    // Judges
    {
        id: "participant-11",
        user: exports.mockUsers[10], // Judge Stevens
        competitionId: "comp-1",
        eventId: "event-1",
        role: roles_1.CompetitionRole.Judge,
        eventType: eventTypes_1.EventType.Ballroom,
    },
    {
        id: "participant-12",
        user: exports.mockUsers[11], // Judge Patterson
        competitionId: "comp-1",
        eventId: "event-1",
        role: roles_1.CompetitionRole.Judge,
        eventType: eventTypes_1.EventType.Ballroom,
    },
    {
        id: "participant-13",
        user: exports.mockUsers[12], // Judge Brooks
        competitionId: "comp-1",
        eventId: "event-2",
        role: roles_1.CompetitionRole.Judge,
        eventType: eventTypes_1.EventType.Ballroom,
    },
    {
        id: "participant-14",
        user: exports.mockUsers[10], // Judge Stevens (judging multiple events)
        competitionId: "comp-1",
        eventId: "event-2",
        role: roles_1.CompetitionRole.Judge,
        eventType: eventTypes_1.EventType.Ballroom,
    },
    // Organizer
    {
        id: "participant-15",
        user: exports.mockUsers[13], // Sarah Event Organizer
        competitionId: "comp-1",
        eventId: "event-1",
        role: roles_1.CompetitionRole.Organizer,
        eventType: eventTypes_1.EventType.Ballroom,
    },
];
// Mock Ballroom Competitors with partnership data
exports.mockBallroomCompetitors = [
    // Partnership 1: Emma & Marcus (couple #101)
    {
        id: "participant-1",
        user: exports.mockUsers[0], // Emma Rodriguez
        competitionId: "comp-1",
        eventId: "event-1",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
        partner: exports.mockUsers[1], // Partner is Marcus Chen
        competitorNumber: "101",
        lead: false, // Emma is the follow
    },
    {
        id: "participant-2",
        user: exports.mockUsers[1], // Marcus Chen
        competitionId: "comp-1",
        eventId: "event-1",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
        partner: exports.mockUsers[0], // Partner is Emma Rodriguez
        competitorNumber: "101",
        lead: true, // Marcus is the lead
    },
    // Partnership 2: Sofia & Alessandro (couple #102)
    {
        id: "participant-3",
        user: exports.mockUsers[2], // Sofia Thompson
        competitionId: "comp-1",
        eventId: "event-1",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
        partner: exports.mockUsers[4], //
        competitorNumber: "102",
        lead: false, // Sofia is the follow
    },
    {
        id: "participant-4",
        user: exports.mockUsers[3], // Alessandro Williams
        competitionId: "comp-1",
        eventId: "event-1",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
        partner: exports.mockUsers[3], // Partner is Alessandro Williams
        competitorNumber: "102",
        lead: true, // Alessandro is the lead
    },
    // Partnership 3: Isabella & Victor (couple #103)
    {
        id: "participant-5",
        user: exports.mockUsers[4], // Isabella Johnson
        competitionId: "comp-1",
        eventId: "event-2",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
        partner: exports.mockUsers[6], // Partner is Victor Davis
        competitorNumber: "103",
        lead: false, // Isabella is the follow
    },
    {
        id: "participant-6",
        user: exports.mockUsers[5], // Victor Davis
        competitionId: "comp-1",
        eventId: "event-2",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
        partner: exports.mockUsers[5], // Partner is Isabella Johnson
        competitorNumber: "103",
        lead: true, // Victor is the lead
    },
    // Partnership 4: Anastasia & Dimitri (couple #104)
    {
        id: "participant-7",
        user: exports.mockUsers[6], // Anastasia Miller
        competitionId: "comp-1",
        eventId: "event-2",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
        partner: exports.mockUsers[7], // Partner is Dimitri Anderson
        competitorNumber: "104",
        lead: false, // Anastasia is the follow
    },
    {
        id: "participant-8",
        user: exports.mockUsers[7], // Dimitri Anderson
        competitionId: "comp-1",
        eventId: "event-2",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
        partner: exports.mockUsers[6], // Partner is Anastasia Miller
        competitorNumber: "104",
        lead: true, // Dimitri is the lead
    },
    // Solo competitors (e.g., for WCS or when partner is missing)
    {
        id: "participant-9",
        user: exports.mockUsers[8], // Valentina Garcia
        competitionId: "comp-1",
        eventId: "event-3",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
        partner: undefined, // No partner for this event
        competitorNumber: "105",
        lead: false, // Valentina is a follow looking for a lead
    },
    {
        id: "participant-10",
        user: exports.mockUsers[9], // Rafael Martinez
        competitionId: "comp-1",
        eventId: "event-3",
        role: roles_1.CompetitionRole.Competitor,
        eventType: eventTypes_1.EventType.Ballroom,
        partner: undefined, // No partner for this event
        competitorNumber: "106",
        lead: true, // Rafael is a lead looking for a follow
    },
];
// Helper functions to get related data
const getUserById = (id) => {
    return exports.mockUsers.find((user) => user.id === id);
};
exports.getUserById = getUserById;
const getParticipantsByCompetition = (competitionId) => {
    return exports.mockParticipants.filter((participant) => participant.competitionId === competitionId);
};
exports.getParticipantsByCompetition = getParticipantsByCompetition;
const getParticipantsByEvent = (eventId) => {
    return exports.mockParticipants.filter((participant) => participant.eventId === eventId);
};
exports.getParticipantsByEvent = getParticipantsByEvent;
const getBallroomCompetitorsByEvent = (eventId) => {
    return exports.mockBallroomCompetitors.filter((competitor) => competitor.eventId === eventId);
};
exports.getBallroomCompetitorsByEvent = getBallroomCompetitorsByEvent;
const getPartnershipsByEvent = (eventId) => {
    const competitors = (0, exports.getBallroomCompetitorsByEvent)(eventId);
    const partnerships = [];
    const processed = new Set();
    competitors.forEach((competitor) => {
        if (processed.has(competitor.id))
            return; // Already processed
        if (competitor.partner) {
            const partnerCompetitor = competitors.find((c) => c.user.id === competitor.partner?.id);
            if (partnerCompetitor) {
                partnerships.push([competitor, partnerCompetitor]);
                processed.add(competitor.id);
                processed.add(partnerCompetitor.id);
            }
            else {
                // Partner not found in this event, add solo
                partnerships.push([competitor]);
                processed.add(competitor.id);
            }
        }
    });
    return partnerships;
};
exports.getPartnershipsByEvent = getPartnershipsByEvent;
//# sourceMappingURL=fakeUsers.js.map