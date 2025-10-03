import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, authedProcedure } from "../base";
import { getSupabaseAnon, getSupabaseUser } from "../../dal/supabase";

// Data router for supporting entities
export const dataRouter = router({
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