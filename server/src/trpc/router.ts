import { initTRPC, TRPCError } from "@trpc/server";
import {
  CompetitionRole,
  Participant,
  User,
} from "@ballroomcompmanager/shared";
import { z } from "zod";
import {
  getAllCompetitions,
  getCompetitionById,
  getRegistrationsByCompetition,
  getRegistrationByUserAndComp,
  mockRegistrations,
} from "@ballroomcompmanager/shared/fakedata/competition/fakeCompetitions";
import { Competition } from "@ballroomcompmanager/shared/data/types/competition";
import { Registration } from "@ballroomcompmanager/shared/data/types/registration";
type Context = {
  user: User | null;
  participant: Participant | null;
};
// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Create router and procedures
export const router = t.router;
export const publicProcedure = t.procedure;

// procedure that asserts that the user is logged in
export const authedProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const organizerProcedure = t.procedure.use(
  async function isOrganizer(opts) {
    const { ctx } = opts;
    if (
      !ctx.user ||
      !ctx.participant ||
      ctx.participant.role !== CompetitionRole.Organizer
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Organizer access required",
      });
    }
    return opts.next({
      ctx: {
        user: ctx.user,
      },
    });
  },
);

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
    return getAllCompetitions(); // In real app, fetch from database
  }),

  // Get competition by ID
  getById: publicProcedure
    .input(getCompetitionSchema)
    .query(async ({ input }): Promise<Competition | null> => {
      const competition = getCompetitionById(input.id);
      return competition || null;
    }),

  // Get user's registration for a competition
  getUserRegistration: publicProcedure
    .input(getUserRegistrationSchema)
    .query(async ({ input }): Promise<Registration | null> => {
      const registration = getRegistrationByUserAndComp(
        input.userId,
        input.competitionId,
      );
      return registration || null;
    }),

  // Get all registrations for a competition (admin/organizer use)
  getRegistrations: publicProcedure
    .input(z.object({ competitionId: z.string() }))
    .query(async ({ input }): Promise<Registration[]> => {
      return getRegistrationsByCompetition(input.competitionId);
    }),

  // Create a new competition (admin only)
  create: authedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Competition name is required"),
        startDate: z.string().transform((str) => new Date(str)),
        endDate: z.string().transform((str) => new Date(str)),
        location: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<Competition> => {
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Validate dates
      if (input.endDate <= input.startDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End date must be after start date",
        });
      }

      const newCompetition: Competition = {
        id: `comp_${Date.now()}`,
        name: input.name,
        startDate: input.startDate,
        endDate: input.endDate,
        events: [],
        // Additional fields would go here
      };

      // In real app, save to database
      return newCompetition;
    }),

  // Update competition details (admin only)
  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        startDate: z
          .string()
          .transform((str) => new Date(str))
          .optional(),
        endDate: z
          .string()
          .transform((str) => new Date(str))
          .optional(),
        location: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<Competition> => {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const existingCompetition = getCompetitionById(input.id);
      if (!existingCompetition) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Competition not found",
        });
      }

      // Validate dates if provided
      const startDate = input.startDate || existingCompetition.startDate;
      const endDate = input.endDate || existingCompetition.endDate;

      if (endDate <= startDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End date must be after start date",
        });
      }

      const updatedCompetition: Competition = {
        ...existingCompetition,
        ...input,
        startDate,
        endDate,
      };

      // In real app, update database
      return updatedCompetition;
    }),

  // Delete competition (admin only)
  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }): Promise<{ success: boolean }> => {
      const competition = getCompetitionById(input.id);
      if (!competition) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Competition not found",
        });
      }

      // In real app, delete from database
      // Also handle cascading deletes (registrations, events, etc.)

      return { success: true };
    }),
});

const userRouter = router({
  // Register user for a competition
  registerForComp: authedProcedure
    .input(getUserRegistrationSchema)
    .mutation(async ({ input, ctx }): Promise<Registration> => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if user is already registered
      const existingRegistration = getRegistrationByUserAndComp(
        input.userId,
        input.competitionId,
      );

      if (existingRegistration) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User is already registered for this competition",
        });
      }

      // Create new registration
      const newRegistration: Registration = {
        id: `reg_${Date.now()}`,
        userId: input.userId,
        status: "pending",
        competitionId: input.competitionId,
        registrationDate: new Date(),
      };

      // Add to mock data (in real app, save to database)
      mockRegistrations.push(newRegistration);

      return newRegistration;
    }),

  // Get current user's registrations
  getMyRegistrations: authedProcedure.query(
    async ({ ctx }): Promise<Registration[]> => {
      return mockRegistrations.filter((reg) => reg.userId === ctx.user.id);
    },
  ),

  // Update user profile
  updateProfile: authedProcedure
    .input(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }): Promise<User> => {
      // In real app, update database
      const updatedUser: User = {
        ...ctx.user,
        ...input,
      };

      return updatedUser;
    }),
});

// Main app router
export const appRouter = router({
  competition: competitionRouter,
  user: userRouter,
});

// Export type definition
export type AppRouter = typeof appRouter;
