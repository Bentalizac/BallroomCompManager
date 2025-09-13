import { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';

/**
 * Creates context for tRPC requests
 */
export function createContext(opts: CreateHTTPContextOptions) {
  return {
    // Add any context data you need here
    // For example: user authentication, database connections, etc.
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;