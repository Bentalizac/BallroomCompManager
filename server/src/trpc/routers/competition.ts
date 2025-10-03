import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, authedProcedure } from "../base";
import { getSupabaseAnon, getSupabaseUser } from "../../dal/supabase";
import { CompetitionApi, EventApi } from "@ballroomcompmanager/shared";
import {
  mapCompetitionRowToDTO,
  mapEventRowToDTO,
} from "../mappers";
import { getCompetitionSchema } from "../schemas";

export const competitionRouter = router({
  // Get all competitions
  getAll: publicProcedure.query(async () => {
    const supabase = getSupabaseAnon();
    const { data: competitions, error } = await supabase
      .from("comp_info")
      .select(
        `
        id,
        name,
        start_date,
        end_date,
        venue:venue_id (
          id,
          name,
          city,
          state
        ),
        events:event_info (
          id,
          name,
          start_date,
          end_date,
          event_status
        )
      `,
      )
      .order("start_date", { ascending: true });

    if (error) {
      console.error("Error fetching competitions:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch competitions",
      });
    }

    // Map DB rows to DTOs
    const mapped = (competitions || []).map(mapCompetitionRowToDTO);

    // Validate with zod schema
    return z.array(CompetitionApi).parse(mapped);
  }),

  // Get competition by ID
  getById: publicProcedure
    .input(getCompetitionSchema)
    .query(async ({ input }) => {
      const supabase = getSupabaseAnon();
      const { data: competition, error } = await supabase
        .from("comp_info")
        .select(
          `
          id,
          name,
          start_date,
          end_date,
          venue:venue_id (
            id,
            name,
            city,
            state
          ),
          events:event_info (
            id,
            name,
            start_date,
            end_date,
            event_status
          )
        `,
        )
        .eq("id", input.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching competition:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch competition",
        });
      }

      if (!competition) {
        return null;
      }

      // Map DB row to DTO and validate
      const mapped = mapCompetitionRowToDTO(competition);
      return CompetitionApi.parse(mapped);
    }),

  // Get events for a competition
  getEvents: publicProcedure
    .input(z.object({ competitionId: z.string() }))
    .query(async ({ input }) => {
      const supabase = getSupabaseAnon();
      const { data: events, error } = await supabase
        .from("event_info")
        .select(
          `
          id,
          name,
          start_date,
          end_date,
          event_status
        `,
        )
        .eq("comp_id", input.competitionId)
        .order("start_date", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch events",
        });
      }

      // Map DB rows to DTOs
      const mapped = (events || []).map(mapEventRowToDTO);

      // Validate with zod schema
      return z.array(EventApi).parse(mapped);
    }),

  // Get all event registrations for a competition (admin/organizer use)
  getEventRegistrations: publicProcedure
    .input(z.object({ competitionId: z.string() }))
    .query(async ({ input }) => {
      const supabase = getSupabaseAnon();
      const { data: registrations, error } = await supabase
        .from("event_registration")
        .select(
          `
          id,
          role,
          registration_status,
          event_info!inner (
            id,
            name,
            comp_id
          ),
          comp_participant (
            id,
            user_info (
              id,
              firstname,
              lastname,
              email
            )
          )
        `,
        )
        .eq("event_info.comp_id", input.competitionId)
        .order("event_info.start_date", { ascending: true });

      if (error) {
        console.error("Error fetching event registrations:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch event registrations",
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
        // Create competition
        console.log("🎯 Creating competition with data:", {
          name: input.name,
          start_date: input.startDate,
          end_date: input.endDate,
          venue_id: input.venueId || null,
          userId: ctx.userId,
        });

        const { data: competition, error: compError } = await supabase
          .from("comp_info")
          .insert({
            name: input.name,
            start_date: input.startDate,
            end_date: input.endDate,
            venue_id: input.venueId || null,
          })
          .select()
          .single();

        console.log("🎯 Competition creation result:", {
          competition,
          compError,
        });

        if (compError || !competition) {
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
        const { error: participantError } = await supabase
          .from("comp_participant")
          .insert({
            user_id: ctx.userId,
            comp_id: competition.id,
            role: "organizer",
            participation_status: "active",
          });

        if (participantError) {
          console.error("Error creating participant record:", participantError);
          // Don't fail the whole operation, but log it
        }

        // Make user a competition admin
        const { error: adminError } = await supabase
          .from("competition_admins")
          .insert({
            user_id: ctx.userId,
            comp_id: competition.id,
          });

        if (adminError) {
          console.error("Error creating admin record:", adminError);
          // Don't fail the whole operation, but log it
        }

        return {
          id: competition.id,
          name: competition.name,
          startDate: competition.start_date,
          endDate: competition.end_date,
          venueId: competition.venue_id,
        };
      } catch (error) {
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
        venueId: z.string().uuid().nullable().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId || !ctx.userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const supabase = getSupabaseUser(ctx.userToken);

      // Check if user is admin of this competition
      const { data: adminCheck, error: adminError } = await supabase
        .from("competition_admins")
        .select("id")
        .eq("comp_id", input.id)
        .eq("user_id", ctx.userId)
        .single();

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
        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.startDate) updateData.start_date = input.startDate;
        if (input.endDate) updateData.end_date = input.endDate;
        if (input.venueId !== undefined) updateData.venue_id = input.venueId;

        const { data: competition, error } = await supabase
          .from("comp_info")
          .update(updateData)
          .eq("id", input.id)
          .select()
          .single();

        if (error || !competition) {
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
          venueId: competition.venue_id,
        };
      } catch (error) {
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
      const { data: adminCheck, error: adminError } = await supabase
        .from("competition_admins")
        .select("id")
        .eq("comp_id", input.id)
        .eq("user_id", ctx.userId)
        .single();

      if (adminError || !adminCheck) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only competition admins can delete competitions",
        });
      }

      try {
        const { error } = await supabase
          .from("comp_info")
          .delete()
          .eq("id", input.id);

        if (error) {
          console.error("Error deleting competition:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete competition",
          });
        }

        return { success: true };
      } catch (error) {
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