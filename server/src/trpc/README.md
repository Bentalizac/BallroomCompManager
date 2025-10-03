# tRPC Router Structure

The tRPC router has been refactored into a modular structure for better maintainability and readability.

## File Structure

```
server/src/trpc/
├── router.ts              # Main entry point - combines all routers
├── base.ts                # tRPC initialization and shared procedures
├── schemas.ts             # Shared Zod validation schemas
├── mappers.ts             # DB → DTO mapping functions
└── routers/
    ├── competition.ts     # Competition CRUD operations
    ├── event.ts          # Event management and registration
    ├── user.ts           # User profile and registration queries
    └── data.ts           # Supporting entities (venues, categories, etc.)
```

## Components

### `base.ts`
- **Purpose**: Core tRPC setup and shared utilities
- **Exports**: 
  - `Context` type definition
  - `router` factory function
  - `publicProcedure` - No authentication required
  - `authedProcedure` - Requires authenticated user

### `schemas.ts`
- **Purpose**: Shared Zod validation schemas
- **Exports**: Common input validation schemas used across routers

### `mappers.ts`
- **Purpose**: Database row to DTO transformation
- **Exports**: 
  - `mapCompetitionRowToDTO()`
  - `mapEventRowToDTO()` 
  - `mapVenueRowToDTO()`
  - Type definitions for database row shapes

### `routers/competition.ts`
- **Routes**:
  - `getAll` - List all competitions with venues and events
  - `getById` - Get single competition by ID
  - `getEvents` - Get events for a specific competition
  - `getEventRegistrations` - Get all registrations for a competition
  - `create` - Create new competition (authed)
  - `update` - Update competition (admin only)
  - `delete` - Delete competition (admin only)

### `routers/event.ts`
- **Routes**:
  - `registerForEvent` - Register user for an event (authed)
  - `getUserEventRegistrations` - Get user's registrations for a competition
  - `cancelEventRegistration` - Cancel a registration (authed)
  - `create` - Create new event (admin only)
  - `update` - Update event (admin only)
  - `delete` - Delete event (admin only)

### `routers/user.ts`
- **Routes**:
  - `getMyRegistrations` - Get current user's event registrations
  - `updateProfile` - Update user profile information

### `routers/data.ts`
- **Routes**:
  - `getVenues` - List all venues (public)
  - `getEventCategories` - List all event categories (public)
  - `getRulesets` - List all rulesets with scoring methods (public)
  - `getScoringMethods` - List all scoring methods (public)
  - `createVenue` - Create new venue (authed)

## Type Safety

The modular structure maintains full type safety through:

1. **Shared Context**: All routers use the same `Context` type from `base.ts`
2. **DTO Validation**: All responses are validated with Zod schemas from the shared package
3. **Database Mapping**: Type-safe transformations from DB rows to DTOs

## Usage

Import the router as before:

```typescript
import { appRouter, type AppRouter } from "./trpc/router";
```

The public API remains unchanged - only the internal organization has been improved.

## Benefits

- **Maintainability**: Each domain has its own file
- **Readability**: Smaller files focused on specific concerns
- **Testing**: Easier to test individual router modules
- **Collaboration**: Multiple developers can work on different routers
- **Type Safety**: Maintained throughout the modular structure