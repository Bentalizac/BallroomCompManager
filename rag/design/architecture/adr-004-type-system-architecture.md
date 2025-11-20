# Architecture Decision Record (ADR)

## 1. Title
Type System Architecture: Domain Types as Source of Truth with Server-Side Validation

## 2. Status
- ✅ **Accepted** (Implemented 2025-11-19)

## 3. Context
BallroomCompManager requires end-to-end type safety from database to UI while maintaining clear separation of concerns. Prior to this decision, the codebase had competing type definitions:

**Current architecture limitations:**
- `Competition` interface (domain) vs `CompetitionApi` Zod schema with different field structures
- Domain `Competition` has `location: Venue` while `CompetitionApi` has `venue: VenueApi.nullable().optional()`
- Confusion about which type to use where - mappers return `Competition` but routers validate with `CompetitionApi`
- No clear documentation on when to use domain types vs Zod schemas

**Team goals:**
- Maintain end-to-end type safety from database to UI
- Clear separation between domain model and API validation
- Single source of truth for type definitions
- Minimize maintenance burden

**External requirements:**
- TypeScript for all code
- tRPC for type-safe API communication
- Zod for runtime validation at API boundaries

---

## 4. Decision

**Domain types (TypeScript interfaces in `shared/`) are the canonical source of truth for all type information.**

Zod schemas exist ONLY in `server/src/validation/` for runtime validation at API boundaries. They are NOT exported from `shared/` and are NOT used by the client.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   SHARED PACKAGE                            │
│                                                             │
│  Domain Types (TypeScript Interfaces)                      │
│  ├── Competition, CompEvent, Registration, etc.            │
│  └── Source of truth for all type information              │
└─────────────────────────────────────────────────────────────┘
         │                                │
         ▼                                ▼
    ┌─────────┐                    ┌──────────┐
    │ Server  │                    │  Client  │
    │         │                    │          │
    │ Zod     │                    │  tRPC    │
    │ Schemas │                    │  (typed  │
    │ Mappers │◄───────────────────┤  domain  │
    │ tRPC    │                    │  objects)│
    └─────────┘                    └──────────┘
```

### Key Principles

1. **Domain types are canonical**: All shared types live in `shared/data/types/` and define the domain model
2. **Zod schemas for validation only**: Schemas in `server/src/validation/` validate wire format and transform to domain types
3. **Server-side validation**: Only the server needs Zod schemas for API boundary validation
4. **Client gets typed objects**: Client receives fully-typed domain objects through tRPC's type inference
5. **Wire format transformation**: Schemas handle transformations (e.g., ISO date strings → Date objects)

### Type Flow

```
Database → DAL → Mapper → Domain Type → tRPC → Client
                            ↑
                            │
                      Zod Schema validates
                      wire format input
```

---

## 5. Alternatives Considered

### Option A: Dual Type System (Previous Approach)
**Pros:**
- Zod schemas can generate TypeScript types automatically
- Single definition for both type and validation

**Cons:**
- Leads to type drift between domain and API representations
- Confusion about which type to use where
- Violates "domain types are canonical" principle
- Maintenance burden of keeping two type systems in sync
- Field name mismatches (e.g., `location` vs `venue`)

**Why rejected:** Violated architectural principles and caused maintainability issues

### Option B: Zod as Single Source of Truth
**Pros:**
- Single definition
- Runtime validation automatically aligned with types

**Cons:**
- Ties domain model to Zod library
- Client would need Zod dependency just for types
- Domain types become implementation details rather than first-class citizens
- Harder to reason about domain model separately from validation

**Why rejected:** Domain model should be independent of validation library

### Option C: Schemas in Shared Package
**Pros:**
- Could be imported by both client and server
- Centralized validation logic

**Cons:**
- Client doesn't need Zod schemas (gets typed objects from tRPC)
- Adds unnecessary dependency to shared package
- Couples validation logic to domain model

**Why rejected:** Server is the only consumer of validation schemas

### Option D: Chosen Approach - Domain Types + Server-Side Schemas
**Pros:**
- Clear separation: domain model vs validation
- Single source of truth (domain types)
- Server-only validation keeps concerns separated
- Client gets clean typed interfaces without validation dependencies
- Wire format transformations handled explicitly

**Cons:**
- Slightly more verbose (maintain both type and schema)
- Need to keep schemas aligned with domain types (mitigated by TypeScript checking)

**Why chosen:** Best balance of type safety, maintainability, and architectural clarity

---

## 6. Consequences

### Positive Effects

1. **Single source of truth**: Domain types clearly define the canonical data model
2. **Clearer architecture**: Explicit separation between domain model and API validation
3. **Better type safety**: TypeScript ensures schemas produce domain-conforming types
4. **Reduced coupling**: Client doesn't depend on validation library
5. **Explicit transformations**: Wire format → domain format transformations are clear and documented
6. **Improved maintainability**: Changes to domain types can be validated against schemas at compile time
7. **Better documentation**: Type definitions serve as primary documentation

### Tradeoffs

1. **Maintenance**: Must keep Zod schemas aligned with domain types (mitigated by type assertions)
2. **Verbosity**: Slightly more code (type + schema vs just schema)
3. **Learning curve**: Developers must understand the distinction between domain types and validation schemas
4. **Migration effort**: Existing code using `CompetitionApi` must migrate to domain `Competition` type

### Impact on Future Development

- **Adding new types**: Define domain type first, then create validation schema if needed
- **Modifying types**: Update domain type, then update schema (TypeScript will catch mismatches)
- **API endpoints**: Always return domain types, never Zod-inferred types
- **Client code**: Import types from `@ballroomcompmanager/shared`, never from validation schemas

---

## 7. Implementation Notes

### Files Affected

**Created:**
- `server/src/validation/schemas.ts` - Zod validation schemas with wire format transformations

**Modified:**
- `shared/data/types/competition.ts` - Updated `location` → `venue` field name, made nullable
- `shared/api/schemas.ts` - Added deprecation warnings to legacy `CompetitionApi`, `EventApi`, `VenueApi`
- `rag/design/refactors/approved/type-system-unification.md` - Updated with architecture refinement

**To be modified (future phases):**
- `server/src/trpc/routers/*` - Migrate from `CompetitionApi` to `CompetitionSchema`
- `server/src/mappers/*` - Ensure all return types are domain types

### Migration Pattern

```typescript
// OLD (deprecated)
import { CompetitionApi } from "@ballroomcompmanager/shared";
const competition: z.infer<typeof CompetitionApi> = CompetitionApi.parse(data);

// NEW (correct)
import type { Competition } from "@ballroomcompmanager/shared";
import { CompetitionSchema } from "../validation/schemas";
const competition: Competition = CompetitionSchema.parse(data);
```

### Wire Format Transformations

Zod schemas handle these transformations:
- ISO date strings (`"2025-01-01T00:00:00Z"`) → `Date` objects
- Partial venue data (id, name, city, state) → `Venue` type (nullable)
- UUID validation for all ID fields
- Recursive validation of nested types (events array)

---

## 8. Related Decisions

- **ADR-001**: Adopt Monorepo Architecture with Domain-Driven Design for Shared Types
- **ADR-002**: tRPC Modular Structure
- **Refactor Proposal**: Type System Unification (`rag/design/refactors/approved/type-system-unification.md`)

---

## 9. Open Questions

None - all architectural questions resolved during implementation.

---

## 10. Checklist
- [x] Team agrees on decision (approved via refactor proposal)
- [x] Documentation created (this ADR)
- [x] Validation schemas implemented
- [x] Domain types updated
- [ ] RAG embeddings refreshed (pending)
- [ ] Router migration (Phase 2)
- [ ] Mapper verification (Phase 2)
