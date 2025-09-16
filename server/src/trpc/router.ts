import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { 
  getAllCompetitions, 
  getCompetitionById, 
  getRegistrationsByCompetition,
  getRegistrationByUserAndComp,
  mockRegistrations,
  CompetitionRegistration 
} from '@ballroomcompmanager/shared/fakedata/competition/fakeCompetitions';
import { Competition } from '@ballroomcompmanager/shared/data/types/competition';

// Initialize tRPC
const t = initTRPC.create();

// Create router and procedures
export const router = t.router;
export const procedure = t.procedure;

// Input validation schemas
const getCompetitionSchema = z.object({
  id: z.string()
});

const registerForCompetitionSchema = z.object({
  competitionId: z.string(),
  userId: z.string(),
  additionalInfo: z.record(z.any()).optional()
});

const getUserRegistrationSchema = z.object({
  competitionId: z.string(),
  userId: z.string()
});

// Competition router
const competitionRouter = router({
  // Get all competitions
  getAll: procedure
    .query(async (): Promise<Competition[]> => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return getAllCompetitions();
    }),

  // Get competition by ID
  getById: procedure
    .input(getCompetitionSchema)
    .query(async ({ input }): Promise<Competition | null> => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      const competition = getCompetitionById(input.id);
      return competition || null;
    }),

  // Register for competition
  register: procedure
    .input(registerForCompetitionSchema)
    .mutation(async ({ input }): Promise<{ success: boolean; registration?: CompetitionRegistration; error?: string }> => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));

      try {
        // Check if already registered
        const existingRegistration = getRegistrationByUserAndComp(input.userId, input.competitionId);
        if (existingRegistration) {
          return {
            success: false,
            error: 'User already registered for this competition'
          };
        }

        // Check if competition exists
        const competition = getCompetitionById(input.competitionId);
        if (!competition) {
          return {
            success: false,
            error: 'Competition not found'
          };
        }

        // Create new registration
        const newRegistration: CompetitionRegistration = {
          id: `reg-${Date.now()}`,
          competitionId: input.competitionId,
          userId: input.userId,
          registrationDate: new Date(),
          status: 'pending'
        };

        // Add to mock data (in real app, this would save to database)
        mockRegistrations.push(newRegistration);

        return {
          success: true,
          registration: newRegistration
        };
      } catch (error) {
        return {
          success: false,
          error: 'Registration failed'
        };
      }
    }),

  // Get user's registration for a competition
  getUserRegistration: procedure
    .input(getUserRegistrationSchema)
    .query(async ({ input }): Promise<CompetitionRegistration | null> => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      const registration = getRegistrationByUserAndComp(input.userId, input.competitionId);
      return registration || null;
    }),

  // Get all registrations for a competition (admin/organizer use)
  getRegistrations: procedure
    .input(z.object({ competitionId: z.string() }))
    .query(async ({ input }): Promise<CompetitionRegistration[]> => {
      // Simulate network delay  
      await new Promise(resolve => setTimeout(resolve, 100));
      return getRegistrationsByCompetition(input.competitionId);
    })
});

// Main app router
export const appRouter = router({
  competition: competitionRouter
});

// Export type definition
export type AppRouter = typeof appRouter;