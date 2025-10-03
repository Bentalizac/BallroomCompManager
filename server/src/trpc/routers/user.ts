import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, authedProcedure } from "../base";
import { getSupabaseUser } from "../../dal/supabase";

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