import { initTRPC, TRPCError } from "@trpc/server";

export type Context = {
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

// Procedure that asserts that the user is logged in
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