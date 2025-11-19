# Refactor Proposal: Type System Unification

## 1. Summary
**Purpose:**  
Unify the dual type system by establishing a clear architecture where domain types are the canonical source of truth, with Zod schemas used exclusively for validation at API boundaries, not as separate type definitions.

**Status:**  
- Proposed

**Owner:**  
- TBD

---

## 2. Motivation
Currently, the codebase has competing type definitions that violate the principle "Shared types define the canonical domain model":

**Pain points:**
- `Competition` interface (domain) vs `CompetitionApi` Zod schema with different field structures
- `Competition` requires `location: Venue` while `CompetitionApi` has `venue: VenueApi.nullable().optional()`
- Confusion about which type to use where - mappers return `Competition` but routers validate with `CompetitionApi`
- Missing exports: `EventRegistrationApi` defined but not exported from `shared/index.ts`
- No documentation (ADR) explaining why two type systems exist

**Technical debt:**
- Type drift between domain and API representations
- Maintenance burden of keeping two type systems in sync
- Violation of WARP.md guideline: "All server → client data must conform exactly to shared types"

---

## 3. Scope
**Modules affected:**
- `shared/`: Type definitions and exports
- `server/src/trpc/`: Router validation
- `server/src/mappers/`: Type annotations

**Types of changes:**
- Clarify architecture: Domain types as source of truth
- Create Zod schemas that mirror domain types (for validation only)
- Update `shared/index.ts` exports
- Document the type system architecture in an ADR

**What is NOT included:**
- Changing the actual field names or structure of domain types
- Modifying database schema
- Client-side code changes (those will happen naturally through type inference)

---

## 4. Current State

### File Structure:
```
shared/
├── data/
│   ├── types/
│   │   ├── competition.ts      // Domain: Competition interface
│   │   ├── event.ts            // Domain: CompEvent interface
│   │   └── registration.ts     // Domain: Registration, EventRegistrationApi
│   └── enums/
└── api/
    └── schemas.ts              // Zod: CompetitionApi, EventApi, VenueApi
```

### Current Issues:
1. **Competition type conflict:**
   - Domain `Competition` has `location: Venue` (required)
   - Zod `CompetitionApi` has `venue: VenueApi.nullable().optional()`
   - Field name mismatch: `location` vs `venue`

2. **Date handling inconsistency:**
   - Domain types use `Date` objects
   - Zod schemas use `.iso.datetime()` which expects strings
   - No clear transformation layer

3. **Missing type exports:**
   - `EventRegistrationApi` defined but not exported
   - Inconsistent export pattern (some Zod schemas exported, some not)

4. **No architectural documentation:**
   - No ADR explaining when to use domain types vs Zod schemas
   - No guidance on where validation should occur

---

## 5. Proposed Changes

### 5.1 Establish Type System Architecture

**Principle:** Domain types are canonical. Zod schemas exist only for validation.

```
┌─────────────────────────────────────────────────────────────┐
│                      SHARED TYPES                           │
│                                                             │
│  Domain Types (TypeScript Interfaces)                      │
│  ├── Competition, CompEvent, Registration, etc.            │
│  └── Source of truth for all type information              │
│                                                             │
│  Zod Schemas (for validation only)                         │
│  ├── CompetitionSchema, CompEventSchema, etc.              │
│  └── Used ONLY at API boundaries for runtime validation    │
└─────────────────────────────────────────────────────────────┘
         │                                │
         ▼                                ▼
    ┌─────────┐                    ┌──────────┐
    │ Server  │                    │  Client  │
    │         │                    │          │
    │ Mappers │◄───────────────────┤  tRPC    │
    │ tRPC    │                    │  Hooks   │
    └─────────┘                    └──────────┘
```

### 5.2 File Changes

#### A. Update `shared/data/types/competition.ts`
```typescript
// Domain type - source of truth
export interface Competition {
  id: string;
  slug: string;
  startDate: Date;
  endDate: Date;
  timeZone: string;
  events: CompEvent[];
  name: string;
  venue: Venue | null; // Unified field name
}

export interface Venue {
  id: string;
  name: string;
  address: Address | null;
  floors?: DanceFloor[];
}
```

#### B. Create `shared/validation/schemas.ts` (new file)
```typescript
import { z } from "zod";
import type { Competition, CompEvent, Venue } from "../data/types";

// Zod schemas mirror domain types but with wire-format transformations
// These are used ONLY for validation at tRPC boundaries

export const VenueSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
}) satisfies z.ZodType<Omit<Venue, 'address' | 'floors'>>; // Partial for API

export const CompetitionSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  startDate: z.string().datetime().transform(str => new Date(str)),
  endDate: z.string().datetime().transform(str => new Date(str)),
  timeZone: z.string(),
  venue: VenueSchema.nullable().optional(),
  events: z.array(z.lazy(() => CompEventSchema)),
}) satisfies z.ZodType<Competition, z.ZodTypeDef, {
  id: string;
  slug: string;
  name: string;
  startDate: string; // Wire format
  endDate: string;   // Wire format
  timeZone: string;
  venue?: VenueSchema | null;
  events: any[];
}>;

// Usage: CompetitionSchema.parse(data) validates and transforms wire format to domain type
```

#### C. Update `shared/index.ts`
```typescript
// Domain types exports (canonical)
export type { User, Participant } from "./data/types/user";
export type { Competition, Venue, Address } from "./data/types/competition";
export type { CompEvent } from "./data/types/event";
export type { 
  Registration,
  EventRegistration,
  EventRegistrationParticipant,
  EventRegistrationEntry,
  EventRegistrationApi // Now exported
} from "./data/types/registration";

// Enums exports
export { CompetitionRole } from "./data/enums/roles";
export { ScoringMethods } from "./data/enums/scoringMethods";
// ... other enums

// Validation schemas (for tRPC use ONLY)
export {
  CompetitionSchema,
  CompEventSchema,
  VenueSchema,
  EventRegistrationSchema,
} from "./validation/schemas";

// Legacy API schemas (deprecated, for migration period)
export {
  CompetitionApi,
  EventApi,
  VenueApi,
} from "./api/schemas";
```

#### D. Update `shared/api/schemas.ts`
Add deprecation comments:
```typescript
/**
 * @deprecated Use CompetitionSchema from validation/schemas.ts instead
 * This will be removed in next major version
 */
export const CompetitionApi = z.object({ ... });
```

#### E. Create ADR document: `rag/design/architecture/adr-001-type-system-architecture.md`
Document:
- Domain types are canonical
- Zod schemas used only for validation at boundaries
- Transformation happens at mapper layer
- Wire format vs domain format distinction

---

## 6. Benefits

1. **Single source of truth:** Domain types are clearly canonical
2. **Clearer architecture:** Separation between domain model and validation
3. **Better type safety:** Zod schemas can use `satisfies` to ensure they match domain types
4. **Reduced duplication:** One type definition, one validation schema
5. **Improved maintainability:** Changes to domain types can be validated against schemas at compile time
6. **Documentation:** ADR provides clear guidance for future development

---

## 7. Risks & Tradeoffs

**Risks:**
- Migration effort across multiple files
- Temporary dual-system during migration period
- Need to update all tRPC routers to use new schemas

**Tradeoffs:**
- Slightly more verbose schema definitions with `satisfies` constraint
- Need to maintain transformation logic (wire format ↔ domain format)
- Learning curve for developers unfamiliar with this pattern

**Mitigation:**
- Keep deprecated exports during migration period
- Create clear migration guide
- Update one module at a time (competition → event → registration)

---

## 8. Migration Plan

### Phase 1: Foundation (Week 1)
1. Create `shared/validation/schemas.ts`
2. Define `CompetitionSchema`, `VenueSchema` with proper transformations
3. Write ADR-001
4. Update `shared/index.ts` exports

### Phase 2: Server Migration (Week 2)
1. Update competition router to use `CompetitionSchema`
2. Update competition mappers to return proper domain types
3. Add integration tests
4. Verify client still works (types should flow through automatically)

### Phase 3: Expand Coverage (Week 3)
1. Create `CompEventSchema`, `EventRegistrationSchema`
2. Update event router
3. Update registration router
4. Add validation tests

### Phase 4: Cleanup (Week 4)
1. Remove deprecated `CompetitionApi`, etc. from `api/schemas.ts`
2. Update all documentation
3. Refresh RAG embeddings

### Backward Compatibility:
- Keep old exports for one release cycle
- Add deprecation warnings
- Provide migration guide in ADR

---

## 9. Test Strategy

### Unit Tests:
```typescript
// Test that Zod schemas properly validate domain types
describe('CompetitionSchema', () => {
  it('should validate valid competition data', () => {
    const wireFormat = {
      id: uuid(),
      slug: 'comp-2025',
      name: 'Test Competition',
      startDate: '2025-01-01T00:00:00Z',
      endDate: '2025-01-02T00:00:00Z',
      timeZone: 'America/New_York',
      venue: null,
      events: [],
    };
    
    const result: Competition = CompetitionSchema.parse(wireFormat);
    expect(result.startDate).toBeInstanceOf(Date);
  });
  
  it('should reject invalid data', () => {
    expect(() => CompetitionSchema.parse({ id: 'invalid' })).toThrow();
  });
});
```

### Integration Tests:
- Test tRPC endpoints return proper domain types
- Test mappers output validates against schemas
- Test client receives properly typed data

### Type Tests:
```typescript
// Compile-time validation that schemas match domain types
type TestCompetitionSchema = z.infer<typeof CompetitionSchema> extends Competition ? true : false;
const test: TestCompetitionSchema = true; // Should compile
```

---

## 10. Open Questions

1. **Q:** Should we use `.transform()` or `.pipe()` for date transformations?
   - **A:** TBD - benchmark performance, consider error handling

2. **Q:** How do we handle partial updates (PATCH operations)?
   - **A:** Create separate `CompetitionUpdateSchema` that makes fields optional

3. **Q:** Should validation schemas live in `shared/validation/` or `shared/api/validation/`?
   - **A:** Proposed: `shared/validation/` to keep it simple

4. **Q:** Do we need separate schemas for input vs output?
   - **A:** Evaluate per-endpoint - some may need different validation rules

---

## 11. Checklist
- [ ] Create `shared/validation/schemas.ts`
- [ ] Define CompetitionSchema, VenueSchema with transformations
- [ ] Create ADR-001 document
- [ ] Update `shared/index.ts` exports
- [ ] Update competition router to use new schemas
- [ ] Update competition mappers
- [ ] Write unit tests for schemas
- [ ] Write integration tests for competition endpoints
- [ ] Create schemas for Event, Registration
- [ ] Update remaining routers
- [ ] Deprecate old API schemas
- [ ] Update all documentation
- [ ] RAG embeddings refreshed
