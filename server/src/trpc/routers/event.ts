import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, authedProcedure } from "../base";
import {
  registerUserForEvent,
  getUserEventRegistrations,
  cancelEventRegistration,
} from "../../dal/eventRegistration";
import { getSupabaseUser } from "../../dal/supabase";

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
          if (process.env.NODE_ENV === 'development') console.error("Error creating event:", eventError);
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
          eventStatus: event.event_status,
        };
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
          if (process.env.NODE_ENV === 'development') console.error("Error updating event:", error);
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
          eventStatus: updatedEvent.event_status,
        };
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