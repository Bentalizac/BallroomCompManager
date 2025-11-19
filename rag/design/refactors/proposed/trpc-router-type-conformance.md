# Refactor Proposal: tRPC Router Type Conformance

## 1. Summary
**Purpose:**  
Ensure all tRPC router endpoints return data that conforms to shared domain types, eliminating ad-hoc return objects that violate the type contract.

**Status:**  
- Proposed

**Owner:**  
- TBD

**Dependencies:**
- Should be implemented after "Type System Unification" proposal is approved

---

## 2. Motivation
Multiple tRPC router endpoints return ad-hoc object literals that don't conform to shared types, violating the WARP.md principle: "All server → client data must conform exactly to shared types."

**Pain points:**
- **Competition router** (`create`, `update`): Returns objects with snake_case database fields instead of domain types
  ```typescript
  return {
    id: competition.id,
    slug: competition.slug,
    startDate: competition.start_date, // Inconsistent casing
    // ... incomplete object
  };
  ```
- **Multiple routers**: Return `{ success: true }` ad-hoc type not defined in shared
- **Field naming inconsistency**: Mixing database field names (snake_case) with domain field names (camelCase)
- **Incomplete type information**: Client has no type information for these return values

**Technical debt:**
- Type safety breaks at router boundaries
- Client-side type inference fails for these endpoints
- Difficult to refactor - no compiler errors when domain types change
- Maintenance burden - multiple representations of same data

---

## 3. Scope
**Modules affected:**
- `server/src/trpc/routers/competition.ts`
- `server/src/trpc/routers/event.ts`
- `shared/data/types/` (may need new types for operation responses)

**Types of changes:**
- Define shared types for all operation responses
- Update router return statements to use mappers that produce domain types
- Standardize success/error response patterns

**What is NOT included:**
- Changing input validation (handled separately)
- Database layer changes
- Client-side code (benefits automatically from proper types)

---

## 4. Current State

### Violations Identified:

#### A. Competition Router - `create` mutation (lines 305-313)
```typescript
return {
  id: competition.id,
  slug: competition.slug,
  name: competition.name,
  startDate: competition.start_date,    // Database field name
  endDate: competition.end_date,        // Database field name
  timeZone: competition.time_zone,      // Database field name
  venueId: competition.venue_id,        // Database field name
};
```
**Issue:** Returns raw database row structure, not domain type

#### B. Competition Router - `update` mutation (lines 405-412)
```typescript
return {
  id: competition.id,
  name: competition.name,
  startDate: competition.start_date,
  endDate: competition.end_date,
  timeZone: competition.time_zone,
  venueId: competition.venue_id,
};
```
**Issue:** Same as above, incomplete domain type

#### C. Competition Router - `delete` mutation (line 462)
```typescript
return { success: true };
```
**Issue:** Ad-hoc type not defined in shared

#### D. Event Router - Multiple mutations
- `removeParticipant` (line 213): `return { success: true };`
- `cancelEventRegistration` (line 312): `return { success: true };`
- `delete` (line 627): `return { success: true };`
**Issue:** Same ad-hoc success type

### Correct Patterns (for reference):
```typescript
// competition.ts - getAll (lines 36-39)
return z.array(CompetitionApi).parse(
  competitions.map(mapCompetitionRowToDTO)
);

// competition.ts - getById (line 66)
return CompetitionApi.parse(mapCompetitionRowToDTO(competition));
```

---

## 5. Proposed Changes

### 5.1 Define Shared Operation Response Types

Create `shared/data/types/operations.ts`:
```typescript
/**
 * Standard response type for mutation operations
 */
export interface OperationSuccess {
  success: true;
}

/**
 * Response type for create operations
 * Generic to work with any entity type
 */
export interface CreateResponse<T> {
  created: T;
}

/**
 * Response type for update operations
 */
export interface UpdateResponse<T> {
  updated: T;
}

/**
 * Response type for delete operations
 */
export interface DeleteResponse {
  success: true;
  deletedId: string;
}
```

Export from `shared/index.ts`:
```typescript
export type { 
  OperationSuccess, 
  CreateResponse, 
  UpdateResponse, 
  DeleteResponse 
} from "./data/types/operations";
```

### 5.2 Update Competition Router

#### A. Create mutation (lines 193-325)
**Before:**
```typescript
return {
  id: competition.id,
  slug: competition.slug,
  name: competition.name,
  startDate: competition.start_date,
  // ...
};
```

**After:**
```typescript
// Fetch the full competition with related data
const { data: fullCompetition, error: fetchError } = 
  await CompetitionDAL.getCompetitionById(supabase, competition.id);

if (fetchError || !fullCompetition) {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Competition created but failed to fetch full details",
  });
}

// Return domain type through mapper
return CompetitionSchema.parse(
  mapCompetitionRowToDTO(fullCompetition)
);
```

#### B. Update mutation (lines 327-424)
**After:**
```typescript
// After successful update, fetch full competition
const { data: fullCompetition, error: fetchError } = 
  await CompetitionDAL.getCompetitionById(supabase, input.id);

if (fetchError || !fullCompetition) {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Competition updated but failed to fetch full details",
  });
}

return CompetitionSchema.parse(
  mapCompetitionRowToDTO(fullCompetition)
);
```

#### C. Delete mutation (lines 426-474)
**After:**
```typescript
const deletedId = input.id;

const { error } = await CompetitionDAL.deleteCompetition(
  supabase,
  deletedId,
);

if (error) {
  // ... error handling
}

return { 
  success: true as const, 
  deletedId 
} satisfies DeleteResponse;
```

### 5.3 Update Event Router

Similar pattern for all success-only responses:

```typescript
// Before
return { success: true };

// After
import type { OperationSuccess } from "@ballroomcompmanager/shared";

return { success: true as const } satisfies OperationSuccess;
```

### 5.4 Create Validation Schemas

In `shared/validation/schemas.ts`:
```typescript
export const OperationSuccessSchema = z.object({
  success: z.literal(true),
});

export const DeleteResponseSchema = z.object({
  success: z.literal(true),
  deletedId: z.string().uuid(),
});

// For generic create/update responses
export const createResponseSchema = <T extends z.ZodType>(schema: T) =>
  z.object({
    created: schema,
  });

export const updateResponseSchema = <T extends z.ZodType>(schema: T) =>
  z.object({
    updated: schema,
  });
```

---

## 6. Benefits

1. **End-to-end type safety:** Client code gets proper type inference for all endpoints
2. **Consistency:** All endpoints follow same patterns
3. **Maintainability:** Compiler catches breaking changes to domain types
4. **Completeness:** Full entity data returned, not partial projections
5. **Documentation:** Types serve as API documentation
6. **Refactoring safety:** Future changes to domain types automatically propagate

---

## 7. Risks & Tradeoffs

**Risks:**
- **Performance concern:** Fetching full entity after create/update adds extra database query
- **Over-fetching:** Client may not need all fields in mutation responses
- **Breaking changes:** Client code expecting old response shape will break

**Tradeoffs:**
- More database queries (create/update require additional SELECT)
- Slightly more verbose code
- May need to handle cases where refetch fails

**Mitigation:**
- **Performance:** Profile to ensure overhead is acceptable; consider SELECT RETURNING with joins
- **Over-fetching:** Document that clients can ignore unneeded fields; consider GraphQL-style field selection in future
- **Breaking changes:** Version the API or coordinate deployment with client updates

---

## 8. Migration Plan

### Phase 1: Define Shared Types (Day 1)
1. Create `shared/data/types/operations.ts`
2. Create validation schemas in `shared/validation/schemas.ts`
3. Update `shared/index.ts` exports

### Phase 2: Update Competition Router (Day 2)
1. Update `create` mutation
2. Update `update` mutation  
3. Update `delete` mutation
4. Add unit tests for new response shapes
5. Update integration tests

### Phase 3: Update Event Router (Day 3)
1. Update all mutations returning `{ success: true }`
2. Consider if any should return full entities instead
3. Add tests

### Phase 4: Update Remaining Routers (Day 4)
1. Audit all other routers (user, data, etc.)
2. Apply same patterns
3. Comprehensive test suite

### Phase 5: Client Migration (Day 5)
1. Update client code to use new response types
2. Remove any type assertions or workarounds
3. Verify all pages still work

### Backward Compatibility:
- **Option 1:** Breaking change - coordinate server/client deployment
- **Option 2:** Versioned routes - keep old endpoints until client migrated
- **Recommended:** Breaking change with coordinated deployment (small codebase, single team)

---

## 9. Test Strategy

### Unit Tests:
```typescript
describe('competition.create', () => {
  it('should return full Competition domain type', async () => {
    const result = await caller.competition.create({
      name: 'Test Comp',
      startDate: '2025-01-01',
      endDate: '2025-01-02',
      timeZone: 'UTC',
    });
    
    // Type assertion - should compile
    const comp: Competition = result;
    
    expect(result).toMatchObject({
      id: expect.any(String),
      slug: expect.any(String),
      name: 'Test Comp',
      startDate: expect.any(Date),
      endDate: expect.any(Date),
      timeZone: 'UTC',
      venue: null,
      events: expect.any(Array),
    });
  });
});

describe('competition.delete', () => {
  it('should return DeleteResponse', async () => {
    const result = await caller.competition.delete({ id: testId });
    
    const deleteResp: DeleteResponse = result; // Should compile
    
    expect(result).toEqual({
      success: true,
      deletedId: testId,
    });
  });
});
```

### Integration Tests:
```typescript
describe('tRPC endpoint type conformance', () => {
  it('all mutation responses should match shared types', async () => {
    // Use TypeScript compiler API to validate
    // or runtime schema validation
    const response = await caller.competition.create({ ... });
    expect(() => CompetitionSchema.parse(response)).not.toThrow();
  });
});
```

### Type Tests:
```typescript
// Compile-time tests
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from './router';

type RouterOutput = inferRouterOutputs<AppRouter>;

// Should compile - verifies return types match domain types
type CreateOutput = RouterOutput['competition']['create'] extends Competition ? true : false;
type DeleteOutput = RouterOutput['competition']['delete'] extends DeleteResponse ? true : false;

const test1: CreateOutput = true;
const test2: DeleteOutput = true;
```

---

## 10. Open Questions

1. **Q:** Should we optimize the extra query for create/update by using PostgreSQL RETURNING with joins?
   - **A:** Investigate Supabase support for complex RETURNING clauses

2. **Q:** Do all mutations need to return full entities, or is `{ success: true }` acceptable for some?
   - **A:** Proposed: Deletes can return DeleteResponse with ID; creates/updates should return full entity

3. **Q:** Should we add a `updatedFields` array to UpdateResponse to indicate what changed?
   - **A:** Consider for future enhancement, not MVP

4. **Q:** How do we handle mutations that affect multiple entities (e.g., bulk operations)?
   - **A:** Define BatchOperationResponse type when needed

---

## 11. Checklist
- [ ] Create `shared/data/types/operations.ts`
- [ ] Define OperationSuccess, CreateResponse, UpdateResponse, DeleteResponse types
- [ ] Create validation schemas for operation responses
- [ ] Update `shared/index.ts` exports
- [ ] Update competition.create to return Competition
- [ ] Update competition.update to return Competition
- [ ] Update competition.delete to return DeleteResponse
- [ ] Update event router mutations to use OperationSuccess
- [ ] Write unit tests for all updated endpoints
- [ ] Write integration tests verifying type conformance
- [ ] Add TypeScript compile-time type tests
- [ ] Update client code to use new response types
- [ ] Update API documentation
- [ ] RAG embeddings refreshed
