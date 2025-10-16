import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, authedProcedure } from "../base";
import {
  registerUserForEvent,
  getUserEventRegistrations,
  cancelEventRegistration,
} from "../../dal/eventRegistration";
import { getSupabaseUser } from "../../dal/supabase";
import { EventApi } from "@ballroomcompmanager/shared";
import { mapEventRowToDTO } from "../mappers";

export const eventRouter = router({
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

      if (process.env.NODE_ENV === 'development') console.log("🎯 Registering user for event:", {
        userId: ctx.userId,
        eventId: input.eventId,
        role: input.role,
      });

      try {
        const registration = await registerUserForEvent(
          ctx.userToken!,
          ctx.userId,
          input.eventId,
          input.role,
        );

        return {
          id: registration.id,
          eventId: registration.event_info_id,
          role: registration.role,
          registrationStatus: registration.registration_status,
          registrationDate: new Date().toISOString(),
        };
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error("❌ Event registration failed:", error);
        
        // Handle profile incomplete errors specifically
        if (error instanceof Error && (error as any).code === 'PROFILE_INCOMPLETE') {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: error.message,
            cause: {
              code: 'PROFILE_INCOMPLETE',
              missingFields: (error as any).missingFields || []
            }
          });
        }
        
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
          ctx.userToken!,
          ctx.userId,
          input.competitionId,
        );

        type EventInfoLite = { name: string; start_date: string } | null | undefined;
        type RegJoined = typeof registrations[number] & { event_info?: EventInfoLite };

        return (registrations as RegJoined[]).map((reg) => ({
          id: reg.id,
          eventId: reg.event_info_id,
          role: reg.role,
          registrationStatus: reg.registration_status,
          eventName: reg.event_info?.name,
          eventStartDate: reg.event_info?.start_date,
        }));
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error("Error fetching user event registrations:", error);
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
        await cancelEventRegistration(ctx.userToken!, ctx.userId, input.registrationId);
        return { success: true };
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error("Error cancelling registration:", error);
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
        startAt: z.string().datetime(), // ISO 8601 UTC timestamp
        endAt: z.string().datetime(),   // ISO 8601 UTC timestamp
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

      // Validate timestamps
      const startAt = new Date(input.startAt);
      const endAt = new Date(input.endAt);
      if (startAt >= endAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End time must be after start time",
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
            if (process.env.NODE_ENV === 'development') console.error("Error creating category-ruleset:", newCRError);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create category-ruleset combination",
            });
          }

          categoryRuleset = newCR;
        } else if (crError) {
          if (process.env.NODE_ENV === 'development') console.error("Error checking category-ruleset:", crError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to validate category-ruleset combination",
          });
        }

        // Get competition time zone for response
        const { data: comp, error: compError } = await supabase
          .from("comp_info")
          .select("time_zone")
          .eq("id", input.competitionId)
          .single();
          
        if (compError || !comp) {
          if (process.env.NODE_ENV === 'development') console.error("Error fetching competition:", compError);
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Competition not found",
          });
        }

        // Create the event (need both timestamps and date fields for compatibility)
        const startDate = startAt.toISOString().split('T')[0]; // Extract date part (YYYY-MM-DD)
        const endDate = endAt.toISOString().split('T')[0];     // Extract date part (YYYY-MM-DD)
        
        const { data: event, error: eventError } = await supabase
          .from("event_info")
          .insert({
            name: input.name,
            start_at: input.startAt,
            end_at: input.endAt,
            start_date: startDate,
            end_date: endDate,
            category_ruleset_id: categoryRuleset!.id,
            comp_id: input.competitionId,
            event_status: "scheduled",
          })
          .select()
          .single();

        if (eventError || !event) {
          if (process.env.NODE_ENV === 'development') console.error("Error creating event:", eventError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create event",
          });
        }

        // Use mapper and validate with zod
        const mapped = mapEventRowToDTO(event, comp.time_zone);
        return EventApi.parse(mapped);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error("Event creation failed:", error);
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
        startAt: z.string().datetime().optional(), // ISO 8601 UTC timestamp
        endAt: z.string().datetime().optional(),   // ISO 8601 UTC timestamp
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

      // Validate timestamps if both provided
      if (input.startAt && input.endAt) {
        const startAt = new Date(input.startAt);
        const endAt = new Date(input.endAt);
        if (startAt >= endAt) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "End time must be after start time",
          });
        }
      }

      try {
        // Get competition time zone for response
        const { data: comp, error: compError } = await supabase
          .from("comp_info")
          .select("time_zone")
          .eq("id", event.comp_id)
          .single();
          
        if (compError || !comp) {
          if (process.env.NODE_ENV === 'development') console.error("Error fetching competition:", compError);
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Competition not found",
          });
        }
        
        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.startAt) {
          updateData.start_at = input.startAt;
          updateData.start_date = new Date(input.startAt).toISOString().split('T')[0];
        }
        if (input.endAt) {
          updateData.end_at = input.endAt;
          updateData.end_date = new Date(input.endAt).toISOString().split('T')[0];
        }
        if (input.eventStatus) updateData.event_status = input.eventStatus;

        const { data: updatedEvent, error } = await supabase
          .from("event_info")
          .update(updateData)
          .eq("id", input.id)
          .select()
          .single();

        if (error || !updatedEvent) {
          if (process.env.NODE_ENV === 'development') console.error("Error updating event:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update event",
          });
        }

        // Use mapper and validate with zod
        const mapped = mapEventRowToDTO(updatedEvent, comp.time_zone);
        return EventApi.parse(mapped);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error("Event update failed:", error);
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
          if (process.env.NODE_ENV === 'development') console.error("Error deleting event:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete event",
          });
        }

        return { success: true };
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error("Event deletion failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to delete event",
        });
      }
    }),
});