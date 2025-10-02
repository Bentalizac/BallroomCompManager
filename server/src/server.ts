import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

// Debug environment variables
console.log("🔧 Environment check:");
console.log(
  "  SUPABASE_URL:",
  process.env.SUPABASE_URL ? "Set ✅" : "Missing ❌",
);
console.log(
  "  SUPABASE_ANON_KEY:",
  process.env.SUPABASE_ANON_KEY ? "Set ✅" : "Missing ❌",
);
console.log(
  "  SUPABASE_SERVICE_ROLE_KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set ✅" : "Missing ❌",
);
console.log("  NODE_ENV:", process.env.NODE_ENV || "undefined");
console.log();

import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./trpc/router";
import { verifySupabaseJWT, isDevelopmentMode } from "./auth/jwt";
import {
  getSupabaseAdmin,
  isCompetitionAdmin,
  getCompetitionIdFromEvent,
} from "./dal/supabase";
import * as csv from "fast-csv";

const app = express();
const PORT = process.env.PORT || 3002;

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(
    `📡 ${req.method} ${req.url} - Origin: ${req.headers.origin || "none"}`,
  );
  next();
});

// CORS configuration for tRPC
app.use(
  cors({
    origin: "http://localhost:3000", // Next.js client URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-trpc-source'],
    exposedHeaders: ['x-trpc-source'],
  }),
);

// tRPC middleware with JWT context
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: async ({ req, res }) => {
      // Extract user from JWT token
      const authHeader = req.headers.authorization;
      console.log(
        "🔍 tRPC Context - Auth Header:",
        authHeader ? "Present" : "Missing",
      );

      const authResult = await verifySupabaseJWT(authHeader);
      console.log(
        "🔍 tRPC Context - Auth Result:",
        authResult ? `User: ${authResult.userId}` : "No user",
      );

      // Extract JWT token if present
      let userToken: string | null = null;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        userToken = authHeader.substring(7);
      }

      return {
        userId: authResult?.userId || null,
        userToken,
        user: null, // Keep for backwards compatibility
        participant: null, // Keep for backwards compatibility
        compID: null, // Keep for backwards compatibility
      };
    },
  }),
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// CSV Export Routes

// Export event results as CSV
app.get("/export/event/:id/results.csv", async (req, res) => {
  try {
    const eventId = req.params.id;
    const authHeader = req.headers.authorization;

    // Get competition ID from event ID
    const competitionId = await getCompetitionIdFromEvent(eventId);
    if (!competitionId) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check authorization
    const authResult = await verifySupabaseJWT(authHeader);
    if (!authResult?.userId) {
      if (isDevelopmentMode() && !authHeader) {
        console.warn("⚠️  Development mode: allowing CSV export without auth");
      } else {
        return res.status(401).json({ error: "Authentication required" });
      }
    }

    // Verify admin access to competition
    if (authResult?.userId) {
      const isAdmin = await isCompetitionAdmin(
        authResult.userId,
        competitionId,
      );
      if (!isAdmin) {
        return res
          .status(403)
          .json({ error: "Admin access required for this competition" });
      }
    }

    // Query results with names
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("event_results")
      .select(
        `
        *,
        event_registration (
          role,
          comp_participant (
            user_id,
            user_info (
              firstname,
              lastname,
              email
            )
          )
        )
      `,
      )
      .eq("event_registration.event_info_id", eventId)
      .order("rank", { ascending: true });

    if (error) {
      console.error("Error fetching results:", error);
      return res.status(500).json({ error: "Failed to fetch results" });
    }

    // Transform data for CSV
    const csvData = (data || []).map((result) => ({
      rank: result.rank,
      score: result.score,
      firstName:
        result.event_registration?.comp_participant?.user_info?.firstname || "",
      lastName:
        result.event_registration?.comp_participant?.user_info?.lastname || "",
      email:
        result.event_registration?.comp_participant?.user_info?.email || "",
      role: result.event_registration?.role || "",
    }));

    // Set CSV headers
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="event_${eventId}_results.csv"`,
    );

    // Stream CSV
    csv.writeToStream(res, csvData, { headers: true });
  } catch (error) {
    console.error("CSV export error:", error);
    res.status(500).json({ error: "Export failed" });
  }
});

// Export event registrations as CSV
app.get("/export/event/:id/registrations.csv", async (req, res) => {
  try {
    const eventId = req.params.id;
    const authHeader = req.headers.authorization;

    // Get competition ID from event ID
    const competitionId = await getCompetitionIdFromEvent(eventId);
    if (!competitionId) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check authorization
    const authResult = await verifySupabaseJWT(authHeader);
    if (!authResult?.userId) {
      if (isDevelopmentMode() && !authHeader) {
        console.warn("⚠️  Development mode: allowing CSV export without auth");
      } else {
        return res.status(401).json({ error: "Authentication required" });
      }
    }

    // Verify admin access to competition
    if (authResult?.userId) {
      const isAdmin = await isCompetitionAdmin(
        authResult.userId,
        competitionId,
      );
      if (!isAdmin) {
        return res
          .status(403)
          .json({ error: "Admin access required for this competition" });
      }
    }

    // Query registrations with participant info
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("event_registration")
      .select(
        `
        *,
        comp_participant (
          user_info (
            firstname,
            lastname,
            email
          )
        ),
        partner:event_registration!partner_id (
          comp_participant (
            user_info (
              firstname,
              lastname
            )
          )
        )
      `,
      )
      .eq("event_info_id", eventId)
      .order("registration_status", { ascending: true });

    if (error) {
      console.error("Error fetching registrations:", error);
      return res.status(500).json({ error: "Failed to fetch registrations" });
    }

    // Transform data for CSV
    const csvData = (data || []).map((reg) => ({
      firstName: reg.comp_participant?.user_info?.firstname || "",
      lastName: reg.comp_participant?.user_info?.lastname || "",
      email: reg.comp_participant?.user_info?.email || "",
      role: reg.role,
      status: reg.registration_status,
      partnerFirstName:
        reg.partner?.comp_participant?.user_info?.firstname || "",
      partnerLastName: reg.partner?.comp_participant?.user_info?.lastname || "",
    }));

    // Set CSV headers
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="event_${eventId}_registrations.csv"`,
    );

    // Stream CSV
    csv.writeToStream(res, csvData, { headers: true });
  } catch (error) {
    console.error("CSV export error:", error);
    res.status(500).json({ error: "Export failed" });
  }
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 tRPC endpoint: http://localhost:${PORT}/trpc`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(
    `📊 CSV exports: http://localhost:${PORT}/export/event/:id/results.csv`,
  );
  console.log(
    `📊 CSV exports: http://localhost:${PORT}/export/event/:id/registrations.csv`,
  );
});
