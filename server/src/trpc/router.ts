import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  registerUserForEvent,
  getUserEventRegistrations,
  cancelEventRegistration,
} from "../dal/eventRegistration";
import {
  getSupabaseAnon,
  getSupabaseUser,
  getSupabaseAdmin,
} from "../dal/supabase";
import type { Database } from "../dal/database.types";
type Context = {
  userId: string | null;
  userToken: string | null;
  user: any | null; // Keep for backwards compatibility
  participant: any | null; // Keep for backwards compatibility
  compID: string | null; // Keep for backwards compatibility
};
// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Create router and procedures
export const router = t.router;
export const publicProcedure = t.procedure;

// procedure that asserts that the user is logged in
export const authedProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({
    ctx: {
      userId: ctx.userId,
      user: ctx.user, // Keep for backwards compatibility
    },
  });
});

// TODO: Implement organizerProcedure with proper database-backed role checking
// export const organizerProcedure = t.procedure.use(
//   async function isOrganizer(opts) {
//     // Check if user is organizer in database
//   }
// );

// Input validation schemas
const getCompetitionSchema = z.object({
  id: z.string(),
});

// Competition router
const competitionRouter = router({
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

    return competitions || [];
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
            street,
            city,
            state,
            postal_code,
            country
          ),
          events:event_info (
            id,
            name,
            start_date,
            end_date,
            event_status,
            category_ruleset (
              id,
              event_categories (
                id,
                name
              ),
              rulesets (
                id,
                name
              )
            )
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

      return competition || null;
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
          event_status,
          category_ruleset (
            id,
            event_categories (
              id,
              name
            ),
            rulesets (
              id,
              name,
              scoring_methods (
                id,
                name,
                description
              )
            )
          )
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

      return events || [];
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

const eventRouter = router({
  // Register user for a specific event
  registerForEvent: authedProcedure
    .input(
      z.object({
        eventId: z.string(),
        role: z
          .enum(["competitor", "judge", "scrutineer"])
          .default("competitor"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      console.log("🎯 Registering user for event:", {
        userId: ctx.userId,
        eventId: input.eventId,
        role: input.role,
      });

      try {
        const registration = await registerUserForEvent(
          ctx.userId,
          input.eventId,
          input.role,
        );

        return {
          id: registration.id,
          eventId: registration.event_info_id,
          role: registration.role,
          status: registration.registration_status,
          registrationDate: new Date().toISOString(),
        };
      } catch (error) {
        console.error("❌ Event registration failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Registration failed",
        });
      }
    }),

  // Get user's event registrations for a competition
  getUserEventRegistrations: authedProcedure
    .input(z.object({ competitionId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const registrations = await getUserEventRegistrations(
          ctx.userId,
          input.competitionId,
        );

        return registrations.map((reg) => ({
          id: reg.id,
          eventId: reg.event_info_id,
          role: reg.role,
          status: reg.registration_status,
          // Add event info if available from the join
          eventName: (reg as any).event_info?.name,
          eventStartDate: (reg as any).event_info?.start_date,
        }));
      } catch (error) {
        console.error("Error fetching user event registrations:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch registrations",
        });
      }
    }),

  // Cancel event registration
  cancelEventRegistration: authedProcedure
    .input(z.object({ registrationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        await cancelEventRegistration(ctx.userId, input.registrationId);
        return { success: true };
      } catch (error) {
        console.error("Error cancelling registration:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to cancel registration",
        });
      }
    }),

  // Create new event for a competition
  create: authedProcedure
    .input(
      z.object({
        competitionId: z.string().uuid(),
        name: z.string().min(1, "Event name is required"),
        startDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
        categoryId: z.string().uuid(),
        rulesetId: z.string().uuid(),
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
        .eq("comp_id", input.competitionId)
        .eq("user_id", ctx.userId)
        .single();

      if (adminError || !adminCheck) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only competition admins can create events",
        });
      }

      // Validate dates
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);
      if (startDate > endDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End date must be after or equal to start date",
        });
      }

      try {
        // Get or create category_ruleset combination
        let { data: categoryRuleset, error: crError } = await supabase
          .from("category_ruleset")
          .select("id")
          .eq("category_id", input.categoryId)
          .eq("ruleset_id", input.rulesetId)
          .single();

        if (crError && crError.code === "PGRST116") {
          // Category-ruleset combination doesn't exist, create it
          const { data: newCR, error: newCRError } = await supabase
            .from("category_ruleset")
            .insert({
              category_id: input.categoryId,
              ruleset_id: input.rulesetId,
            })
            .select("id")
            .single();

          if (newCRError || !newCR) {
            console.error("Error creating category-ruleset:", newCRError);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create category-ruleset combination",
            });
          }

          categoryRuleset = newCR;
        } else if (crError) {
          console.error("Error checking category-ruleset:", crError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to validate category-ruleset combination",
          });
        }

        // Create the event
        const { data: event, error: eventError } = await supabase
          .from("event_info")
          .insert({
            name: input.name,
            start_date: input.startDate,
            end_date: input.endDate,
            category_ruleset_id: categoryRuleset!.id,
            comp_id: input.competitionId,
            event_status: "scheduled",
          })
          .select()
          .single();

        if (eventError || !event) {
          console.error("Error creating event:", eventError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create event",
          });
        }

        return {
          id: event.id,
          name: event.name,
          startDate: event.start_date,
          endDate: event.end_date,
          competitionId: event.comp_id,
          categoryRulesetId: event.category_ruleset_id,
          status: event.event_status,
        };
      } catch (error) {
        console.error("Event creation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to create event",
        });
      }
    }),

  // Update event (admin only)
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
        eventStatus: z
          .enum(["scheduled", "current", "completed", "cancelled"])
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId || !ctx.userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const supabase = getSupabaseUser(ctx.userToken);

      // Get event to find competition ID
      const { data: event, error: eventError } = await supabase
        .from("event_info")
        .select("comp_id")
        .eq("id", input.id)
        .single();

      if (eventError || !event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      // Check if user is admin of this competition
      const { data: adminCheck, error: adminError } = await supabase
        .from("competition_admins")
        .select("id")
        .eq("comp_id", event.comp_id)
        .eq("user_id", ctx.userId)
        .single();

      if (adminError || !adminCheck) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only competition admins can update events",
        });
      }

      // Validate dates if both provided
      if (input.startDate && input.endDate) {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        if (startDate > endDate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "End date must be after or equal to start date",
          });
        }
      }

      try {
        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.startDate) updateData.start_date = input.startDate;
        if (input.endDate) updateData.end_date = input.endDate;
        if (input.eventStatus) updateData.event_status = input.eventStatus;

        const { data: updatedEvent, error } = await supabase
          .from("event_info")
          .update(updateData)
          .eq("id", input.id)
          .select()
          .single();

        if (error || !updatedEvent) {
          console.error("Error updating event:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update event",
          });
        }

        return {
          id: updatedEvent.id,
          name: updatedEvent.name,
          startDate: updatedEvent.start_date,
          endDate: updatedEvent.end_date,
          competitionId: updatedEvent.comp_id,
          status: updatedEvent.event_status,
        };
      } catch (error) {
        console.error("Event update failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to update event",
        });
      }
    }),

  // Delete event (admin only)
  delete: authedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId || !ctx.userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const supabase = getSupabaseUser(ctx.userToken);

      // Get event to find competition ID
      const { data: event, error: eventError } = await supabase
        .from("event_info")
        .select("comp_id")
        .eq("id", input.id)
        .single();

      if (eventError || !event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      // Check if user is admin of this competition
      const { data: adminCheck, error: adminError } = await supabase
        .from("competition_admins")
        .select("id")
        .eq("comp_id", event.comp_id)
        .eq("user_id", ctx.userId)
        .single();

      if (adminError || !adminCheck) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only competition admins can delete events",
        });
      }

      try {
        const { error } = await supabase
          .from("event_info")
          .delete()
          .eq("id", input.id);

        if (error) {
          console.error("Error deleting event:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete event",
          });
        }

        return { success: true };
      } catch (error) {
        console.error("Event deletion failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to delete event",
        });
      }
    }),
});

const userRouter = router({
  // Get current user's registrations (all competitions)
  getMyRegistrations: authedProcedure.query(async ({ ctx }) => {
    if (!ctx.userId || !ctx.userToken) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const supabase = getSupabaseUser(ctx.userToken);
    const { data: registrations, error } = await supabase
      .from("event_registration")
      .select(
        `
          id,
          role,
          registration_status,
          event_info (
            id,
            name,
            start_date,
            end_date,
            event_status,
            comp_id,
            comp_info:comp_id (
              id,
              name,
              start_date,
              end_date
            )
          ),
          comp_participant!inner (
            user_id
          )
        `,
      )
      .eq("comp_participant.user_id", ctx.userId)
      .order("event_info.start_date", { ascending: true });

    if (error) {
      console.error("Error fetching user registrations:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch registrations",
      });
    }

    return registrations || [];
  }),

  // Update user profile
  updateProfile: authedProcedure
    .input(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId || !ctx.userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const supabase = getSupabaseUser(ctx.userToken);
      const { data: updatedUser, error } = await supabase
        .from("user_info")
        .update({
          firstname: input.firstName,
          lastname: input.lastName,
          email: input.email,
        })
        .eq("id", ctx.userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating user profile:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }

      return updatedUser;
    }),
});

// Data router for supporting entities
const dataRouter = router({
  // Get all venues
  getVenues: publicProcedure.query(async () => {
    const supabase = getSupabaseAnon();
    console.log("🏢 Fetching venues...");

    const { data: venues, error } = await supabase
      .from("venue")
      .select("*")
      .order("name", { ascending: true });

    console.log("🏢 Venues query result:", {
      venues,
      error,
      count: venues?.length,
    });

    if (error) {
      console.error("Error fetching venues:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch venues",
      });
    }

    return venues || [];
  }),

  // Get all event categories
  getEventCategories: publicProcedure.query(async () => {
    const supabase = getSupabaseAnon();
    const { data: categories, error } = await supabase
      .from("event_categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching event categories:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch event categories",
      });
    }

    return categories || [];
  }),

  // Get all rulesets with scoring methods
  getRulesets: publicProcedure.query(async () => {
    const supabase = getSupabaseAnon();
    const { data: rulesets, error } = await supabase
      .from("rulesets")
      .select(
        `
        *,
        scoring_methods (
          id,
          name,
          description
        )
      `,
      )
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching rulesets:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch rulesets",
      });
    }

    return rulesets || [];
  }),

  // Get all scoring methods
  getScoringMethods: publicProcedure.query(async () => {
    const supabase = getSupabaseAnon();
    const { data: scoringMethods, error } = await supabase
      .from("scoring_methods")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching scoring methods:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch scoring methods",
      });
    }

    return scoringMethods || [];
  }),

  // Create venue (authenticated users only)
  createVenue: authedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Venue name is required"),
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        googleMapsUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId || !ctx.userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Use user client to enforce RLS policies
      const supabase = getSupabaseUser(ctx.userToken);

      try {
        const { data: venue, error } = await supabase
          .from("venue")
          .insert({
            name: input.name,
            street: input.street || null,
            city: input.city || null,
            state: input.state || null,
            postal_code: input.postalCode || null,
            country: input.country || null,
            google_maps_url: input.googleMapsUrl || null,
          })
          .select()
          .single();

        if (error || !venue) {
          console.error("Error creating venue:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create venue",
          });
        }

        return {
          id: venue.id,
          name: venue.name,
          street: venue.street,
          city: venue.city,
          state: venue.state,
          postalCode: venue.postal_code,
          country: venue.country,
          googleMapsUrl: venue.google_maps_url,
        };
      } catch (error) {
        console.error("Venue creation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to create venue",
        });
      }
    }),
});

// Main app router
export const appRouter = router({
  competition: competitionRouter,
  event: eventRouter,
  user: userRouter,
  data: dataRouter,
});

// Export type definition
export type AppRouter = typeof appRouter;
