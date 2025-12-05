# Refactor Proposal: Fix Pre-existing TypeScript Build Errors

## 1. Summary
**Purpose:**  
Fix TypeScript compilation errors preventing production builds in both server and client packages.

**Status:**  
- Proposed

**Owner:**  
- Development Team

---

## 2. Motivation

### Server Build Errors
The server package fails `pnpm build` with TypeScript inference errors:

```
src/dal/user.ts:48:23 - error TS2742: The inferred type of 'getUserEventRegistrations' cannot be named without a reference to '.pnpm/@supabase+postgrest-js@1.21.4/node_modules/@supabase/postgrest-js/dist/cjs/select-query-parser/utils'. This is likely not portable. A type annotation is necessary.

src/trpc/router.ts:16:14 - error TS2742: The inferred type of 'appRouter' cannot be named without a reference to '.pnpm/@supabase+postgrest-js@1.21.4/node_modules/@supabase/postgrest-js/dist/cjs/select-query-parser/utils'. This is likely not portable. A type annotation is necessary.

src/trpc/routers/user.ts:8:14 - error TS2742: The inferred type of 'userRouter' cannot be named without a reference to '.pnpm/@supabase+postgrest-js@1.21.4/node_modules/@supabase/postgrest-js/dist/cjs/select-query-parser/utils'. This is likely not portable. A type annotation is necessary.
```

### Client Build Errors
The client package fails `pnpm build` with missing export errors:

```
./client/app/(app)/comp/[slug]/schedule/components/panels/EventPanel.tsx:5:1
Export EventType doesn't exist in target module

./client/app/(app)/comp/[slug]/schedule/data/mockData.ts:2:1
Export EventType doesn't exist in target module

The export EventType was not found in module [project]/shared/data/enums/eventTypes.ts
Did you mean to import EntryType?
```

### Pain Points
- **Cannot build for production**: Both packages fail production builds, blocking deployment
- **Type safety compromised**: `ts-node` in dev mode is more lenient, masking real type issues
- **Developer confusion**: Unclear if changes introduced new errors or surfaced existing ones
- **CI/CD blockers**: Prevents automated builds and testing pipelines

---

## 3. Scope

### Affected Modules
- **Server**: `src/dal/user.ts`, `src/trpc/router.ts`, `src/trpc/routers/user.ts`
- **Client**: Schedule feature components and types
- **Shared**: May need to export missing types if they should exist

### Types of Changes
- Add explicit return type annotations to DAL functions
- Add explicit type annotations to tRPC routers
- Remove invalid imports or add missing exports
- Refactor type definitions in client schedule feature

### What is NOT Included
- Database schema changes
- Behavioral changes to any functions
- New features or functionality
- Performance optimizations

---

## 4. Current State

### Server Issues
**File: `server/src/dal/user.ts:48`**
```typescript
export async function getUserEventRegistrations(
  supabase: SupabaseClientType,
  userId: string
) {
  return await supabase
    .from('event_registrations')
    .select(USER_REGISTRATION_FIELDS)
    .eq('comp_participant.user_id', userId)
    .order('event_info.start_date', { ascending: true });
}
```
- Complex Supabase query with relational fields returns deeply nested types
- TypeScript cannot infer portable return type
- Type depends on internal Supabase PostgREST query parser types

**File: `server/src/trpc/router.ts:16`**
```typescript
export const appRouter = router({
  competition: competitionRouter,
  event: eventRouter,
  user: userRouter,
  data: dataRouter,
});
```
- Router type inference cascades from DAL function issues
- `userRouter` contains `getUserEventRegistrations` which has no explicit return type

**File: `server/src/trpc/routers/user.ts:8`**
```typescript
export const userRouter = router({
  getMyRegistrations: authedProcedure.query(async ({ ctx }) =>  {
    // ... calls getUserEventRegistrations
  }),
  // ...
});
```
- Inherits type inference issues from DAL layer

### Client Issues
**Files with Invalid Imports:**
- `client/app/(app)/comp/[slug]/schedule/types/index.ts:1`
- `client/app/(app)/comp/[slug]/schedule/components/panels/EventPanel.tsx:5`
- `client/app/(app)/comp/[slug]/schedule/data/mockData.ts:2`

All attempt to import non-existent `EventType`:
```typescript
import { EventType } from '@/../shared/data/enums/eventTypes';
```

**Available in `shared/data/enums/eventTypes.ts`:**
- `EventCategory` (type)
- `EventLevel` (type)
- `DanceStyle` (enum)
- `BallroomLevel` (enum)
- `WCSLevel` (enum)
- `CountrySwingLevel` (enum)
- `OtherLevel` (enum)
- `RoundLevel` (enum)
- `EntryType` (enum)

**NOT available:**
- `EventType` (does not exist)

---

## 5. Proposed Changes

### Server Changes

#### 5.1 Fix DAL Return Type (`server/src/dal/user.ts`)
Add explicit return type annotation to `getUserEventRegistrations`:

```typescript
import type { PostgrestSingleResponse } from '@supabase/supabase-js';

// Define explicit return type for the query result
type UserEventRegistrationRow = {
  id: string;
  role: string;
  registration_status: string;
  event_info: {
    id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    event_status: string;
    comp_id: string;
    comp_info: {
      id: string;
      name: string;
      start_date: string | null;
      end_date: string | null;
    };
  };
  comp_participant: {
    user_id: string;
  };
}[];

export async function getUserEventRegistrations(
  supabase: SupabaseClientType,
  userId: string
): Promise<PostgrestSingleResponse<UserEventRegistrationRow>> {
  return await supabase
    .from('event_registrations')
    .select(USER_REGISTRATION_FIELDS)
    .eq('comp_participant.user_id', userId)
    .order('event_info.start_date', { ascending: true });
}
```

#### 5.2 Verify Router Type Inference
After fixing DAL, verify that `appRouter` and `userRouter` compile without explicit annotations. If issues persist, add minimal type hints.

### Client Changes

#### 5.3 Fix Invalid Import (`client/app/(app)/comp/[slug]/schedule/types/index.ts`)

**Option A: Remove unused import (if not used)**
```typescript
// Remove this line if EventType is never used
// import { EventType } from '@/../shared/data/enums/eventTypes';

import { CompEvent } from '@/../shared/data/types/event';
import { STATE_TYPES } from '../components/dnd/drag/draggableItem';

export interface Event extends CompEvent {
  color: string | null;
  venue: Venue | null;
  state: STATE_TYPES;
}
```

**Option B: Replace with correct type (if needed)**
```typescript
// If we need event category information:
import { EventCategory } from '@/../shared/data/enums/eventTypes';
import { CompEvent } from '@/../shared/data/types/event';
```

**Option C: Create EventType if it's a valid missing export**
If `EventType` was intended to exist but was never created, add it to `shared/data/enums/eventTypes.ts`:

```typescript
// Add to shared/data/enums/eventTypes.ts if semantically needed
export type EventType = 'preliminary' | 'final' | 'showcase' | 'championship';
```

**Recommended**: Start with Option A (remove import), then audit usage to determine if Option B or C is needed.

#### 5.4 Fix Other Client Files
Apply the same fix to:
- `client/app/(app)/comp/[slug]/schedule/components/panels/EventPanel.tsx:5`
- `client/app/(app)/comp/[slug]/schedule/data/mockData.ts:2`

---

## 6. Benefits

- **Production builds work**: Both server and client can be built for deployment
- **Type safety restored**: Explicit types prevent future inference drift
- **CI/CD enabled**: Automated testing and deployment pipelines can run
- **Developer clarity**: Clear error messages instead of confusing inference failures
- **Maintainability**: Explicit types serve as documentation for complex queries

---

## 7. Risks & Tradeoffs

### Risks
- **Type definition accuracy**: Manually defined types for Supabase queries must match actual schema
- **Maintenance burden**: Explicit types need updates if database schema changes
- **Breaking changes**: If consumers depend on inferred types, explicit types might differ

### Tradeoffs
- **Verbosity**: More type annotations increase code size
- **Update coupling**: Schema changes require synchronized type updates

### Mitigation
- Use `pnpm db:generate-types` to ensure database types stay in sync
- Add integration tests to catch type/schema mismatches
- Document the relationship between schema and manual type definitions

---

## 8. Migration Plan

### Phase 1: Server Fixes (Low Risk)
1. Add explicit return type to `getUserEventRegistrations`
2. Run `pnpm build` in server package
3. Verify tRPC router types compile
4. Run `pnpm dev:server` to ensure runtime behavior unchanged
5. Commit with message: "fix(server): add explicit return type to getUserEventRegistrations"

### Phase 2: Client Audit (Research)
1. Search client codebase for all uses of `EventType`
2. Determine if it's:
   - Dead code (never used)
   - Should use existing type (e.g., `EntryType`, `EventCategory`)
   - Legitimately missing export from shared
3. Document findings before making changes

### Phase 3: Client Fixes (Medium Risk)
1. Based on audit, either:
   - Remove unused imports (safest)
   - Replace with correct types
   - Add missing export to shared (if semantically correct)
2. Run `pnpm build` in client package
3. Run `pnpm dev:client` to verify UI works
4. Commit with message: "fix(client): resolve missing EventType import"

### Backward Compatibility
- No API changes, only type annotations
- No runtime behavior changes expected
- Existing dev servers continue to work during migration

---

## 9. Test Strategy

### Server Tests
- **Build test**: `cd server && pnpm build` must succeed
- **Runtime test**: `cd server && pnpm dev` must start without errors
- **Type export test**: Verify `AppRouter` type can be imported in client
- **Integration test**: Call `user.getMyRegistrations` endpoint and verify response structure matches type

### Client Tests
- **Build test**: `cd client && pnpm build` must succeed
- **Runtime test**: `cd client && pnpm dev` must start without errors
- **Manual verification**: Navigate to schedule feature, ensure no console errors
- **Type safety test**: Attempt to use removed/changed types in TypeScript, verify compile error

### Shared Tests
- **Build test**: `cd shared && pnpm build` must succeed
- **Export verification**: Ensure all intended types are exported from `index.ts`

---

## 10. Open Questions

1. **EventType intent**: Was `EventType` ever implemented? Is there a stale branch or PR where it existed?
2. **Schedule feature status**: Is the schedule feature actively used, or is it legacy/experimental code?
3. **Type generation**: Should we use Supabase's generated types more directly instead of manual annotations?
4. **Alternative approaches**: Should we use `satisfies` or type assertions instead of explicit return types?

---

## 11. Checklist

### Server
- [ ] Add return type to `getUserEventRegistrations`
- [ ] Verify `appRouter` compiles
- [ ] Verify `userRouter` compiles
- [ ] Run `pnpm build` successfully
- [ ] Run `pnpm dev:server` and verify startup
- [ ] Add integration test for registration endpoint

### Client
- [ ] Audit all uses of `EventType`
- [ ] Document intended usage
- [ ] Remove or replace invalid imports
- [ ] Run `pnpm build` successfully
- [ ] Run `pnpm dev:client` and verify schedule feature
- [ ] Add manual test checklist for schedule UI

### Shared
- [ ] Determine if `EventType` should be added
- [ ] Update exports in `index.ts` if needed
- [ ] Run `pnpm build` successfully

### Documentation
- [ ] Update WARP.md if testing process changes
- [ ] Document relationship between schema and manual types
- [ ] Add to completed refactors after implementation
- [ ] Refresh RAG embeddings

---

## Appendix: Error Details

### Full Server Error Output
```
> @ballroomcompmanager/server@1.0.0 build /Users/samuelellsworth/Documents/Sandbox/ballroomcompmanager/server
> tsc

src/dal/user.ts:48:23 - error TS2742: The inferred type of 'getUserEventRegistrations' cannot be named without a reference to '.pnpm/@supabase+postgrest-js@1.21.4/node_modules/@supabase/postgrest-js/dist/cjs/select-query-parser/utils'. This is likely not portable. A type annotation is necessary.

48 export async function getUserEventRegistrations(
                         ~~~~~~~~~~~~~~~~~~~~~~~~~

src/trpc/router.ts:16:14 - error TS2742: The inferred type of 'appRouter' cannot be named without a reference to '.pnpm/@supabase+postgrest-js@1.21.4/node_modules/@supabase/postgrest-js/dist/cjs/select-query-parser/utils'. This is likely not portable. A type annotation is necessary.

16 export const appRouter = router({
                ~~~~~~~~~

src/trpc/routers/user.ts:8:14 - error TS2742: The inferred type of 'userRouter' cannot be named without a reference to '.pnpm/@supabase+postgrest-js@1.21.4/node_modules/@supabase/postgrest-js/dist/cjs/select-query-parser/utils'. This is likely not portable. A type annotation is necessary.

8 export const userRouter = router({
               ~~~~~~~~~~

Found 3 errors in 3 files.
```

### Full Client Error Output
```
> client@0.1.0 build /Users/samuelellsworth/Documents/Sandbox/ballroomcompmanager/client
> next build --turbopack

   ▲ Next.js 15.5.3 (Turbopack)
   - Environments: .env.local

   Creating an optimized production build ...
 ✓ Finished writing to disk in 537ms

> Build error occurred
Error: Turbopack build failed with 4 errors:
./client/app/(app)/comp/[slug]/schedule/components/panels/EventPanel.tsx:5:1
Export EventType doesn't exist in target module
  3 | import { useState, useEffect } from 'react';
  4 | import { mockEvents } from '../../data/mockData';
> 5 | import { EventType } from '@/../shared/data/enums/eventTypes';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  6 | import { Event, Block } from '../../types';

The export EventType was not found in module [project]/shared/data/enums/eventTypes.ts [app-client] (ecmascript).
Did you mean to import EntryType?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

[Additional similar errors for mockData.ts in both app-client and app-ssr contexts]
```

---

## References
- TypeScript Error TS2742: https://github.com/microsoft/TypeScript/issues/47663
- Supabase Type Safety: https://supabase.com/docs/guides/api/generating-types
- tRPC Type Inference: https://trpc.io/docs/server/infer-types
