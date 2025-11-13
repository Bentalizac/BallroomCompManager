import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, authedProcedure } from "../base";
import { getSupabaseAnon, getSupabaseUser } from "../../dal/supabase";
import {
  CompetitionApi,
  generateCompetitionSlug,
} from "@ballroomcompmanager/shared";
import { mapCompetitionRowToDTO } from "../../mappers";
import { getCompetitionSchema } from "../schemas";
import * as CompetitionDAL from "../../dal/competition";
import { mapEventRowEnrichedToCompEvent } from "../../mappers/eventMapper";

export const competitionRouter = router({
  // Get all competitions
  getAll: publicProcedure.query(async () => {
    const { data: competitions, error } =
      await CompetitionDAL.getAllCompetitions(getSupabaseAnon());
    console.log(competitions, " \nERROR: ", error);

    if (error) {
      if (process.env.NODE_ENV === "development")
        console.error("Error fetching competitions:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch competitions",
      });
    }

    if (!competitions || !Array.isArray(competitions)) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Invalid data structure returned from database",
      });
    }
    var res = z
      .array(CompetitionApi)
      .parse(competitions.map(mapCompetitionRowToDTO));
    return res;
  }),

  // Get competition by ID
  getById: publicProcedure
    .input(getCompetitionSchema)
    .query(async ({ input }) => {
      const { data: competition, error } =
        await CompetitionDAL.getCompetitionById(getSupabaseAnon(), input.id);

      if (error && error.code !== "PGRST116") {
        if (process.env.NODE_ENV === "development")
          console.error("Error fetching competition:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch competition",
        });
      }

      if (
        !competition ||
        typeof competition !== "object" ||
        "error" in competition
      ) {
        return null;
      }

      return CompetitionApi.parse(mapCompetitionRowToDTO(competition));
    }),

  // Get competition by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const { data: competition, error } =
        await CompetitionDAL.getCompetitionBySlug(
          getSupabaseAnon(),
          input.slug,
        );

      if (error && error.code !== "PGRST116") {
        if (process.env.NODE_ENV === "development")
          console.error("Error fetching competition:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch competition",
        });
      }

      if (
        !competition ||
        typeof competition !== "object" ||
        "error" in competition
      ) {
        return null;
      }

      return CompetitionApi.parse(mapCompetitionRowToDTO(competition));
    }),

  // Get events for a competition
  getEvents: publicProcedure
    .input(z.object({ competitionId: z.string() }))
    .query(async ({ input }) => {
      const { data: events, error } = await CompetitionDAL.getCompetitionEvents(
        getSupabaseAnon(),
        input.competitionId,
      );

      if (error) {
        if (process.env.NODE_ENV === "development")
          console.error("Error fetching events:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch events",
        });
      }

      if (!events || !Array.isArray(events)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid events data returned from database",
        });
      }

      return events.map(mapEventRowEnrichedToCompEvent);
    }),

  // Get all event registrations for a competition (admin/organizer use)
  getEventRegistrations: publicProcedure
    .input(z.object({ competitionId: z.string() }))
    .query(async ({ input }) => {
      const { data: registrations, error } =
        await CompetitionDAL.getCompetitionEventRegistrations(
          getSupabaseAnon(),
          input.competitionId,
        );

      if (error) {
        if (process.env.NODE_ENV === "development")
          console.error("Error fetching event registrations:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch event registrations",
        });
      }

      return registrations || [];
    }),

  // Get a user's regitration for a competition
  getUserRegistration: publicProcedure
    .input(z.object({ competitionId: z.string(), userId: z.string() }))
    .query(async ({ input }) => {
      const { data: registration, error } =
        await CompetitionDAL.getUserCompetitionRegistration(
          getSupabaseAnon(),
          input.competitionId,
          input.userId,
        );

      if (error && error.code !== "PGRST116") {
        if (process.env.NODE_ENV === "development")
          console.error("Error fetching user registration:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user registration",
        });
      }

      return registration || null;
    }),
  // Get all users registered for a competition
  getRegistrations: publicProcedure
    .input(z.object({ competitionId: z.string() }))
    .query(async ({ input }) => {
      const { data: registrations, error } =
        await CompetitionDAL.getCompetitionRegistrations(
          getSupabaseAnon(),
          input.competitionId,
        );

      if (error) {
        if (process.env.NODE_ENV === "development")
          console.error("Error fetching registrations:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch registrations",
        });
      }

      return registrations || [];
    }),

  // Create new competition
  create: authedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Competition name is required"),
        startDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
        timeZone: z.string().default("UTC"), // IANA time zone identifier
        venueId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId || !ctx.userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Use user client to enforce RLS policies
      const supabase = getSupabaseUser(ctx.userToken);

      // Validate dates
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);
      if (startDate >= endDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End date must be after start date",
        });
      }

      try {
        // Generate slug for competition
        const slug = generateCompetitionSlug(
          input.name,
          new Date(input.startDate),
        );

        // Create competition
        if (process.env.NODE_ENV === "development")
          console.log("🎯 Creating competition with data:", {
            name: input.name,
            slug: slug,
            start_date: input.startDate,
            end_date: input.endDate,
            venue_id: input.venueId || null,
            userId: ctx.userId,
          });

        const { data: competition, error: compError } =
          await CompetitionDAL.createCompetition(supabase, {
            name: input.name,
            slug: slug,
            start_date: input.startDate,
            end_date: input.endDate,
            time_zone: input.timeZone,
            venue_id: input.venueId || null,
          });

        if (process.env.NODE_ENV === "development")
          console.log("🎯 Competition creation result:", {
            competition,
            compError,
          });

        if (compError || !competition) {
          if (process.env.NODE_ENV === "development")
            console.error("❌ Error creating competition:", {
              error: compError,
              message: compError?.message,
              details: compError?.details,
              hint: compError?.hint,
              code: compError?.code,
            });
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to create competition: ${compError?.message || "Unknown error"}`,
          });
        }

        // Make user a participant organizer
        const { error: participantError } =
          await CompetitionDAL.createCompetitionParticipant(
            supabase,
            competition.id,
            ctx.userId,
            "organizer",
          );

        if (participantError) {
          if (process.env.NODE_ENV === "development")
            console.error(
              "Error creating participant record:",
              participantError,
            );
          // Don't fail the whole operation, but log it
        }

        // Make user a competition admin
        const { error: adminError } =
          await CompetitionDAL.createCompetitionAdmin(
            supabase,
            competition.id,
            ctx.userId,
          );

        if (adminError) {
          if (process.env.NODE_ENV === "development")
            console.error("Error creating admin record:", adminError);
          // Don't fail the whole operation, but log it
        }

        return {
          id: competition.id,
          slug: competition.slug,
          name: competition.name,
          startDate: competition.start_date,
          endDate: competition.end_date,
          timeZone: competition.time_zone,
          venueId: competition.venue_id,
        };
      } catch (error) {
        if (process.env.NODE_ENV === "development")
          console.error("Competition creation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to create competition",
        });
      }
    }),

  // Update competition (admin only)
  update: authedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        startDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
        endDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
        timeZone: z.string().optional(), // IANA time zone identifier
        venueId: z.string().uuid().nullable().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId || !ctx.userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const supabase = getSupabaseUser(ctx.userToken);

      // Check if user is admin of this competition
      const { data: adminCheck, error: adminError } =
        await CompetitionDAL.isCompetitionAdmin(supabase, input.id, ctx.userId);

      if (adminError || !adminCheck) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only competition admins can update competitions",
        });
      }

      // Validate dates if both provided
      if (input.startDate && input.endDate) {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        if (startDate >= endDate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "End date must be after start date",
          });
        }
      }

      try {
        const updateData: Partial<{
          name: string;
          start_date: string;
          end_date: string;
          time_zone: string;
          venue_id: string | null;
        }> = {};
        if (input.name) updateData.name = input.name;
        if (input.startDate) updateData.start_date = input.startDate;
        if (input.endDate) updateData.end_date = input.endDate;
        if (input.timeZone) updateData.time_zone = input.timeZone;
        if (input.venueId !== undefined) updateData.venue_id = input.venueId;

        const { data: competition, error } =
          await CompetitionDAL.updateCompetition(
            supabase,
            input.id,
            updateData,
          );

        if (error || !competition) {
          if (process.env.NODE_ENV === "development")
            console.error("Error updating competition:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update competition",
          });
        }

        return {
          id: competition.id,
          name: competition.name,
          startDate: competition.start_date,
          endDate: competition.end_date,
          timeZone: competition.time_zone,
          venueId: competition.venue_id,
        };
      } catch (error) {
        if (process.env.NODE_ENV === "development")
          console.error("Competition update failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update competition",
        });
      }
    }),

  // Delete competition (admin only)
  delete: authedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId || !ctx.userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const supabase = getSupabaseUser(ctx.userToken);

      // Check if user is admin of this competition
      const { data: adminCheck, error: adminError } =
        await CompetitionDAL.isCompetitionAdmin(supabase, input.id, ctx.userId);

      if (adminError || !adminCheck) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only competition admins can delete competitions",
        });
      }

      try {
        const { error } = await CompetitionDAL.deleteCompetition(
          supabase,
          input.id,
        );

        if (error) {
          if (process.env.NODE_ENV === "development")
            console.error("Error deleting competition:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete competition",
          });
        }

        return { success: true };
      } catch (error) {
        if (process.env.NODE_ENV === "development")
          console.error("Competition deletion failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to delete competition",
        });
      }
    }),
});
