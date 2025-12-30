# Refactor Proposal: Heat Scheduling System - Boundary Layer Setup

## 1. Summary
**Purpose:**  
Establish the shared types, API contracts, and server-side infrastructure needed to support heat scheduling functionality. This sets up the boundary zones (shared types, tRPC endpoints, mappers) so a teammate can implement the core scheduling algorithm independently.

**Status:**  
- Proposed

**Owner:**  
- Samuel Ellsworth (boundary layer setup)
- [Teammate Name] (scheduling algorithm implementation)

---

## 2. Motivation
The application needs heat scheduling functionality to automatically assign competition heats while satisfying various constraints (dancer availability, judge assignments, floor capacity, etc.). This is a computationally intensive constraint satisfaction problem.

Pain points without this infrastructure:
- No domain types exist for heats, schedules, or scheduling constraints
- No API contracts for scheduling operations
- No mapper layer to transform between database and domain representations
- Teammate blocked on implementing scheduling algorithm until contracts are defined

This proposal focuses on the **boundary layer** only—the types, API surface, and data transformation logic—so the core scheduling algorithm can be developed independently.

---

## 3. Scope
**Modules affected:**
- **Shared**: New domain types for scheduling
- **Server**: New tRPC router endpoints, mappers, and placeholder service
- **Client**: (Out of scope for this proposal—will consume types after boundary is established)

**Types of changes:**
- New domain types in `shared/` for heats, schedules, constraints
- New tRPC router for scheduling operations
- New mapper module for schedule data transformation
- Placeholder service layer structure (implementation by teammate)

**What is NOT included:**
- Actual scheduling algorithm/solver implementation (teammate's responsibility)
- UI for schedule display and editing (future work)
- Database migrations for heat storage (separate proposal after schema finalized)

---

## 4. Current State

### Existing Event/Round Structure
The codebase has basic event and round types:
- `CompEvent` - Competition events (`shared/data/types/event.ts:18`)
- `EventRound` - Rounds within events (`shared/data/types/event.ts:38`)
- `RoundHeat` - Basic heat structure with timing (`shared/data/types/event.ts:49`)

**Current `RoundHeat` type:**
```typescript
interface RoundHeat {
  id: string;
  roundId: string;
  heatNumber: number;
  startTime: Date | null;
  endTime: Date | null;
}
```

**Limitations:**
- No assignment of competitors to heats
- No judge assignments per heat
- No scheduling metadata (constraints, conflicts, generation timestamp)
- No validation or conflict detection types

### Current Router Structure
tRPC routers are modularized (`server/src/trpc/router.ts`):
- `competitionRouter` - Competition CRUD
- `eventRouter` - Event registration and management
- `userRouter` - User operations
- `dataRouter` - Supporting entities

No scheduling router exists.

---

## 5. Proposed Changes

### 5.1 Shared Types (Restricted Zone - Requires Review)

**File: `shared/data/types/schedule.ts` (new)**

Add comprehensive scheduling domain types:

```typescript
// Core scheduling entities
export interface Heat {
  id: string;
  roundId: string;
  heatNumber: number;
  
  // Assignments
  competitorIds: string[];    // Dancers in this heat
  judgeIds: string[];         // Judges assigned to this heat
  
  // Timing
  scheduledStartTime: Date | null;
  scheduledEndTime: Date | null;
  estimatedDuration: number;  // minutes
  
  // Metadata
  floorNumber?: number;       // If multi-floor competition
  notes?: string;
}

// Scheduling constraints input
export interface SchedulingConstraints {
  // Hard constraints (must satisfy)
  maxCompetitorsPerHeat: number;
  minCompetitorsPerHeat: number;
  maxHeatsPerFloor: number;
  requiredBreakBetweenHeats: number;  // minutes
  judgesPerHeat: number;
  
  // Soft constraints (optimize)
  preferredStartTime?: Date;
  preferredEndTime?: Date;
  minRestTimeForCompetitors?: number;  // minutes between heats for same dancer
  balanceJudgeWorkload?: boolean;
}

// Schedule generation result
export interface ScheduleResult {
  roundId: string;
  heats: Heat[];
  
  // Metadata
  generatedAt: Date;
  algorithm: string;          // e.g. "greedy", "cp-solver", "manual"
  constraintsSatisfied: boolean;
  conflicts: ScheduleConflict[];
  
  // Statistics
  totalDuration: number;      // minutes
  utilizationRate: number;    // 0-1, how efficiently scheduled
}

// Conflict detection
export interface ScheduleConflict {
  type: 'dancer_overlap' | 'judge_overlap' | 'capacity_exceeded' | 'timing_violation';
  severity: 'error' | 'warning';
  description: string;
  affectedHeatIds: string[];
  affectedParticipantIds?: string[];
}

// Schedule validation
export interface ScheduleValidation {
  isValid: boolean;
  conflicts: ScheduleConflict[];
  warnings: string[];
}
```

**File: `shared/data/types/event.ts`**

Update existing `RoundHeat` to be an alias or extend new `Heat` type for backward compatibility:

```typescript
// Mark as deprecated in favor of Heat
/** @deprecated Use Heat from schedule.ts instead */
export interface RoundHeat {
  id: string;
  roundId: string;
  heatNumber: number;
  startTime: Date | null;
  endTime: Date | null;
}
```

**File: `shared/index.ts`**

Export new scheduling types:

```typescript
export type {
  Heat,
  SchedulingConstraints,
  ScheduleResult,
  ScheduleConflict,
  ScheduleValidation,
} from "./data/types/schedule";
```

---

### 5.2 Validation Schemas (Shared)

**File: `shared/validation/zodScheduling.ts` (new)**

```typescript
import { z } from "zod";

export const SchedulingConstraintsSchema = z.object({
  maxCompetitorsPerHeat: z.number().int().positive(),
  minCompetitorsPerHeat: z.number().int().positive(),
  maxHeatsPerFloor: z.number().int().positive(),
  requiredBreakBetweenHeats: z.number().int().nonnegative(),
  judgesPerHeat: z.number().int().nonnegative(),
  preferredStartTime: z.date().optional(),
  preferredEndTime: z.date().optional(),
  minRestTimeForCompetitors: z.number().int().nonnegative().optional(),
  balanceJudgeWorkload: z.boolean().optional(),
});

export const HeatSchema = z.object({
  id: z.string().uuid(),
  roundId: z.string().uuid(),
  heatNumber: z.number().int().positive(),
  competitorIds: z.array(z.string().uuid()),
  judgeIds: z.array(z.string().uuid()),
  scheduledStartTime: z.date().nullable(),
  scheduledEndTime: z.date().nullable(),
  estimatedDuration: z.number().int().positive(),
  floorNumber: z.number().int().positive().optional(),
  notes: z.string().optional(),
});
```

Export from `shared/index.ts`:
```typescript
export { SchedulingConstraintsSchema, HeatSchema } from "./validation/zodScheduling";
```

---

### 5.3 Server Mapper (Contract Zone - Requires Notification)

**File: `server/src/mappers/scheduleMapper.ts` (new)**

Transform between database rows and domain types:

```typescript
import type { Heat, ScheduleResult, ScheduleConflict } from "@ballroomcompmanager/shared";

export class ScheduleMapper {
  /**
   * Map database heat row to domain Heat type
   * Assumes DB schema with columns: id, round_id, heat_number, competitor_ids, judge_ids, etc.
   */
  static toDomainHeat(dbRow: any): Heat {
    return {
      id: dbRow.id,
      roundId: dbRow.round_id,
      heatNumber: dbRow.heat_number,
      competitorIds: dbRow.competitor_ids || [],
      judgeIds: dbRow.judge_ids || [],
      scheduledStartTime: dbRow.scheduled_start_time ? new Date(dbRow.scheduled_start_time) : null,
      scheduledEndTime: dbRow.scheduled_end_time ? new Date(dbRow.scheduled_end_time) : null,
      estimatedDuration: dbRow.estimated_duration || 5,
      floorNumber: dbRow.floor_number,
      notes: dbRow.notes,
    };
  }

  /**
   * Map domain Heat to database row format
   */
  static toDbRow(heat: Heat): Record<string, any> {
    return {
      id: heat.id,
      round_id: heat.roundId,
      heat_number: heat.heatNumber,
      competitor_ids: heat.competitorIds,
      judge_ids: heat.judgeIds,
      scheduled_start_time: heat.scheduledStartTime?.toISOString() || null,
      scheduled_end_time: heat.scheduledEndTime?.toISOString() || null,
      estimated_duration: heat.estimatedDuration,
      floor_number: heat.floorNumber || null,
      notes: heat.notes || null,
    };
  }

  /**
   * Map ScheduleResult to API-compatible format (Date -> ISO string)
   */
  static toApiScheduleResult(result: ScheduleResult): any {
    return {
      roundId: result.roundId,
      heats: result.heats.map(heat => ({
        ...heat,
        scheduledStartTime: heat.scheduledStartTime?.toISOString() || null,
        scheduledEndTime: heat.scheduledEndTime?.toISOString() || null,
      })),
      generatedAt: result.generatedAt.toISOString(),
      algorithm: result.algorithm,
      constraintsSatisfied: result.constraintsSatisfied,
      conflicts: result.conflicts,
      totalDuration: result.totalDuration,
      utilizationRate: result.utilizationRate,
    };
  }
}
```

---

### 5.4 Server Service Layer (Placeholder)

**File: `server/src/services/schedulingService.ts` (new)**

Placeholder service interface for teammate to implement:

```typescript
import type {
  Heat,
  SchedulingConstraints,
  ScheduleResult,
  ScheduleValidation,
} from "@ballroomcompmanager/shared";

/**
 * Scheduling service - core algorithm implementation
 * 
 * TODO: Implement scheduling algorithms
 * See section 10 (Implementation Strategy) for detailed recommendations.
 * 
 * Recommended phased approach:
 * - Phase 1: Heuristic algorithm (greedy + backtracking) in TypeScript
 * - Phase 2: z3-solver integration for complex cases (<200 heats)
 * - Phase 3: Optional Go microservice for large competitions (200+ heats)
 * 
 * Service layer is designed to be swappable - can route to different
 * solvers based on problem size.
 */
export class SchedulingService {
  /**
   * Generate a schedule for a round
   * @param roundId - Round to schedule
   * @param constraints - Scheduling constraints
   * @returns Generated schedule with heats and conflict info
   */
  async generateSchedule(
    roundId: string,
    constraints: SchedulingConstraints
  ): Promise<ScheduleResult> {
    // TODO: Implement scheduling algorithm
    throw new Error("Not implemented - scheduling algorithm placeholder");
  }

  /**
   * Validate an existing schedule for conflicts
   * @param heats - Heats to validate
   * @param constraints - Constraints to check against
   * @returns Validation result with conflicts
   */
  async validateSchedule(
    heats: Heat[],
    constraints: SchedulingConstraints
  ): Promise<ScheduleValidation> {
    // TODO: Implement validation logic
    throw new Error("Not implemented - validation placeholder");
  }

  /**
   * Reschedule a specific heat (manual adjustment)
   * @param heatId - Heat to reschedule
   * @param newStartTime - New scheduled time
   * @returns Updated schedule with conflict detection
   */
  async rescheduleHeat(
    heatId: string,
    newStartTime: Date
  ): Promise<ScheduleResult> {
    // TODO: Implement manual rescheduling
    throw new Error("Not implemented - reschedule placeholder");
  }
}
```

---

### 5.5 tRPC Router (Contract Zone - Requires Review)

**File: `server/src/trpc/routers/scheduling.ts` (new)**

```typescript
import { z } from "zod";
import { router, protectedProcedure } from "../base";
import {
  SchedulingConstraintsSchema,
  HeatSchema,
} from "@ballroomcompmanager/shared";
import { SchedulingService } from "../../services/schedulingService";
import { ScheduleMapper } from "../../mappers/scheduleMapper";

const schedulingService = new SchedulingService();

export const schedulingRouter = router({
  /**
   * Generate schedule for a round
   */
  generateSchedule: protectedProcedure
    .input(
      z.object({
        roundId: z.string().uuid(),
        constraints: SchedulingConstraintsSchema,
      })
    )
    .mutation(async ({ input }) => {
      const result = await schedulingService.generateSchedule(
        input.roundId,
        input.constraints
      );
      return ScheduleMapper.toApiScheduleResult(result);
    }),

  /**
   * Validate existing schedule
   */
  validateSchedule: protectedProcedure
    .input(
      z.object({
        heats: z.array(HeatSchema),
        constraints: SchedulingConstraintsSchema,
      })
    )
    .query(async ({ input }) => {
      return await schedulingService.validateSchedule(
        input.heats,
        input.constraints
      );
    }),

  /**
   * Manually reschedule a heat
   */
  rescheduleHeat: protectedProcedure
    .input(
      z.object({
        heatId: z.string().uuid(),
        newStartTime: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await schedulingService.rescheduleHeat(
        input.heatId,
        input.newStartTime
      );
      return ScheduleMapper.toApiScheduleResult(result);
    }),

  /**
   * Get schedule for a round
   */
  getSchedule: protectedProcedure
    .input(z.object({ roundId: z.string().uuid() }))
    .query(async ({ input }) => {
      // TODO: Implement database query for existing schedule
      throw new Error("Not implemented - get schedule placeholder");
    }),
});
```

**File: `server/src/trpc/router.ts`**

Update main router to include scheduling:

```typescript
import { schedulingRouter } from "./routers/scheduling";

export const appRouter = router({
  competition: competitionRouter,
  event: eventRouter,
  user: userRouter,
  data: dataRouter,
  scheduling: schedulingRouter,  // NEW
});
```

---

## 6. Benefits

**Separation of concerns:**
- Boundary layer (types, API, mappers) separated from algorithm implementation
- Teammate can implement scheduling algorithm without touching contracts
- Clear ownership boundaries

**Type safety:**
- End-to-end type safety from client → tRPC → service → database
- Shared types prevent drift between frontend and backend

**Flexibility:**
- Scheduling algorithm can be swapped (greedy → CP solver) without changing API
- Placeholder service makes it clear what needs implementation

**Testability:**
- Service layer can be unit tested independently
- API contracts can be integration tested with mock service

---

## 7. Risks & Tradeoffs

**Risk: Premature abstraction**
- We're defining types before seeing full algorithm requirements
- Mitigation: Keep types flexible, allow iteration after algorithm prototype

**Risk: Database schema not finalized**
- Mapper assumes DB schema, but migrations not included in this proposal
- Mitigation: Mapper is isolated layer, easy to update when schema finalized

**Risk: Over-engineering placeholder**
- Service placeholder might not match actual algorithm needs
- Mitigation: Treat as interface guide, not strict contract; teammate can refactor

**Tradeoff: Increased initial complexity**
- More files and abstraction layers up-front
- Benefit: Cleaner architecture, easier parallel development

---

## 8. Migration Plan

### Phase 1: Shared Types (This Proposal)
1. Add new types to `shared/data/types/schedule.ts`
2. Add validation schemas to `shared/validation/zodScheduling.ts`
3. Export from `shared/index.ts`
4. Build shared package: `cd shared && pnpm build`

### Phase 2: Server Infrastructure (This Proposal)
1. Create `server/src/mappers/scheduleMapper.ts`
2. Create placeholder `server/src/services/schedulingService.ts`
3. Create `server/src/trpc/routers/scheduling.ts`
4. Update `server/src/trpc/router.ts` to include scheduling router
5. Verify server compiles: `cd server && pnpm build`

### Phase 3: Algorithm Implementation (Teammate's Work)
1. Implement `SchedulingService.generateSchedule()`
2. Implement `SchedulingService.validateSchedule()`
3. Add tests for scheduling algorithms
4. Iterate on types if needed (requires new proposal)

### Phase 4: Database Integration (Future Proposal)
1. Create migration for heats table with scheduling fields
2. Implement `getSchedule` query in scheduling router
3. Add persistence logic to service layer
4. Update mappers if schema differs from initial assumptions

### Phase 5: Client Integration (Future Work)
1. Build UI for schedule display
2. Build UI for manual heat editing
3. Integrate tRPC scheduling endpoints

**Backward compatibility:**
- Existing `RoundHeat` type deprecated but not removed
- No breaking changes to existing routers
- New router is additive

---

## 9. Test Strategy

### Unit Tests (After Implementation)
- `scheduleMapper.ts`: Test domain ↔ DB transformations
- `schedulingService.ts`: Test algorithm logic with mock data

### Integration Tests
- tRPC endpoints: Test request validation and response formatting
- End-to-end: Mock client → router → service → mapper flow

### Manual Verification
- Server starts successfully with new router
- tRPC type exports remain valid
- Shared package builds without errors

---

## 10. Implementation Strategy & Performance Considerations

### Solver Technology Recommendations

Heat scheduling is computationally intensive, and language/solver choice significantly impacts performance. We evaluated multiple approaches:

#### Option 1: Pure Node.js/TypeScript
**Best for:** Small-medium competitions (<200 heats)
- **Phase 1**: Heuristic algorithm (greedy + backtracking)
  - Simple to implement and debug
  - Runs in milliseconds for <50 heats
  - Good starting point to validate constraint model
- **Phase 2**: z3-solver (Z3 via WebAssembly)
  - SMT solver for complex constraints
  - Handles up to 200 heats in 1-5 seconds
  - No deployment complexity, pure JS/TS codebase

**Pros:**
- No operational complexity (no microservices, no binaries)
- Easy to develop/test within existing TypeScript codebase
- Most ballroom competitions are <100 heats (adequate performance)

**Cons:**
- Slower than native (5-10x for complex problems)
- May struggle with 500+ heat competitions

#### Option 2: Go Microservice
**Best for:** Large competitions (200-500 heats)
- Native compiled binary with constraint solver (gocsp, go-sat)
- Sub-second performance for most problems
- Single static binary deployment

**Integration:**
- Call Go binary via `child_process` from Node.js
- Pass constraints as JSON, receive schedule JSON
- Or deploy as separate microservice with HTTP/gRPC

**Pros:**
- Excellent performance (near C++ speed)
- Simple deployment (single binary)
- Team has Go familiarity

**Cons:**
- Additional codebase to maintain
- FFI/IPC overhead for small problems
- Increased deployment complexity

#### Option 3: C++ with Google OR-Tools
**Best for:** Very large competitions (500+ heats)
- Industry-standard CP-SAT solver
- Best-in-class performance for complex constraints
- Handles extremely large problem spaces

**Integration:**
- Build as CLI tool or microservice
- Node.js calls via child process or HTTP

**Pros:**
- Maximum performance for large-scale problems
- OR-Tools is battle-tested and feature-rich

**Cons:**
- Most complex deployment (compile + distribute binary)
- Separate C++ codebase to maintain
- Overkill for typical ballroom competitions

### Recommended Approach: Hybrid Strategy

**Start with Node.js, add optimization layers as needed:**

```typescript
// schedulingService.ts
export class SchedulingService {
  async generateSchedule(
    roundId: string,
    constraints: SchedulingConstraints
  ): Promise<ScheduleResult> {
    const problemSize = await this.estimateProblemSize(roundId);
    
    // Route to appropriate solver based on problem size
    if (problemSize < 50) {
      return this.heuristicScheduler.solve(roundId, constraints);
    } else if (problemSize < 200) {
      return this.z3Scheduler.solve(roundId, constraints);
    } else {
      // Invoke Go binary or microservice for large problems
      return this.goScheduler.solve(roundId, constraints);
    }
  }
}
```

**Implementation phases:**
1. **Phase 1**: Heuristic algorithm in TypeScript
   - Validate constraint model with real data
   - Get feedback on schedule quality
   - 95% of use cases will be fast enough

2. **Phase 2**: Integrate z3-solver (WASM)
   - Drop-in replacement for complex cases
   - Same TypeScript codebase, no ops complexity
   - Handle medium-sized competitions efficiently

3. **Phase 3**: Build Go escape hatch (only if needed)
   - Only invoke for 200+ heat competitions
   - Benchmark with real data before committing
   - Keep simple cases in Node.js for simplicity

### Performance Benchmarks (Estimated)

| Competition Size | Heuristic (TS) | z3-solver (WASM) | Go Native | C++ OR-Tools |
|------------------|----------------|------------------|-----------|-------------|
| <50 heats        | <100ms        | <500ms          | <50ms     | <50ms       |
| 50-100 heats     | 200-500ms     | 1-2s            | <200ms    | <100ms      |
| 100-200 heats    | 1-3s          | 2-5s            | <500ms    | <200ms      |
| 200-500 heats    | 5-10s+        | 10s+            | 1-2s      | <500ms      |
| 500+ heats       | Too slow      | Too slow        | 3-5s      | 1-2s        |

### Recommendation for BallroomCompManager

**Start with pure Node.js + z3-solver:**
- Most ballroom competitions are <100 heats
- z3-solver handles this comfortably in 1-2 seconds
- No operational complexity
- Easy to develop/test within existing codebase
- Service layer already designed to be swappable

**Add Go microservice only if:**
- Real-world benchmarks show unacceptable performance
- Specific competition types consistently exceed 200 heats
- Users report scheduling taking >5 seconds regularly

**Dependencies to add:**
```json
// server/package.json
{
  "dependencies": {
    "z3-solver": "^4.x.x"  // For Phase 2 optimization
  }
}
```

---

## 11. Open Questions

1. **Database schema finalization**: Should heats be in separate table or embedded in rounds? (Blocks Phase 4)
2. **Multi-floor support**: Do we need multi-floor scheduling in V1? (Affects constraint types)
3. **Real-time updates**: Should schedule changes broadcast to clients? (Out of scope but affects architecture)
4. **Performance requirements**: What is acceptable max scheduling time? (Informs solver choice)
5. **Typical competition size**: What's the 95th percentile heat count? (Validates Node.js approach)

---

## 12. Checklist

### Shared Package
- [ ] Create `shared/data/types/schedule.ts` with Heat, ScheduleResult, SchedulingConstraints
- [ ] Create `shared/validation/zodScheduling.ts` with Zod schemas
- [ ] Update `shared/index.ts` exports
- [ ] Deprecate `RoundHeat` in `shared/data/types/event.ts`
- [ ] Build shared package successfully

### Server Package
- [ ] Create `server/src/mappers/scheduleMapper.ts`
- [ ] Create `server/src/services/schedulingService.ts` (placeholder)
- [ ] Create `server/src/trpc/routers/scheduling.ts`
- [ ] Update `server/src/trpc/router.ts` to include scheduling router
- [ ] Verify server compiles successfully

### Documentation
- [ ] Update WARP.md with scheduling service location
- [ ] Document scheduling types in README (if applicable)
- [ ] Add JSDoc comments to all new exported types
- [ ] Create follow-up proposal for database migration

### Testing
- [ ] Manual smoke test: server starts without errors
- [ ] Verify tRPC type exports work in client
- [ ] Document test strategy for teammate's algorithm implementation

### RAG
- [ ] Move proposal to `/rag/design/refactors/approved/` after review
- [ ] Refresh RAG embeddings after implementation
- [ ] Move to `/rag/design/refactors/completed/` when done
