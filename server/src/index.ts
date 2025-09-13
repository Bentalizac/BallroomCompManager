import { createHTTPServer } from '@trpc/server/adapters/standalone';
import cors from 'cors';
import { appRouter } from './router';
import { createContext } from './context';

const PORT = process.env.PORT || 3001;

// Create the HTTP server with tRPC
const server = createHTTPServer({
  router: appRouter,
  createContext,
  middleware: cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Add your client URLs here
    credentials: true,
  }),
});

server.listen(PORT, () => {
  console.log(`🚀 tRPC server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`  - Health: http://localhost:${PORT}/health`);
  console.log(`  - Greeting: http://localhost:${PORT}/greeting`);
  console.log(`  - Echo: http://localhost:${PORT}/echo`);
});