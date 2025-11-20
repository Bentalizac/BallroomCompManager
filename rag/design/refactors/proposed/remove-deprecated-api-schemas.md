# Refactor Proposal: Remove Deprecated API Schemas

## 1. Summary
**Purpose:**  
Remove deprecated Zod schemas (`CompetitionApi`, `EventApi`, `VenueApi`) from `shared/api/schemas.ts` after all routers and mappers have migrated to the new type system architecture defined in ADR-004.

**Status:**  
- Proposed (Blocked: awaiting Phase 3 migration of remaining routers)

**Owner:**  
- TBD

**Dependencies:**
- Type System Unification refactor (Phases 1 & 2: ✅ Complete)
- Event router migration (Phase 3: Pending)
- Registration router migration (Phase 3: Pending)

---

## 2. Motivation
As part of the Type System Unification refactor (ADR-004), we established domain types as the canonical source of truth and created new validation schemas in `server/src/validation/schemas.ts`. The legacy schemas in `shared/api/schemas.ts` are now deprecated and marked for removal.

**Why remove them:**
- Prevent confusion about which schemas to use
- Reduce maintenance burden
- Enforce architectural principle: validation schemas belong in server, not shared
- Clean up technical debt from dual type system

**Current state:**
- `CompetitionApi`, `EventApi`, `VenueApi` marked as `@deprecated`
- Competition router migrated to use domain types (✅)
- Event and Registration routers still use deprecated schemas (❌)
- Client may still import deprecated schemas (needs verification)

---

## 3. Scope
**Modules affected:**
- `shared/api/schemas.ts` - Remove deprecated exports
- `shared/index.ts` - Remove deprecated exports
- `server/src/trpc/routers/event.ts` - Migrate to domain types
- `server/src/trpc/routers/registration.ts` - Migrate to domain types (if applicable)
- Any client code importing deprecated schemas

**Types of changes:**
- Delete deprecated schema definitions
- Update router imports
- Update router output types
- Verify no client dependencies

**What is NOT included:**
- Creating new schemas (already done in Phase 1)
- Domain type changes (already done in Phase 1)
- Database migrations (separate proposal)

---

## 4. Current State

### Deprecated Schemas in `shared/api/schemas.ts`:

```typescript
/**
 * @deprecated Use VenueSchema from server/src/validation/schemas.ts instead.
 */
export const VenueApi = z.object({ ... });

/**
 * @deprecated Use CompEventSchema from server/src/validation/schemas.ts instead.
 */
export const EventApi = z.object({ ... });

/**
 * @deprecated Use CompetitionSchema from server/src/validation/schemas.ts instead.
 */
export const CompetitionApi = z.object({ ... });
```

### Migration Status:

| Router | Status | Notes |
|--------|--------|-------|
| Competition | ✅ Migrated | Returns `Competition` domain type |
| Event | ❌ Not migrated | Likely uses `EventApi` |
| Registration | ❌ Not migrated | May use event-related schemas |
| User | ⚠️ Unknown | Need to verify |

### Export Locations:

1. `shared/api/schemas.ts` - Original definitions
2. `shared/index.ts` - Re-exported to rest of application

---

## 5. Proposed Changes

### 5.1 Phase 3: Migrate Remaining Routers

Before removing schemas, migrate all remaining routers:

#### Event Router Migration

```typescript
// OLD
import { EventApi } from "@ballroomcompmanager/shared";
return EventApi.parse(mappedEvent);

// NEW
import type { CompEvent } from "@ballroomcompmanager/shared";
import { CompEventSchema } from "../validation/schemas";
const event: CompEvent = mapEventRowEnrichedToCompEvent(row);
return event;
```

#### Registration Router Migration

Check if registration router uses any deprecated schemas and migrate similarly.

### 5.2 Verify No Client Usage

```bash
# Search client code for deprecated imports
cd client
grep -r "CompetitionApi\|EventApi\|VenueApi" --include="*.ts" --include="*.tsx"
```

If client imports found:
- Remove imports (client should use domain types from tRPC inference)
- Update type annotations to use domain types

### 5.3 Remove Deprecated Schemas

#### Step 1: Remove from `shared/api/schemas.ts`

```typescript
// DELETE these exports:
// export const VenueApi = ...
// export const EventApi = ...
// export const CompetitionApi = ...
// export type VenueApi = ...
// export type EventApi = ...
// export type CompetitionApi = ...
```

Keep non-deprecated schemas:
- `EventStatus` enum (still used)
- `getCompetitionInfoSchema` (request schemas are fine in shared)
- `createCompetitionSchema`
- etc.

#### Step 2: Remove from `shared/index.ts`

```typescript
// DELETE from shared/index.ts:
export {
  CompetitionApi,  // Remove
  EventApi,        // Remove
  VenueApi,        // Remove
  // Keep these:
  EventStatus,
  registerForCompSchema,
  createCompetitionSchema,
  getCompetitionInfoSchema,
  createEventSchema,
  getEventInfoSchema,
  type EventStatus as EventStatusType,
} from "./api/schemas";
```

### 5.4 Final Verification

```bash
# Rebuild all packages
cd shared && pnpm build
cd ../server && pnpm build
cd ../client && pnpm build

# Run type check
pnpm --filter @ballroomcompmanager/server tsc --noEmit
pnpm --filter @ballroomcompmanager/client tsc --noEmit
```

---

## 6. Benefits

1. **Architectural clarity**: Single location for validation schemas (server only)
2. **Reduced confusion**: No ambiguity about which schemas to use
3. **Cleaner codebase**: Remove deprecated code and comments
4. **Enforced patterns**: Impossible to use old dual-type system
5. **Smaller shared package**: Less code for client to import

---

## 7. Risks & Tradeoffs

**Risks:**
- Breaking change if any code still depends on deprecated schemas
- Need to coordinate removal with all router migrations
- Client may have hidden dependencies

**Tradeoffs:**
- Must complete Phase 3 migrations first (can't remove until all routers migrated)
- One-time migration effort for remaining routers
- Temporary deprecation period needed for safety

**Mitigation:**
- Keep deprecation warnings for at least one release cycle
- Comprehensive search for usage before removal
- Test all routers after migration
- Document migration in changelog

---

## 8. Migration Plan

### Prerequisites:
- [ ] Phase 3: Migrate event router
- [ ] Phase 3: Migrate registration router (if needed)
- [ ] Verify no other routers use deprecated schemas
- [ ] Search client code for usage

### Phase 1: Pre-removal Audit (Week 1)
1. Search all TypeScript files for deprecated schema usage:
   ```bash
   grep -r "CompetitionApi\|EventApi\|VenueApi" server/ client/ --include="*.ts" --include="*.tsx"
   ```
2. Document all findings
3. Create migration plan for each usage
4. Verify deprecation warnings are visible

### Phase 2: Migrate Remaining Code (Week 2)
1. Migrate event router to use `CompEvent` domain type
2. Migrate registration router (if needed)
3. Update any client imports to use domain types
4. Test all affected endpoints
5. Verify tRPC type inference still works

### Phase 3: Removal (Week 3)
1. Remove deprecated schemas from `shared/api/schemas.ts`
2. Remove deprecated exports from `shared/index.ts`
3. Build all packages to verify no errors
4. Run full test suite
5. Update changelog with breaking change notice

### Phase 4: Verification (Week 3-4)
1. Manual testing of all affected endpoints
2. Verify client receives correct types
3. Check that no TypeScript errors in any package
4. Deploy to staging for integration testing

### Rollback Plan:
If issues discovered:
1. Restore deleted schema definitions
2. Restore exports
3. Investigate breaking change
4. Fix issue before attempting removal again

---

## 9. Test Strategy

### Pre-removal Tests:
```bash
# Verify no usage of deprecated schemas
npm run lint
npm run typecheck

# Search for any lingering imports
grep -r "from.*api/schemas" server/src/ client/src/
grep -r "CompetitionApi\|EventApi\|VenueApi" server/src/ client/src/
```

### Post-removal Tests:
```bash
# All packages must build
pnpm build

# Type checking must pass
pnpm --filter @ballroomcompmanager/server tsc --noEmit
pnpm --filter @ballroomcompmanager/client tsc --noEmit
pnpm --filter @ballroomcompmanager/shared tsc --noEmit

# Run any existing tests
pnpm test
```

### Integration Tests:
- Test all competition endpoints
- Test all event endpoints
- Test all registration endpoints
- Verify client receives correct types from tRPC
- Verify no runtime errors

---

## 10. Open Questions

1. **Q:** Are there any other routers beyond competition, event, and registration?
   - **A:** Need to audit `server/src/trpc/routers/` directory

2. **Q:** Does client directly import any schemas for client-side validation?
   - **A:** Search client code - if yes, migrate to local validation or remove

3. **Q:** Should we keep request schemas (createCompetition, etc.) in shared?
   - **A:** Yes - input validation schemas can live in shared, only response schemas moved to server

4. **Q:** Timeline for Phase 3 router migrations?
   - **A:** TBD - depends on priority and complexity of event/registration routers

5. **Q:** Do we need a feature flag for gradual rollout?
   - **A:** Unlikely needed - schema removal is internal refactor, not user-facing change

---

## 11. Checklist

### Prerequisites:
- [ ] Event router migrated to domain types
- [ ] Registration router verified/migrated
- [ ] Client code audit complete
- [ ] No usages of deprecated schemas found

### Implementation:
- [ ] Remove schema definitions from `shared/api/schemas.ts`
- [ ] Remove exports from `shared/index.ts`
- [ ] Update CHANGELOG.md with breaking change notice
- [ ] Build all packages successfully
- [ ] All type checks pass

### Testing:
- [ ] Manual testing of all endpoints
- [ ] Integration tests pass
- [ ] Client builds and runs
- [ ] Staging deployment successful

### Documentation:
- [ ] Update ADR-004 with removal completion
- [ ] Update type-system-unification refactor doc to "Completed"
- [ ] Update migration guide if needed
- [ ] RAG embeddings refreshed

---

## 12. Success Criteria

1. ✅ No TypeScript errors in any package
2. ✅ All routers return domain types
3. ✅ Client receives correct types via tRPC
4. ✅ No deprecation warnings
5. ✅ `shared/api/schemas.ts` contains only non-deprecated schemas
6. ✅ All tests pass
7. ✅ Type system unification refactor marked as "Completed"

---

## Related Documents

- `rag/design/architecture/adr-004-type-system-architecture.md`
- `rag/design/refactors/approved/type-system-unification.md`
- `server/src/validation/schemas.ts` (new validation schemas)
