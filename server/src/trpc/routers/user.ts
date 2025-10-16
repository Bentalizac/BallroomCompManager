import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, authedProcedure } from "../base";
import { getSupabaseUser } from "../../dal/supabase";
import { registerForCompSchema } from "@ballroomcompmanager/shared"
import { getUserProfile, updateUserProfile, checkProfileStatus, type ProfileUpdateData } from "../../dal/userProfile";
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

  // Get user's role in a specific competition
  getUserRoleInCompetition: authedProcedure
    .input(z.object({ competitionId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.userId || !ctx.userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const supabase = getSupabaseUser(ctx.userToken);

      // Primary source of truth: Check if user is a competition admin
      const { data: adminCheck, error: adminError } = await supabase
        .from("competition_admins")
        .select("id")
        .eq("comp_id", input.competitionId)
        .eq("user_id", ctx.userId)
        .single();

      const isAdmin = !adminError && adminCheck;

      // Get user's participant roles in the competition
      const { data: participantRoles, error: participantError } = await supabase
        .from("comp_participant")
        .select("id, role, participation_status")
        .eq("comp_id", input.competitionId)
        .eq("user_id", ctx.userId)
        .eq("participation_status", "active");

      if (participantError && participantError.code !== 'PGRST116') {
        if (process.env.NODE_ENV === 'development') console.error("Error fetching participant roles:", participantError);
      }

      // If user is an admin but doesn't have an organizer participant role, create one
      if (isAdmin && (!participantRoles || participantRoles.length === 0 || 
          !participantRoles.some(p => p.role === 'organizer'))) {
        try {
          const { error: insertError } = await supabase
            .from("comp_participant")
            .insert({
              user_id: ctx.userId,
              comp_id: input.competitionId,
              role: 'organizer',
              participation_status: 'active'
            });

          if (insertError) {
            if (process.env.NODE_ENV === 'development') {
              console.error("Error creating organizer participant record:", insertError);
            }
          } else {
            // Refetch participant roles after insertion
            const { data: updatedRoles } = await supabase
              .from("comp_participant")
              .select("id, role, participation_status")
              .eq("comp_id", input.competitionId)
              .eq("user_id", ctx.userId)
              .eq("participation_status", "active");
            
            if (updatedRoles) {
              participantRoles?.push(...updatedRoles.filter(r => 
                !participantRoles.some(p => p.id === r.id)));
            }
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error("Error syncing admin to participant:", error);
          }
        }
      }

      // Determine the highest level role
      let highestRole: string | null = null;
      
      if (isAdmin) {
        // Admins always have admin role, regardless of participant table
        highestRole = "admin";
      } else if (participantRoles && participantRoles.length > 0) {
        // Priority: organizer > judge > competitor > spectator
        const rolePriority: Record<string, number> = {
          organizer: 3,
          judge: 2, 
          competitor: 1,
          spectator: 0
        };
        
        const topRole = participantRoles.reduce((prev, current) => {
          const prevPriority = rolePriority[prev.role] || -1;
          const currentPriority = rolePriority[current.role] || -1;
          return currentPriority > prevPriority ? current : prev;
        });
        
        highestRole = topRole.role;
      }

      return {
        role: highestRole,
        isAdmin: !!isAdmin,
        isOrganizer: !!isAdmin || (participantRoles && participantRoles.some(p => p.role === 'organizer')),
        participantRoles: participantRoles || [],
        hasAccess: !!isAdmin || (participantRoles && participantRoles.length > 0)
      };
    }),

  // Get current user's profile
  getMyProfile: authedProcedure.query(async ({ ctx }) => {
    if (!ctx.userId || !ctx.userToken) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    try {
      const profile = await getUserProfile(ctx.userToken, ctx.userId);
      return profile;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching user profile:", error);
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch profile",
      });
    }
  }),

  // Check if user profile is complete
  checkProfileStatus: authedProcedure.query(async ({ ctx }) => {
    if (!ctx.userId || !ctx.userToken) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    try {
      const status = await checkProfileStatus(ctx.userToken, ctx.userId);
      return status;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error checking profile status:", error);
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to check profile status",
      });
    }
  }),

  // Complete/update user profile
  completeProfile: authedProcedure
    .input(
      z.object({
        email: z.string().email().min(1, "Email is required"),
        firstname: z.string().min(1, "First name is required"),
        lastname: z.string().min(1, "Last name is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId || !ctx.userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const updatedProfile = await updateUserProfile(ctx.userToken, ctx.userId, {
          email: input.email,
          firstname: input.firstname,
          lastname: input.lastname
        });
        return updatedProfile;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error updating user profile:", error);
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }
    }),
});
