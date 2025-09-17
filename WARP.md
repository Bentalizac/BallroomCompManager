# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

BallroomCompManager is a full-stack TypeScript application for managing ballroom dance competitions. The project uses a monorepo structure with three main packages managed by pnpm workspaces.

## Architecture

### Monorepo Structure
- **client/**: Next.js 15 frontend with React 19, using App Router and TailwindCSS
- **server/**: Express.js backend with tRPC API layer
- **shared/**: Common TypeScript types, enums, and utilities shared between client and server

### Key Technologies
- **Frontend**: Next.js 15 with Turbopack, React 19, TailwindCSS, Radix UI components
- **Backend**: Express.js with tRPC for type-safe API communication
- **Database/Auth**: Supabase for authentication and data storage
- **State Management**: TanStack React Query for server state management
- **Package Management**: pnpm with workspace configuration

### Type Safety Architecture
The project maintains end-to-end type safety through:
- Shared TypeScript types exported from the `shared` package
- tRPC router types automatically synchronized between client and server
- Client imports `AppRouter` type from server for type-safe API calls

## Development Commands

### Initial Setup
```bash
# Install all dependencies across workspaces
pnpm install

# Alternative using root package.json script
npm run install:all
```

### Development
```bash
# Start client development server (Next.js with Turbopack)
pnpm run dev:client
# or from client directory: pnpm dev

# Start server development server
pnpm run dev:server  
# or from server directory: pnpm dev

# Build shared package (required before running server)
pnpm run build:shared
# or from shared directory: pnpm build

# Watch mode for shared package during development
# (from shared directory)
pnpm dev
```

### Building
```bash
# Build client for production
cd client && pnpm build

# Build server for production  
cd server && pnpm build

# Build shared package
cd shared && pnpm build
```

### Linting and Code Quality
```bash
# Lint client code
cd client && pnpm lint

# Clean shared package build artifacts
cd shared && pnpm clean
```

## Development Workflow

### Working with Shared Types
1. When adding new types or utilities, add them to the `shared` package
2. Export them from `shared/index.ts`
3. Run `pnpm build` in the shared directory
4. Import them in client or server as needed: `import { Type } from '@ballroomcompmanager/shared'`

### API Development Pattern
1. Define API endpoints in `server/src/trpc/router.ts`
2. The `AppRouter` type is automatically available to the client
3. Client uses the tRPC React client with full type safety
4. Input validation uses Zod schemas

### Authentication Architecture
- Supabase handles authentication
- Client uses `@supabase/auth-helpers-nextjs` for Next.js integration
- Environment variables required: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Key File Locations

### Configuration Files
- `pnpm-workspace.yaml`: Workspace configuration for monorepo
- `client/next.config.ts`: Next.js configuration with Turbopack enabled
- `*/tsconfig.json`: TypeScript configuration for each package

### Core Application Files
- `server/src/trpc/router.ts`: Main tRPC API router
- `client/lib/trpc.ts`: Client-side tRPC configuration
- `client/lib/supabaseClient.ts`: Supabase client setup
- `shared/index.ts`: Main exports for shared package

### Type Definitions
- `shared/data/types/`: Core business logic types (User, Competition, Event, etc.)
- `shared/data/enums/`: Enums for roles, scoring methods, event types
- `shared/fakedata/`: Mock data for development and testing

## Development Server Ports
- Client (Next.js): http://localhost:3000
- Server (Express): http://localhost:3001
- tRPC endpoint: http://localhost:3001/trpc
- Health check: http://localhost:3001/health

## Testing Strategy
The project currently has placeholder test scripts. When implementing tests:
- Client: Use Next.js testing patterns with Jest/Vitest
- Server: Test tRPC procedures and Express endpoints
- Shared: Unit test type utilities and mock data functions