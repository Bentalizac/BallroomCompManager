# Architecture Decision Record (ADR)

## 1. Title
Refactor tRPC Router into Modular Domain-Based Structure

## 2. Status
- ✅ **Accepted** (Implemented)

## 3. Context
The initial tRPC router implementation had all procedures defined in a single `router.ts` file. As the application grew, this led to:

- **Maintainability issues**: Single file exceeded 500+ lines, difficult to navigate
- **Code organization**: Mixed concerns (competitions, events, users, data) in one file
- **Collaboration friction**: Multiple developers editing the same file caused merge conflicts
- **Testing complexity**: Hard to unit test individual domain routers
- **Readability**: Difficult to understand API surface area at a glance

---

## 4. Decision
Refactor the monolithic tRPC router into a **modular, domain-based structure** with the following organization:

### File Structure
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

### Core Components

#### `base.ts` - tRPC Foundation
- **Context type definition**: Shared across all routers
- **Router factory function**: Create new router instances
- **Procedure builders**: 
  - `publicProcedure` - No authentication required
  - `authedProcedure` - Requires authenticated user

#### `schemas.ts` - Validation Layer
- Shared Zod schemas for common input patterns
- Reusable validation logic (IDs, pagination, filters)

#### `mappers.ts` - Data Transformation
- Database row → Domain DTO transformations
- Type-safe mapping functions with TypeScript inference
- Keeps database structure separate from domain models

#### Domain Routers
Each router focuses on a specific domain:
- **`competition.ts`**: CRUD for competitions, list with venues/events
- **`event.ts`**: Event management, registrations, cancellations
- **`user.ts`**: User profiles, registration queries
- **`data.ts`**: Reference data (venues, categories, rulesets, scoring)

---

## 5. Alternatives Considered

### Option A: Keep Monolithic Router
**Pros**: Simple, no refactoring needed  
**Cons**: Poor maintainability, merge conflicts, hard to test  
**Verdict**: ❌ Rejected - Technical debt accumulating

### Option B: Split by Operation Type (CRUD-based)
**Pros**: Clear separation of create/read/update/delete  
**Cons**: Domain logic scattered, hard to understand feature flows  
**Verdict**: ❌ Rejected - Doesn't align with domain-driven design

### Option C: Split by Domain (Chosen)
**Pros**: Clear boundaries, easy to find code, testable, scalable  
**Cons**: Requires refactoring, slightly more boilerplate  
**Verdict**: ✅ **Selected** - Best long-term maintainability

---

## 6. Consequences

### Positive Effects
- ✅ **Improved maintainability**: Each domain router is <200 lines
- ✅ **Better readability**: Clear file names indicate purpose
- ✅ **Easier testing**: Can test individual routers in isolation
- ✅ **Reduced merge conflicts**: Multiple devs work on different routers
- ✅ **Clear ownership**: Domain experts can own specific router files
- ✅ **Scalability**: Easy to add new routers without touching existing code

### Potential Tradeoffs
- ⚠️ **More files**: Navigation requires understanding file structure
- ⚠️ **Indirection**: Main router imports and combines sub-routers
- ⚠️ **Initial effort**: One-time refactoring cost

### Impact on Future Features
- ✅ Adding new endpoints: Create new router or add to existing domain router
- ✅ Domain expansion: Easy to add new routers (e.g., `routers/results.ts`, `routers/judging.ts`)
- ✅ Feature isolation: Changes to one domain don't affect others

---

## 7. Implementation Notes

### Files/Modules Affected
```typescript
// Before (single file):
server/src/trpc/router.ts  (500+ lines)

// After (modular):
server/src/trpc/
├── router.ts              (50 lines - combines routers)
├── base.ts                (40 lines - setup)
├── schemas.ts             (60 lines - validation)
├── mappers.ts             (150 lines - transformations)
└── routers/
    ├── competition.ts     (180 lines)
    ├── event.ts          (120 lines)
    ├── user.ts           (80 lines)
    └── data.ts           (100 lines)
```

### Router Combination Pattern
```typescript
// router.ts - Main entry point
import { router } from './base';
import { competitionRouter } from './routers/competition';
import { eventRouter } from './routers/event';
import { userRouter } from './routers/user';
import { dataRouter } from './routers/data';

export const appRouter = router({
  competition: competitionRouter,
  event: eventRouter,
  user: userRouter,
  data: dataRouter,
});

export type AppRouter = typeof appRouter;
```

### Required Migrations
1. ✅ Extract shared context and procedures to `base.ts`
2. ✅ Extract validation schemas to `schemas.ts`
3. ✅ Extract mapper functions to `mappers.ts`
4. ✅ Split procedures into domain routers
5. ✅ Update main `router.ts` to combine sub-routers
6. ✅ Update client imports (no changes needed - type still `AppRouter`)

### Dependencies
No new dependencies required - internal refactoring only.

---

## 8. Related Decisions
- [ADR-001: Monorepo Architecture with Domain-Driven Design](./adr-001-monorepo-domain-types.md)
- [ADR-003: Supabase Authentication with JWT](./adr-003-supabase-auth-jwt.md)

---

## 9. Open Questions
- ✅ **Resolved**: Should we nest routers further? → No, current structure sufficient
- ✅ **Resolved**: Where do mappers go? → Dedicated `mappers.ts` file
- ⚠️ **Open**: Should we add integration tests for each router?
- ⚠️ **Open**: Should we add rate limiting per router?

---

## 10. Checklist
- [x] Team agrees on decision
- [x] Modular structure implemented
- [x] All procedures migrated to domain routers
- [x] Mapper functions extracted and typed
- [x] Client code tested (no breaking changes)
- [x] Documentation updated (server/src/trpc/README.md)
- [ ] RAG embeddings refreshed ← **Next step**
