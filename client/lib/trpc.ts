import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server/src/trpc/router';

// Create tRPC React client
export const trpc = createTRPCReact<AppRouter>();

// tRPC client configuration
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/trpc', // Your server URL
      
      // Add headers if needed (auth, etc.)
      // headers() {
      //   return {
      //     Authorization: `Bearer ${getAuthToken()}`,
      //   };
      // },
    }),
  ],
});