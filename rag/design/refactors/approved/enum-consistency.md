# Refactor Proposal: Enum Consistency

## 1. Summary
**Purpose:**  
Eliminate hardcoded enum values in tRPC routers and other server code, replacing them with imports from shared enum definitions to prevent role/status drift and maintain single source of truth.

**Status:**  
- Approved

**Owner:**  
- Eli

**Dependencies:**
- None (can be implemented independently)

---

## 2. Motivation
Current code hardcodes enum values in validation schemas instead of referencing shared enum definitions, violating the DRY principle and risking drift between different parts of the codebase.

**Pain points:**
- **Event router** hardcodes role values: `"competitor"`, `"judge"`, `"scrutineer"`, `"lead"`, `"follow"`, `"coach"`, `"member"`
- These values duplicated from `shared/data/enums/eventRoles.ts`
- Risk of typos (e.g., `"Judge"` vs `"judge"`)
- No compile-time verification that router accepts all valid enum values
- Changes to enum definitions don't propagate to validation schemas

**Current violation:**
```typescript
// server/src/trpc/routers/event.ts (lines 26-34)
role: z.enum([
  "competitor",
  "judge", 
  "scrutineer",
  "lead",
  "follow",
  "coach",
  "member",
])
```

**WARP.md violation:**
- "Role Enums: Consistent enum-based roles prevent 'Judge' vs 'judge' drift"
- "Shared types define the canonical domain model"

---

## 3. Scope
**Modules affected:**
- `server/src/trpc/routers/event.ts` - Event registration roles
- `server/src/trpc/routers/competition.ts` - Competition participant roles
- `shared/data/enums/` - May need utility functions
- Any other files with hardcoded status/role strings

**Types of changes:**
- Replace hardcoded z.enum() with references to shared enums
- Create Zod enum helpers if needed
- Audit codebase for other hardcoded enum values
- Document pattern for future development

**What is NOT included:**
- Changing enum values themselves
- Database enum type updates
- Adding new roles or statuses

---

## 4. Current State

### Violations Identified:

#### A. Event Router - Registration Roles
**File:** `server/src/trpc/routers/event.ts`

**Lines 26-34:** `registerForEvent` input schema
```typescript
role: z.enum([
  "competitor",
  "judge", 
  "scrutineer",
  "lead",
  "follow",
  "coach",
  "member",
])
```

**Lines 104-106:** `createRegistration` input schema
```typescript
role: z
  .enum(["lead", "follow", "coach", "member"])
  .default("member"),
```

**Issue:** Hardcoded values don't reference `EventRoles` or registration-specific role types from shared

#### B. Shared Enum Definitions
**File:** `shared/data/enums/eventRoles.ts`

```typescript
export const CompRoles = ["competitor", "judge", "scrutineer", "organizer"] as const;
export type CompRoles = (typeof CompRoles)[number];

export const EventRoles = ["competitor", "judge", "scrutineer"] as const;
export type EventRoles = (typeof EventRoles)[number];
```

**Issue:** These don't include registration-specific roles like "lead", "follow", "coach", "member"

#### C. Registration Types
**File:** `shared/data/types/registration.ts`

```typescript
export interface EventRegistrationParticipant {
  registrationId: string;
  userId: string;
  role: 'lead' | 'follow' | 'coach' | 'member'; // Inline union, not enum
}
```

**Issue:** Role type is inline union, not referencing shared enum

---

## 5. Proposed Changes

### 5.1 Define Missing Enums

Update `shared/data/enums/eventRoles.ts`:

```typescript
/**
 * Competition-level participant roles
 * Roles assigned at the competition level for access control
 */
export const CompRoles = ["competitor", "judge", "scrutineer", "organizer"] as const;
export type CompRoles = (typeof CompRoles)[number];

/**
 * Event-level participant roles
 * Roles assigned for specific events within a competition
 */
export const EventRoles = ["competitor", "judge", "scrutineer"] as const;
export type EventRoles = (typeof EventRoles)[number];

/**
 * Registration-specific roles
 * Roles used when registering for events (partner dance specific)
 */
export const RegistrationRoles = ["lead", "follow", "coach", "member"] as const;
export type RegistrationRole = (typeof RegistrationRoles)[number];

/**
 * All valid roles that can be assigned during event registration
 * Combines EventRoles and RegistrationRoles
 */
export const AllEventRegistrationRoles = [
  ...EventRoles,
  ...RegistrationRoles,
] as const;
export type AllEventRegistrationRole = (typeof AllEventRegistrationRoles)[number];
```

Export from `shared/index.ts`:
```typescript
export { 
  CompRoles, 
  EventRoles, 
  RegistrationRoles,
  AllEventRegistrationRoles,
} from "./data/enums/eventRoles";
export type {
  CompRoles as CompRole,
  EventRoles as EventRole,
  RegistrationRole,
  AllEventRegistrationRole,
} from "./data/enums/eventRoles";
```

### 5.2 Create Zod Enum Utilities

Create `shared/validation/zodEnums.ts`:

```typescript
import { z } from "zod";
import { 
  CompRoles, 
  EventRoles, 
  RegistrationRoles,
  AllEventRegistrationRoles,
} from "../data/enums/eventRoles";
import { ScoringMethods } from "../data/enums/scoringMethods";
import { EntryType, DanceStyle, BallroomLevel } from "../data/enums/eventTypes";

/**
 * Utility to create Zod enum from readonly array
 * Ensures validation schemas stay in sync with enum definitions
 */
function zodEnumFromArray<T extends readonly string[]>(
  arr: T
): z.ZodEnum<[T[0], ...T[]]> {
  if (arr.length === 0) throw new Error("Array must have at least one element");
  return z.enum([arr[0], ...arr.slice(1)] as [T[0], ...T[]]);
}

// Competition and Event Roles
export const CompRoleSchema = zodEnumFromArray(CompRoles);
export const EventRoleSchema = zodEnumFromArray(EventRoles);
export const RegistrationRoleSchema = zodEnumFromArray(RegistrationRoles);
export const AllEventRegistrationRoleSchema = zodEnumFromArray(AllEventRegistrationRoles);

// Scoring and Entry Types
export const ScoringMethodSchema = z.nativeEnum(ScoringMethods);
export const EntryTypeSchema = z.nativeEnum(EntryType);
export const DanceStyleSchema = z.nativeEnum(DanceStyle);
export const BallroomLevelSchema = z.nativeEnum(BallroomLevel);
```

Export from `shared/index.ts`:
```typescript
export {
  CompRoleSchema,
  EventRoleSchema,
  RegistrationRoleSchema,
  AllEventRegistrationRoleSchema,
  ScoringMethodSchema,
  EntryTypeSchema,
  DanceStyleSchema,
  BallroomLevelSchema,
} from "./validation/zodEnums";
```

### 5.3 Update Event Router

**File:** `server/src/trpc/routers/event.ts`

**Before (lines 21-37):**
```typescript
registerForEvent: authedProcedure
  .input(
    z.object({
      eventId: z.string().uuid(),
      role: z
        .enum([
          "competitor",
          "judge",
          "scrutineer",
          "lead",
          "follow",
          "coach",
          "member",
        ])
        .optional(),
    }),
  )
```

**After:**
```typescript
import { AllEventRegistrationRoleSchema } from "@ballroomcompmanager/shared";

registerForEvent: authedProcedure
  .input(
    z.object({
      eventId: z.string().uuid(),
      role: AllEventRegistrationRoleSchema.optional(),
    }),
  )
```

**Before (lines 96-112):**
```typescript
createRegistration: authedProcedure
  .input(
    z.object({
      eventId: z.string().uuid(),
      participants: z
        .array(
          z.object({
            userId: z.string().uuid(),
            role: z
              .enum(["lead", "follow", "coach", "member"])
              .default("member"),
          }),
        )
        .min(1, "At least one participant is required"),
      teamName: z.string().optional(),
    }),
  )
```

**After:**
```typescript
import { RegistrationRoleSchema } from "@ballroomcompmanager/shared";

createRegistration: authedProcedure
  .input(
    z.object({
      eventId: z.string().uuid(),
      participants: z
        .array(
          z.object({
            userId: z.string().uuid(),
            role: RegistrationRoleSchema.default("member"),
          }),
        )
        .min(1, "At least one participant is required"),
      teamName: z.string().optional(),
    }),
  )
```

### 5.4 Update Registration Types

**File:** `shared/data/types/registration.ts`

**Before:**
```typescript
export interface EventRegistrationParticipant {
  registrationId: string;
  userId: string;
  role: 'lead' | 'follow' | 'coach' | 'member';
}
```

**After:**
```typescript
import type { RegistrationRole } from "../enums/eventRoles";

export interface EventRegistrationParticipant {
  registrationId: string;
  userId: string;
  role: RegistrationRole;
}

export interface EventRegistrationApi {
  id: string;
  eventId: string;
  teamName?: string;
  status: 'active' | 'withdrawn' | 'pending'; // Could also be an enum
  createdAt: string;
  participants: {
    userId: string;
    role: RegistrationRole;
    userInfo?: {
      firstname: string;
      lastname: string;
      email: string;
    };
  }[];
}
```

### 5.5 Audit and Update Other Hardcoded Values

Search for other hardcoded enum patterns:
```bash
# Find potential hardcoded enums
grep -r "z\.enum\(\[" server/src/trpc/
grep -r "\"active\" | \"pending\" | \"cancelled\"" shared/
grep -r "\"scheduled\" | \"current\" | \"completed\"" shared/
```

Convert any found to shared enum references.

---

## 6. Benefits

1. **Single source of truth:** Enum values defined once in shared package
2. **Type safety:** Compiler ensures router accepts all valid enum values
3. **Refactoring safety:** Changes to enum propagate automatically
4. **No drift:** Impossible to have typos or inconsistent values
5. **Better IDE support:** Autocomplete for enum values
6. **Documentation:** Enums serve as canonical list of valid values
7. **Easier maintenance:** Add new roles/statuses in one place

---

## 7. Risks & Tradeoffs

**Risks:**
- **Breaking changes:** If enum values were slightly different from hardcoded strings
- **Import complexity:** More imports needed in router files
- **Learning curve:** Developers need to know where enums are defined

**Tradeoffs:**
- Slightly more verbose (import statements)
- Need utility function for z.enum conversion
- May need to define enums that previously didn't exist

**Mitigation:**
- Audit all hardcoded values before refactoring to ensure consistency
- Create clear documentation about where enums live
- Add examples to WARP.md showing proper enum usage

---

## 8. Migration Plan

### Phase 1: Define Missing Enums (Day 1)
1. Add `RegistrationRoles` and `AllEventRegistrationRoles` to `shared/data/enums/eventRoles.ts`
2. Update `shared/index.ts` exports
3. Create `shared/validation/zodEnums.ts` utility file

### Phase 2: Update Registration Types (Day 1)
1. Update `EventRegistrationParticipant` to use `RegistrationRole`
2. Update `EventRegistrationApi` types
3. Verify shared package compiles

### Phase 3: Update Event Router (Day 2)
1. Import new Zod enum schemas
2. Replace hardcoded z.enum() calls
3. Test all affected endpoints
4. Verify validation still works correctly

### Phase 4: Audit Codebase (Day 3)
1. Search for other hardcoded enum values
2. Create shared enums for any found (e.g., registration status, event status)
3. Update all usages to reference shared enums

### Phase 5: Documentation (Day 3)
1. Update WARP.md with enum pattern guidance
2. Add examples showing proper enum usage
3. Document where each enum is defined
4. Refresh RAG embeddings

### Phase 6: Testing (Day 4)
1. Unit test enum schemas validate correct values
2. Unit test enum schemas reject invalid values
3. Integration test router endpoints
4. Manual testing of registration flows

---

## 9. Test Strategy

### Unit Tests:

```typescript
// Test Zod enum schemas
describe('Enum Schemas', () => {
  describe('RegistrationRoleSchema', () => {
    it('should accept valid registration roles', () => {
      expect(() => RegistrationRoleSchema.parse('lead')).not.toThrow();
      expect(() => RegistrationRoleSchema.parse('follow')).not.toThrow();
      expect(() => RegistrationRoleSchema.parse('coach')).not.toThrow();
      expect(() => RegistrationRoleSchema.parse('member')).not.toThrow();
    });
    
    it('should reject invalid roles', () => {
      expect(() => RegistrationRoleSchema.parse('invalid')).toThrow();
      expect(() => RegistrationRoleSchema.parse('Lead')).toThrow(); // Case sensitive
    });
  });
  
  describe('AllEventRegistrationRoleSchema', () => {
    it('should accept all event and registration roles', () => {
      // Event roles
      expect(() => AllEventRegistrationRoleSchema.parse('competitor')).not.toThrow();
      expect(() => AllEventRegistrationRoleSchema.parse('judge')).not.toThrow();
      
      // Registration roles
      expect(() => AllEventRegistrationRoleSchema.parse('lead')).not.toThrow();
      expect(() => AllEventRegistrationRoleSchema.parse('follow')).not.toThrow();
    });
  });
});
```

### Integration Tests:

```typescript
describe('event.registerForEvent', () => {
  it('should accept all valid registration roles', async () => {
    const testRoles: AllEventRegistrationRole[] = [
      'competitor', 'judge', 'lead', 'follow', 'coach', 'member'
    ];
    
    for (const role of testRoles) {
      const result = await caller.event.registerForEvent({
        eventId: testEventId,
        role,
      });
      
      expect(result).toBeDefined();
    }
  });
  
  it('should reject invalid roles', async () => {
    await expect(
      caller.event.registerForEvent({
        eventId: testEventId,
        role: 'invalid' as any,
      })
    ).rejects.toThrow();
  });
});
```

### Type Tests:

```typescript
// Compile-time validation
import type { RegistrationRole, AllEventRegistrationRole } from '@ballroomcompmanager/shared';

// Should compile - verifies enums are properly typed
const testRole1: RegistrationRole = 'lead';
const testRole2: AllEventRegistrationRole = 'competitor';

// Should NOT compile
// const testRole3: RegistrationRole = 'competitor'; // Error: not a registration role
// const testRole4: RegistrationRole = 'invalid'; // Error: not a valid role
```

---

## 10. Open Questions

1. **Q:** Should `status` fields (e.g., `'active' | 'withdrawn' | 'pending'`) also be enums?
   - **A:** Yes - create `RegistrationStatus` enum for consistency

2. **Q:** Should we use TypeScript enums or const arrays?
   - **A:** Const arrays (current pattern) - more flexible, easier to iterate over, better for Zod

3. **Q:** How do we handle database enums that might differ from TypeScript enums?
   - **A:** Database should match TypeScript - use migrations to align them

4. **Q:** Should we create a linting rule to prevent hardcoded enum values?
   - **A:** Good idea for future - add to ESLint config to catch violations automatically

---

## 11. Checklist
- [ ] Define `RegistrationRoles` enum in `shared/data/enums/eventRoles.ts`
- [ ] Define `AllEventRegistrationRoles` combined enum
- [ ] Create `shared/validation/zodEnums.ts` utility file
- [ ] Implement `zodEnumFromArray` helper function
- [ ] Create Zod schemas for all role enums
- [ ] Update `shared/index.ts` to export new enums and schemas
- [ ] Update `EventRegistrationParticipant` type to use `RegistrationRole`
- [ ] Update event router `registerForEvent` to use `AllEventRegistrationRoleSchema`
- [ ] Update event router `createRegistration` to use `RegistrationRoleSchema`
- [ ] Audit codebase for other hardcoded enum values
- [ ] Create shared enums for any found hardcoded values
- [ ] Write unit tests for enum schemas
- [ ] Write integration tests for updated endpoints
- [ ] Write compile-time type tests
- [ ] Update WARP.md with enum usage patterns
- [ ] Add examples to documentation
- [ ] Consider adding ESLint rule to prevent hardcoded enums
- [ ] RAG embeddings refreshed
