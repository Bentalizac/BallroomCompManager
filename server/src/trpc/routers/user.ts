import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, authedProcedure } from "../base";
import { getSupabaseUser } from "../../dal/supabase";
import { registerForCompSchema } from "@ballroomcompmanager/shared"
export const userRouter = router({
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
      if (process.env.NODE_ENV === 'development') console.error("Error fetching user registrations:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch registrations",
      });
    }

    return registrations || [];
  }),

  // Register for a competition
  registerForComp: authedProcedure
    .input(z.object(registerForCompSchema))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId || !ctx.userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const supabase = getSupabaseUser(ctx.userToken!);
      
      // Check if user is already registered for this comp

      const { data: existingRegs, error: fetchError } = await supabase
        .from("comp_participant")
        .select("id")
        .eq("user_id", ctx.userId)
        .eq("comp_id", input.competitionId);

      if (fetchError) {
        if (process.env.NODE_ENV === 'development') console.error("Error checking existing registrations:", fetchError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check existing registrations",
        });
      }

      if (existingRegs && existingRegs.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is already registered for this competition",
        });
      }

      // Create participant entries for each role
      const participantInserts = input.roles.map(role => ({
        user_id: ctx.userId,
        comp_id: input.competitionId,
        role: role as "spectator" | "competitor" | "organizer" | "judge",
        participation_status: "active"
      }));

      const { data: newParticipants, error: participantError } = await supabase
        .from("comp_participant")
        .insert(participantInserts)
        .select();

      if (participantError || !newParticipants) {
        if (process.env.NODE_ENV === 'development') console.error("Error creating participants:", participantError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create participant registrations",
        });
      }

      return {
        success: true,
        participantIds: newParticipants.map(p => p.id),
        roles: input.roles,
        message: "Successfully registered for competition",
      };
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
        if (process.env.NODE_ENV === 'development') console.error("Error updating user profile:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }

      return updatedUser;
    }),
});
