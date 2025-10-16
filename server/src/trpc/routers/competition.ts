import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, authedProcedure } from "../base";
import { getSupabaseAnon, getSupabaseUser } from "../../dal/supabase";
import { CompetitionApi, EventApi } from "@ballroomcompmanager/shared";
import { mapCompetitionRowToDTO, mapEventRowToDTO } from "../mappers";
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
        slug,
        name,
        start_date,
        end_date,
        time_zone,
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
          event_status,
          comp_id,
          category_ruleset_id
        )
      `,
      )
      .order("start_date", { ascending: true });

    if (error) {
      if (process.env.NODE_ENV === "development")
        console.error("Error fetching competitions:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch competitions",
      });
    }

    // Check that we have valid data and not error objects
    if (!competitions || !Array.isArray(competitions)) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Invalid data structure returned from database",
      });
    }

    // Map DB rows to DTOs
    const mapped = competitions.map(mapCompetitionRowToDTO);

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
          slug,
          name,
          start_date,
          end_date,
          time_zone,
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
            event_status,
            comp_id,
            category_ruleset_id
          )
        `,
        )
        .eq("id", input.id)
        .single();

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

      // Map DB row to DTO and validate
      const mapped = mapCompetitionRowToDTO(competition);
      return CompetitionApi.parse(mapped);
    }),

  // Get competition by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const supabase = getSupabaseAnon();
      const { data: competition, error } = await supabase
        .from("comp_info")
        .select(
          `
          id,
          slug,
          name,
          start_date,
          end_date,
          time_zone,
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
            event_status,
            comp_id,
            category_ruleset_id
          )
        `,
        )
        .eq("slug", input.slug)
        .single();

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

      // Map DB row to DTO and validate
      const mapped = mapCompetitionRowToDTO(competition);
      return CompetitionApi.parse(mapped);
    }),

  // Get events for a competition
  getEvents: publicProcedure
    .input(z.object({ competitionId: z.string() }))
    .query(async ({ input }) => {
      const supabase = getSupabaseAnon();

      // First get competition time zone
      const { data: comp, error: compError } = await supabase
        .from("comp_info")
        .select("time_zone")
        .eq("id", input.competitionId)
        .single();

      if (compError || !comp) {
        if (process.env.NODE_ENV === "development")
          console.error("Error fetching competition:", compError);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Competition not found",
        });
      }

      const { data: events, error } = await supabase
        .from("event_info")
        .select(
          `
          id,
          name,
          start_date,
          end_date,
          event_status,
          comp_id,
          category_ruleset_id
        `,
        )
        .eq("comp_id", input.competitionId)
        .order("start_date", { ascending: true });

      if (error) {
        if (process.env.NODE_ENV === "development")
          console.error("Error fetching events:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch events",
        });
      }

      // Check that we have valid data and not error objects
      if (!events || !Array.isArray(events)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid events data returned from database",
        });
      }

      // Map DB rows to DTOs with competition time zone
      const mapped = events.map((event) =>
        mapEventRowToDTO(event, comp.time_zone),
      );

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
      const supabase = getSupabaseAnon();
      const { data: registration, error } = await supabase
        .from("comp_participant")
        .select(
          `
          user_id,
          role,
          participation_status,
          created_at,
          user_info!comp_participant_user_id_fkey (
            id,
            firstname,
            lastname,
            email,
            role,
            created_at
          )
          `,
        )
        .eq("comp_id", input.competitionId)
        .eq("user_id", input.userId)
        .single();

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
      const supabase = getSupabaseAnon();
      const { data: registrations, error } = await supabase
        .from("comp_participant")
        .select(
          `
          user_id,
          role,
          participation_status,
          created_at,
          user_info!comp_participant_user_id_fkey (
            id,
            firstname,
            lastname,
            email,
            role,
            created_at
          )
          `,
        )
        .eq("comp_id", input.competitionId)
        .order("role", { ascending: true });

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
        // Create competition
        if (process.env.NODE_ENV === "development")
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
            time_zone: input.timeZone,
            venue_id: input.venueId || null,
          })
          .select("id, slug, name, start_date, end_date, time_zone, venue_id")
          .single();

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
        const { error: participantError } = await supabase
          .from("comp_participant")
          .insert({
            user_id: ctx.userId,
            comp_id: competition.id,
            role: "organizer",
            participation_status: "active",
          });

        if (participantError) {
          if (process.env.NODE_ENV === "development")
            console.error(
              "Error creating participant record:",
              participantError,
            );
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
        if (input.timeZone) updateData.time_zone = input.timeZone;
        if (input.venueId !== undefined) updateData.venue_id = input.venueId;

        const { data: competition, error } = await supabase
          .from("comp_info")
          .update(updateData)
          .eq("id", input.id)
          .select()
          .single();

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
