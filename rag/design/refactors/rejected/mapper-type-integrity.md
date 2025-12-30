# Refactor Proposal: Mapper Type Integrity

## 1. Summary
**Purpose:**  
Ensure data mappers return complete, accurate domain types instead of incomplete objects with TODO placeholders, maintaining type integrity across the data transformation layer.

**Status:**  
- Proposed

**Owner:**  
- TBD

**Dependencies:**
- None (can be implemented independently)

---

## 2. Motivation
Current mapper implementations violate type contracts by returning incomplete domain types with empty arrays and TODO comments.

**Pain points:**
- **Event mapper** returns `CompEvent` with `competitors: []` and `judges: []` despite type requiring `Participant[]`
- Function signatures promise complete types but deliver partial data
- TODO comments indicate known incompleteness but no plan to address
- Client code receives incomplete data, potentially causing runtime errors
- No clear distinction between "data not loaded" vs "no data exists"

**Current violations:**
```typescript
// server/src/mappers/eventMapper.ts (lines 132-142)
return {
  id: row.id,
  competitionId: row.comp_id,
  category,
  name: row.name,
  competitors: [], // TODO: fetch from event_registration_participants
  judges: [],      // TODO: fetch from event_registration_participants
  scoring,
  entryType,
  startDate: row.start_at ? new Date(row.start_at) : null,
  endDate: row.end_at ? new Date(row.end_at) : null,
};
```

**Violations of WARP.md principles:**
- "All server → client data must conform exactly to shared types"
- "changes to data mappers must be communicated and must adhere to the domain defined by shared types"

---

## 3. Scope
**Modules affected:**
- `shared/data/types/event.ts` - May need new partial types
- `server/src/mappers/eventMapper.ts` - Core mapper implementation
- `server/src/trpc/routers/event.ts` - Router using mapper
- `server/src/trpc/routers/competition.ts` - Uses event mapper
- `server/src/dal/event.ts` - May need new queries for participant data

**Types of changes:**
- Define partial/summary domain types where appropriate
- Update mappers to either fetch complete data or use explicit partial types
- Add clear documentation about data completeness guarantees
- Update DAL queries to support fetching complete data

**What is NOT included:**
- Changing the structure of full domain types
- Client-side display logic
- Database schema changes

---

## 4. Current State

### Problem Areas:

#### A. Event Mapper Incompleteness
**File:** `server/src/mappers/eventMapper.ts`

```typescript
export function mapEventRowEnrichedToCompEvent(
  row: EventRowEnriched,
): CompEvent {
  // ... mapping logic ...
  
  return {
    id: row.id,
    competitionId: row.comp_id,
    category,
    name: row.name,
    competitors: [], // TODO: fetch from event_registration_participants
    judges: [],      // TODO: fetch from event_registration_participants
    scoring,
    entryType,
    startDate: row.start_at ? new Date(row.start_at) : null,
    endDate: row.end_at ? new Date(row.end_at) : null,
  };
}
```

**Issues:**
1. Function claims to return `CompEvent` but returns incomplete data
2. `competitors` and `judges` always empty regardless of actual data
3. No way for caller to know if arrays are empty because no data exists or because data wasn't loaded
4. Client code expecting participants will fail or show incorrect UI

#### B. Type Definition Problem
**File:** `shared/data/types/event.ts`

```typescript
export interface CompEvent {
  id: string;
  competitionId: string;
  category: EventCategory;
  name: string;
  competitors: Participant[];  // Not optional - implies always present
  judges: Participant[];       // Not optional - implies always present
  scoring: ScoringMethods;
  entryType: EntryType;
  startDate: Date | null;
  endDate: Date | null;
}
```

**Issue:** Type doesn't distinguish between "full event with participants" vs "event summary without participants"

---

## 5. Proposed Changes

### 5.1 Define Explicit Partial Types

Create new types in `shared/data/types/event.ts`:

```typescript
/**
 * Complete event with all participant data loaded
 * Use when displaying event details or managing participants
 */
export interface CompEvent {
  id: string;
  competitionId: string;
  category: EventCategory;
  name: string;
  competitors: Participant[];
  judges: Participant[];
  scoring: ScoringMethods;
  entryType: EntryType;
  startDate: Date | null;
  endDate: Date | null;
}

/**
 * Event summary without participant data
 * Use for event listings, schedules, and when participant data isn't needed
 * More efficient than CompEvent as it doesn't require joining participant tables
 */
export interface CompEventSummary {
  id: string;
  competitionId: string;
  category: EventCategory;
  name: string;
  scoring: ScoringMethods;
  entryType: EntryType;
  startDate: Date | null;
  endDate: Date | null;
  // Note: competitors and judges not included
  // Use getEventParticipants() to fetch separately if needed
}

/**
 * Event with participant counts but not full participant data
 * Useful for showing "12 competitors, 3 judges" without loading all user details
 */
export interface CompEventWithCounts extends CompEventSummary {
  competitorCount: number;
  judgeCount: number;
}
```

Export from `shared/index.ts`:
```typescript
export type { 
  CompEvent, 
  CompEventSummary, 
  CompEventWithCounts 
} from "./data/types/event";
```

### 5.2 Create Appropriate Mappers

**File:** `server/src/mappers/eventMapper.ts`

```typescript
/**
 * Map enriched event row to CompEventSummary (without participants)
 * This is the efficient default for lists and schedules
 */
export function mapEventRowToSummary(
  row: EventRowEnriched,
): CompEventSummary {
  const entryType: any = row.entry_type || "solo";
  const category = mapEventCategory(row); // Extract category mapping logic
  const scoring = mapScoringMethod(row);  // Extract scoring mapping logic
  
  return {
    id: row.id,
    competitionId: row.comp_id,
    category,
    name: row.name,
    scoring,
    entryType,
    startDate: row.start_at ? new Date(row.start_at) : null,
    endDate: row.end_at ? new Date(row.end_at) : null,
  };
}

/**
 * Map event row with participant data to full CompEvent
 * Requires EventRowEnrichedWithParticipants type from DAL
 */
export function mapEventRowToCompEvent(
  row: EventRowEnrichedWithParticipants,
): CompEvent {
  const summary = mapEventRowToSummary(row);
  
  return {
    ...summary,
    competitors: row.participants
      .filter(p => p.role === 'competitor')
      .map(mapParticipantRowToParticipant),
    judges: row.participants
      .filter(p => p.role === 'judge')
      .map(mapParticipantRowToParticipant),
  };
}

/**
 * Map event row with participant counts
 */
export function mapEventRowToEventWithCounts(
  row: EventRowEnrichedWithCounts,
): CompEventWithCounts {
  const summary = mapEventRowToSummary(row);
  
  return {
    ...summary,
    competitorCount: row.competitor_count || 0,
    judgeCount: row.judge_count || 0,
  };
}

// Deprecated - will be removed
/**
 * @deprecated Use mapEventRowToSummary instead
 * This function returns incomplete CompEvent data
 */
export function mapEventRowEnrichedToCompEvent(
  row: EventRowEnriched,
): CompEvent {
  console.warn('mapEventRowEnrichedToCompEvent is deprecated - use mapEventRowToSummary');
  return mapEventRowToSummary(row) as any; // Unsafe cast for backward compat
}
```

### 5.3 Update DAL Queries

**File:** `server/src/dal/event.ts`

```typescript
/**
 * Row type for events with participant data joined
 */
export type EventRowEnrichedWithParticipants = EventRowEnriched & {
  participants: Array<{
    user_id: string;
    role: 'competitor' | 'judge' | 'scrutineer';
    user_profile: {
      firstname: string;
      lastname: string;
      email: string;
    };
  }>;
};

/**
 * Get events with full participant data
 * More expensive query - use only when participant data is needed
 */
export async function getCompetitionEventsWithParticipants(
  supabase: SupabaseClient,
  competitionId: string,
) {
  return await supabase
    .from('event_info')
    .select(`
      *,
      category_ruleset(
        id,
        event_category(id, dance_style(id, name), event_level(id, name)),
        ruleset(id, name, scoring_method(id, name))
      ),
      event_registration_participants(
        user_id,
        role,
        user_profile(firstname, lastname, email)
      )
    `)
    .eq('comp_id', competitionId);
}

/**
 * Get events with participant counts only
 * More efficient than full participant data
 */
export async function getCompetitionEventsWithCounts(
  supabase: SupabaseClient,
  competitionId: string,
) {
  // Use PostgreSQL COUNT aggregation
  return await supabase.rpc('get_events_with_participant_counts', {
    competition_id: competitionId,
  });
}

/**
 * Get event summaries without participant data
 * Most efficient - use for lists and schedules
 */
export async function getCompetitionEventSummaries(
  supabase: SupabaseClient,
  competitionId: string,
) {
  return await supabase
    .from('event_info')
    .select(`
      *,
      category_ruleset(
        id,
        event_category(id, dance_style(id, name), event_level(id, name)),
        ruleset(id, name, scoring_method(id, name))
      )
    `)
    .eq('comp_id', competitionId);
}
```

### 5.4 Update Router Endpoints

**File:** `server/src/trpc/routers/competition.ts`

```typescript
// Line 100-125: getEvents query
getEvents: publicProcedure
  .input(z.object({ 
    competitionId: z.string(),
    includeParticipants: z.boolean().default(false), // Opt-in for full data
  }))
  .query(async ({ input }) => {
    if (input.includeParticipants) {
      const { data: events, error } = await EventDAL.getCompetitionEventsWithParticipants(
        getSupabaseAnon(),
        input.competitionId,
      );
      
      if (error) throw new TRPCError({ ... });
      
      return events.map(mapEventRowToCompEvent);
    } else {
      const { data: events, error } = await EventDAL.getCompetitionEventSummaries(
        getSupabaseAnon(),
        input.competitionId,
      );
      
      if (error) throw new TRPCError({ ... });
      
      return events.map(mapEventRowToSummary);
    }
  }),
```

### 5.5 Create Validation Schemas

**File:** `shared/validation/schemas.ts`

```typescript
export const CompEventSummarySchema = z.object({
  id: z.string().uuid(),
  competitionId: z.string().uuid(),
  category: EventCategorySchema, // Define this
  name: z.string(),
  scoring: z.nativeEnum(ScoringMethods),
  entryType: z.nativeEnum(EntryType),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
});

export const CompEventSchema = CompEventSummarySchema.extend({
  competitors: z.array(ParticipantSchema),
  judges: z.array(ParticipantSchema),
});

export const CompEventWithCountsSchema = CompEventSummarySchema.extend({
  competitorCount: z.number().int().nonnegative(),
  judgeCount: z.number().int().nonnegative(),
});
```

---

## 6. Benefits

1. **Type honesty:** Functions accurately declare what data they return
2. **Performance:** Can choose lightweight summary types when full data not needed
3. **Clarity:** Explicit types communicate data availability to developers
4. **Maintainability:** No more TODO comments - clear separation of concerns
5. **Client optimization:** Frontend can choose appropriate data granularity
6. **Error prevention:** Type system catches misuse at compile time

---

## 7. Risks & Tradeoffs

**Risks:**
- **Breaking changes:** Existing code expecting `CompEvent` with empty arrays will break
- **API complexity:** More endpoint variations to maintain
- **Query complexity:** Need multiple DAL functions for different data levels

**Tradeoffs:**
- More types to maintain (CompEvent, CompEventSummary, CompEventWithCounts)
- More mapper functions (3 instead of 1)
- Need to choose appropriate type for each use case

**Mitigation:**
- Provide migration guide showing how to update client code
- Use TypeScript discriminated unions if needed
- Document performance characteristics of each type
- Keep backward compatibility during transition period

---

## 8. Migration Plan

### Phase 1: Define New Types (Day 1)
1. Add `CompEventSummary` and `CompEventWithCounts` to `shared/data/types/event.ts`
2. Export from `shared/index.ts`
3. Create validation schemas

### Phase 2: Create New Mappers (Day 2)
1. Implement `mapEventRowToSummary`
2. Implement `mapEventRowToEventWithCounts`
3. Update `mapEventRowToCompEvent` to require participant data
4. Deprecate old `mapEventRowEnrichedToCompEvent`

### Phase 3: Add DAL Support (Day 3)
1. Create `getCompetitionEventsWithParticipants`
2. Create `getCompetitionEventsWithCounts`
3. Rename existing to `getCompetitionEventSummaries`
4. Add database function for count aggregation if needed

### Phase 4: Update Routers (Day 4)
1. Update competition.getEvents to support optional participant loading
2. Update event router endpoints
3. Add tests for each data level

### Phase 5: Client Migration (Day 5)
1. Audit client code using events
2. Update to use CompEventSummary where appropriate
3. Add `includeParticipants: true` where full data needed
4. Update UI components to handle different data levels

### Phase 6: Cleanup (Week 2)
1. Remove deprecated mapper
2. Update documentation
3. Refresh RAG embeddings

### Backward Compatibility:
- Keep deprecated mapper for one release
- Log warnings when deprecated function used
- Provide codemod script to assist migration

---

## 9. Test Strategy

### Unit Tests:
```typescript
describe('Event Mappers', () => {
  describe('mapEventRowToSummary', () => {
    it('should map event row to CompEventSummary', () => {
      const row: EventRowEnriched = { /* test data */ };
      const result = mapEventRowToSummary(row);
      
      const summary: CompEventSummary = result; // Should compile
      expect(result).not.toHaveProperty('competitors');
      expect(result).not.toHaveProperty('judges');
    });
  });
  
  describe('mapEventRowToCompEvent', () => {
    it('should map event row with participants to CompEvent', () => {
      const row: EventRowEnrichedWithParticipants = {
        /* test data */
        participants: [
          { user_id: '1', role: 'competitor', user_profile: { ... } },
          { user_id: '2', role: 'judge', user_profile: { ... } },
        ],
      };
      
      const result = mapEventRowToCompEvent(row);
      
      const event: CompEvent = result; // Should compile
      expect(result.competitors).toHaveLength(1);
      expect(result.judges).toHaveLength(1);
    });
  });
});
```

### Integration Tests:
```typescript
describe('competition.getEvents', () => {
  it('should return CompEventSummary by default', async () => {
    const result = await caller.competition.getEvents({
      competitionId: testCompId,
    });
    
    expect(result[0]).not.toHaveProperty('competitors');
    expect(result[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      competitionId: testCompId,
    });
  });
  
  it('should return CompEvent when includeParticipants is true', async () => {
    const result = await caller.competition.getEvents({
      competitionId: testCompId,
      includeParticipants: true,
    });
    
    expect(result[0]).toHaveProperty('competitors');
    expect(result[0]).toHaveProperty('judges');
    expect(Array.isArray(result[0].competitors)).toBe(true);
  });
});
```

### Type Tests:
```typescript
// Compile-time validation
type TestSummary = CompEventSummary extends { competitors: any } ? never : true;
type TestFull = CompEvent extends { competitors: Participant[] } ? true : never;

const test1: TestSummary = true; // Should compile
const test2: TestFull = true;    // Should compile
```

---

## 10. Open Questions

1. **Q:** Should we create a database view or function for participant counts?
   - **A:** Yes, for performance - PostgreSQL can optimize count aggregations better than application code

2. **Q:** Do we need CompEventWithCounts or can clients just use CompEventSummary and fetch counts separately?
   - **A:** Keep it - single query for counts is more efficient than separate call

3. **Q:** Should mappers throw errors if expected data is missing, or return partial data?
   - **A:** Throw errors - fail fast is better than silent data corruption

4. **Q:** How do we handle events where we need participants for some events but not others?
   - **A:** Add per-event loading in future enhancement; for now, all-or-nothing at query level

---

## 11. Checklist
- [ ] Create CompEventSummary, CompEventWithCounts types
- [ ] Update shared/index.ts exports
- [ ] Create validation schemas
- [ ] Implement mapEventRowToSummary
- [ ] Implement mapEventRowToEventWithCounts
- [ ] Update mapEventRowToCompEvent to require participants
- [ ] Deprecate mapEventRowEnrichedToCompEvent
- [ ] Create getCompetitionEventsWithParticipants DAL function
- [ ] Create getCompetitionEventsWithCounts DAL function
- [ ] Rename existing DAL to getCompetitionEventSummaries
- [ ] Create database function for count aggregation
- [ ] Update competition.getEvents router
- [ ] Update event router endpoints
- [ ] Write unit tests for all mapper variants
- [ ] Write integration tests for all data levels
- [ ] Create client migration guide
- [ ] Update client code
- [ ] Remove deprecated mapper after transition period
- [ ] Update documentation
- [ ] RAG embeddings refreshed
