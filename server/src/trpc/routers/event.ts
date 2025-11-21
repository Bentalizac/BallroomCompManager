import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, authedProcedure } from "../base";
import {
  AllEventRegistrationRoleSchema,
  RegistrationRoleSchema,
} from "@ballroomcompmanager/shared";
import {
  createEventRegistration,
  getUserEventRegistrations,
  getEventRegistrations,
  cancelEventRegistration,
  removeParticipantFromRegistration,
  reactivateEventRegistration,
} from "../../dal/eventRegistration";
import { getSupabaseUser } from "../../dal/supabase";
import { mapEventRowEnrichedToCompEvent } from "../../mappers";
import * as EventDAL from "../../dal/event";
import * as CompetitionDAL from "../../dal/competition";

export const eventRouter = router({
  // REGISTRATION SYSTEM - supports individual, paired, and team registrations

  // Register current user for an event (individual registration)
  registerForEvent: authedProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
        role: AllEventRegistrationRoleSchema.optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (process.env.NODE_ENV === "development") {
        console.log("🎯 Registering user for event:", {
          userId: ctx.userId,
          eventId: input.eventId,
          role: input.role || "member",
        });
      }

      try {
        const registration = await createEventRegistration(
          ctx.userToken!,
          ctx.userId,
          {
            eventId: input.eventId,
            participants: [
              {
                userId: ctx.userId,
                role: (input.role || "member") as
                  | "competitor"
                  | "judge"
                  | "scrutineer"
                  | "lead"
                  | "follow"
                  | "coach"
                  | "member", // DAL will handle role mapping
              },
            ],
          },
        );

        return registration;
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Event registration failed:", error);
        }

        // Handle profile incomplete errors specifically
        if (
          error instanceof Error &&
          (error as any).code === "PROFILE_INCOMPLETE"
        ) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: error.message,
            cause: {
              code: "PROFILE_INCOMPLETE",
              missingFields: (error as any).missingFields || [],
            },
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Registration failed",
        });
      }
    }),

  // Create a new event registration (individual, paired, or team)
  createRegistration: authedProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
        participants: z
          .array(
            z.object({
              userId: z.string().uuid(),
              role: RegistrationRoleSchema.default("member"),
            }),
          )
          .min(1, "At least one participant is required"),
        teamName: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (process.env.NODE_ENV === "development") {
        console.log("🎯 Creating event registration:", {
          userId: ctx.userId,
          eventId: input.eventId,
          participants: input.participants,
          teamName: input.teamName,
        });
      }

      try {
        const registration = await createEventRegistration(
          ctx.userToken!,
          ctx.userId,
          {
            eventId: input.eventId,
            participants: input.participants as Array<{
              userId: string;
              role:
                | "competitor"
                | "judge"
                | "scrutineer"
                | "lead"
                | "follow"
                | "coach"
                | "member";
            }>,
            teamName: input.teamName,
          },
        );

        return registration;
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Event registration failed:", error);
        }

        // Handle profile incomplete errors specifically
        if (
          error instanceof Error &&
          (error as any).code === "PROFILE_INCOMPLETE"
        ) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: error.message,
            cause: {
              code: "PROFILE_INCOMPLETE",
              missingFields: (error as any).missingFields || [],
            },
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Registration failed",
        });
      }
    }),

  // Get all registrations for an event (admin function)
  getEventRegistrations: authedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.userId || !ctx.userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // TODO: Add admin check here if needed
      try {
        const registrations = await getEventRegistrations(
          ctx.userToken,
          input.eventId,
        );
        return registrations;
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error fetching event registrations:", error);
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch event registrations",
        });
      }
    }),

  // Remove a participant from a registration
  removeParticipant: authedProcedure
    .input(
      z.object({
        registrationId: z.string().uuid(),
        userIdToRemove: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        await removeParticipantFromRegistration(
          ctx.userToken!,
          ctx.userId,
          input.registrationId,
          input.userIdToRemove,
        );
        return { success: true };
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error removing participant:", error);
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to remove participant",
        });
      }
    }),

  // Reactivate a withdrawn registration
  reactivateRegistration: authedProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
        teamName: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (process.env.NODE_ENV === "development") {
        console.log("🔄 Reactivating registration:", {
          userId: ctx.userId,
          eventId: input.eventId,
          teamName: input.teamName,
        });
      }

      try {
        const registration = await reactivateEventRegistration(
          ctx.userToken!,
          ctx.userId,
          input.eventId,
          input.teamName,
        );

        return registration;
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Registration reactivation failed:", error);
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Reactivation failed",
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

        return registrations;
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error fetching user event registrations:", error);
        }
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
        await cancelEventRegistration(
          ctx.userToken!,
          ctx.userId,
          input.registrationId,
        );
        return { success: true };
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error cancelling registration:", error);
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to cancel registration",
        });
      }
    }),

  // Get events for a competition
  getEvents: authedProcedure
    .input(z.object({ competitionId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.userId || !ctx.userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const supabase = getSupabaseUser(ctx.userToken);

      try {
        // Use enriched query to get full domain data
        const { data: events, error: eventsError } =
          await EventDAL.getCompetitionEventsEnriched(
            supabase,
            input.competitionId,
          );

        if (eventsError) {
          if (process.env.NODE_ENV === "development")
            console.error("Error fetching events:", eventsError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch events",
          });
        }

        // Map enriched DB rows to CompEvent domain types
        return (events || []).map(mapEventRowEnrichedToCompEvent);
      } catch (error) {
        if (process.env.NODE_ENV === "development")
          console.error("Events fetch failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch events",
        });
      }
    }),

  // Create new event for a competition
  create: authedProcedure
    .input(
      z.object({
        competitionId: z.string().uuid(),
        name: z.string().min(1, "Event name is required"),
        startDate: z.date().nullable(),
        endDate: z.date().nullable(),
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
      const { data: adminCheck, error: adminError } =
        await CompetitionDAL.isCompetitionAdmin(
          supabase,
          input.competitionId,
          ctx.userId,
        );

      if (adminError || !adminCheck) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only competition admins can create events",
        });
      }

      // Validate timestamps if both provided
      if (input.startDate && input.endDate) {
        if (input.startDate >= input.endDate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "End time must be after start time",
          });
        }
      }

      try {
        // Get or create category_ruleset combination
        const { data: categoryRuleset, error: crError } =
          await EventDAL.getOrCreateCategoryRuleset(
            supabase,
            input.categoryId,
            input.rulesetId,
          );

        if (crError || !categoryRuleset) {
          if (process.env.NODE_ENV === "development")
            console.error("Error with category-ruleset:", crError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get/create category-ruleset combination",
          });
        }

        // Create the event
        const eventData: any = {
          name: input.name,
          category_ruleset_id: categoryRuleset.id,
          comp_id: input.competitionId,
        };

        if (input.startDate) {
          eventData.start_at = input.startDate.toISOString();
          eventData.start_date = input.startDate.toISOString().split("T")[0];
        }
        if (input.endDate) {
          eventData.end_at = input.endDate.toISOString();
          eventData.end_date = input.endDate.toISOString().split("T")[0];
        }

        const { data: event, error: eventError } = await EventDAL.createEvent(
          supabase,
          eventData,
        );

        if (eventError || !event) {
          if (process.env.NODE_ENV === "development")
            console.error("Error creating event:", eventError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create event",
          });
        }

        // Map enriched DB row to CompEvent domain type
        return mapEventRowEnrichedToCompEvent(event);
      } catch (error) {
        if (process.env.NODE_ENV === "development")
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
        startDate: z.date().nullable().optional(),
        endDate: z.date().nullable().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId || !ctx.userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const supabase = getSupabaseUser(ctx.userToken);

      // Get event to find competition ID
      const { data: event, error: eventError } =
        await EventDAL.getEventCompetitionId(supabase, input.id);

      if (eventError || !event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      // Check if user is admin of this competition
      const { data: adminCheck, error: adminError } =
        await CompetitionDAL.isCompetitionAdmin(
          supabase,
          event.comp_id,
          ctx.userId,
        );

      if (adminError || !adminCheck) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only competition admins can update events",
        });
      }

      // Validate timestamps if both provided
      if (input.startDate && input.endDate) {
        if (input.startDate >= input.endDate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "End time must be after start time",
          });
        }
      }

      try {
        const updateData: any = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.startDate !== undefined) {
          if (input.startDate) {
            updateData.start_at = input.startDate.toISOString();
            updateData.start_date = input.startDate.toISOString().split("T")[0];
          } else {
            updateData.start_at = null;
            updateData.start_date = null;
          }
        }
        if (input.endDate !== undefined) {
          if (input.endDate) {
            updateData.end_at = input.endDate.toISOString();
            updateData.end_date = input.endDate.toISOString().split("T")[0];
          } else {
            updateData.end_at = null;
            updateData.end_date = null;
          }
        }

        const { data: updatedEvent, error } = await EventDAL.updateEvent(
          supabase,
          input.id,
          updateData,
        );

        if (error || !updatedEvent) {
          if (process.env.NODE_ENV === "development")
            console.error("Error updating event:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update event",
          });
        }

        // Map enriched DB row to CompEvent domain type
        console.log(
          "EVENT FETCHED",
          mapEventRowEnrichedToCompEvent(updatedEvent),
        );
        return mapEventRowEnrichedToCompEvent(updatedEvent);
      } catch (error) {
        if (process.env.NODE_ENV === "development")
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
      const { data: event, error: eventError } =
        await EventDAL.getEventCompetitionId(supabase, input.id);

      if (eventError || !event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      // Check if user is admin of this competition
      const { data: adminCheck, error: adminError } =
        await CompetitionDAL.isCompetitionAdmin(
          supabase,
          event.comp_id,
          ctx.userId,
        );

      if (adminError || !adminCheck) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only competition admins can delete events",
        });
      }

      try {
        const { error } = await EventDAL.deleteEvent(supabase, input.id);

        if (error) {
          if (process.env.NODE_ENV === "development")
            console.error("Error deleting event:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete event",
          });
        }

        return { success: true };
      } catch (error) {
        if (process.env.NODE_ENV === "development")
          console.error("Event deletion failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to delete event",
        });
      }
    }),
});
