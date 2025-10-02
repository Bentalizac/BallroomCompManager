import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server/src/trpc/router';
import { supabase } from './supabaseClient';

// Create tRPC React client
export const trpc = createTRPCReact<AppRouter>();

// tRPC client configuration with auth headers
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/trpc', // Your server URL
      
      // Add auth headers
      async headers() {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          console.log('📤 tRPC Client: Sending Authorization header');
          return {
            Authorization: `Bearer ${session.access_token}`,
          };
        }
        
        console.log('📤 tRPC Client: No session found, sending request without auth');
        return {};
      },
    }),
  ],
});
