import { initTRPC } from "@trpc/server";
import { z } from "zod";
import {
  getAllCompetitions,
  getCompetitionById,
  getRegistrationsByCompetition,
  getRegistrationByUserAndComp,
  mockRegistrations,
  CompetitionRegistration,
} from "@ballroomcompmanager/shared/fakedata/competition/fakeCompetitions";
import { Competition } from "@ballroomcompmanager/shared/data/types/competition";

// Initialize tRPC
const t = initTRPC.create();

// Create router and procedures
export const router = t.router;
export const publicProcedure = t.procedure;

// Input validation schemas
const getCompetitionSchema = z.object({
  id: z.string(),
});

const getUserRegistrationSchema = z.object({
  competitionId: z.string(),
  userId: z.string(),
});

// Competition router
const competitionRouter = router({
  // Get all competitions
  getAll: publicProcedure.query(async (): Promise<Competition[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 10));
    return getAllCompetitions();
  }),

  // Get competition by ID
  getById: publicProcedure
    .input(getCompetitionSchema)
    .query(async ({ input }): Promise<Competition | null> => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      const competition = getCompetitionById(input.id);
      return competition || null;
    }),

  // Get user's registration for a competition
  getUserRegistration: publicProcedure
    .input(getUserRegistrationSchema)
    .query(async ({ input }): Promise<CompetitionRegistration | null> => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      const registration = getRegistrationByUserAndComp(
        input.userId,
        input.competitionId,
      );
      return registration || null;
    }),

  // Get all registrations for a competition (admin/organizer use)
  getRegistrations: publicProcedure
    .input(z.object({ competitionId: z.string() }))
    .query(async ({ input }): Promise<CompetitionRegistration[]> => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      return getRegistrationsByCompetition(input.competitionId);
    }),
});

const userRouter = router({
  registerForComp: authedProcedure,
});

// Main app router
export const appRouter = router({
  competition: competitionRouter,
});

// Export type definition
export type AppRouter = typeof appRouter;
