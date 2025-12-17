// This file has been modularized. See:
// - ./base.ts for tRPC setup and shared procedures
// - ./schemas.ts for shared zod schemas
// - ./routers/competition.ts for competition routes
// - ./routers/event.ts for event routes
// - ./routers/user.ts for user routes
// - ./routers/data.ts for supporting entity routes

import { router } from "./base";
import { competitionRouter } from "./routers/competition";
import { eventRouter } from "./routers/event";
import { userRouter } from "./routers/user";
import { dataRouter } from "./routers/data";

// Main app router
export const appRouter = router({
  competition: competitionRouter,
  event: eventRouter,
  user: userRouter,
  data: dataRouter,
});

// Export type definition
export type AppRouter = typeof appRouter;

// Export Context type for external use
export type { Context } from "./base";
