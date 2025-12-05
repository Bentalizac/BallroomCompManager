# Refactor Proposal: Flatten Event Category Schema

## 1. Summary
**Purpose:**  
Simplify the database schema by storing `dance_style_id` and `event_level_id` directly on the `event_info` table, eliminating the `event_categories` and `category_ruleset` junction tables. This aligns the database structure with the domain model where `EventCategory` is a value object, not an entity.

**Status:**  
- Proposed

**Owner:**  
- Development Team

---

## 2. Motivation

The current schema over-normalizes event categorization:

**Current Issues:**
- **Unnecessary indirection**: Events reference `category_ruleset_id`, which references `event_categories`, which references `dance_styles` and `event_levels`
- **Complex queries**: Every event query requires 3+ joins to get style and level information
- **Conceptual mismatch**: The domain model treats `EventCategory` as a simple value object `{style, level}`, but the database treats it as an entity requiring 2 junction tables
- **Maintenance overhead**: The DAL needs helper functions like `getCategoryRulesetFromEventCategory()` to navigate the junction tables
- **Performance impact**: Multiple joins for every event query
- **Confusion**: The abstraction adds cognitive load without providing value

**Domain Model Reality:**
```typescript
// EventCategory is just two attributes, not an entity
type EventCategory = {
  style: DanceStyle;
  level: BallroomLevel | WCSLevel | CountrySwingLevel | OtherLevel;
};
```

There's no business reason to treat "Ballroom Bronze" as a separate entity that needs its own ID and junction tables.

---

## 3. Scope

**Modules affected:**
- **Database**: Schema migration to flatten structure
- **Server DAL**: Simplify event queries and mutations (`server/src/dal/event.ts`)
- **Server Mappers**: Update `mapEventRowEnrichedToCompEvent` to use direct columns
- **Server Router**: Simplify event creation logic in `server/src/trpc/routers/event.ts`

**Types of changes:**
- Database schema: Add columns, migrate data, drop tables
- Query simplification: Remove complex joins
- Code removal: Delete junction table helper functions

**What is NOT included:**
- Changes to domain types (EventCategory stays the same)
- Changes to client code (already uses EventCategory correctly)
- Changes to API contracts (tRPC inputs/outputs unchanged)

---

## 4. Current State

### Current Schema
```
event_info
├── category_ruleset_id → category_ruleset
│   ├── category_id → event_categories
│   │   ├── dance_styles_id → dance_styles
│   │   └── event_levels_id → event_levels
│   └── ruleset_id → rulesets
```

### Current Query Pattern
```typescript
// Requires joining 4 tables to get style and level
const EVENT_FIELDS_ENRICHED = `
  id, name, comp_id,
  category_ruleset:category_ruleset_id (
    event_category:category_id (
      dance_style:dance_styles_id (name),
      event_level:event_levels_id (name)
    ),
    ruleset:ruleset_id (...)
  )
`;
```

### Current Event Creation
1. Look up `dance_style_id` from `dance_styles` by name
2. Look up `event_level_id` from `event_levels` by name
3. Get or create `event_category` entry for (style, level) pair
4. Get or create `category_ruleset` entry for (category, ruleset) pair
5. Finally create event with `category_ruleset_id`

---

## 5. Proposed Changes

### New Schema
```
event_info
├── dance_style_id → dance_styles
├── event_level_id → event_levels
└── ruleset_id → rulesets
```

### Migration Steps

#### Step 1: Add New Columns
```sql
-- Add new columns (nullable initially for migration)
ALTER TABLE event_info 
  ADD COLUMN dance_style_id UUID REFERENCES dance_styles(id),
  ADD COLUMN event_level_id UUID REFERENCES event_levels(id),
  ADD COLUMN ruleset_id UUID REFERENCES rulesets(id);
```

#### Step 2: Migrate Existing Data
```sql
-- Populate new columns from existing relationships
UPDATE event_info e
SET 
  dance_style_id = ec.dance_styles_id,
  event_level_id = ec.event_levels_id,
  ruleset_id = cr.ruleset_id
FROM category_ruleset cr
JOIN event_categories ec ON cr.category_id = ec.id
WHERE e.category_ruleset_id = cr.id;
```

#### Step 3: Add Constraints
```sql
-- Make new columns non-nullable
ALTER TABLE event_info 
  ALTER COLUMN dance_style_id SET NOT NULL,
  ALTER COLUMN event_level_id SET NOT NULL,
  ALTER COLUMN ruleset_id SET NOT NULL;

-- Add indexes for lookups
CREATE INDEX idx_event_info_dance_style ON event_info(dance_style_id);
CREATE INDEX idx_event_info_event_level ON event_info(event_level_id);
CREATE INDEX idx_event_info_ruleset ON event_info(ruleset_id);

-- Optional: Composite index for category queries
CREATE INDEX idx_event_info_category ON event_info(dance_style_id, event_level_id);
```

#### Step 4: Drop Old Structure
```sql
-- Remove old column
ALTER TABLE event_info DROP COLUMN category_ruleset_id;

-- Drop junction tables (cascades will fail if there are other dependencies)
DROP TABLE category_ruleset;
DROP TABLE event_categories;
```

### Updated Query Pattern
```typescript
// Direct joins - much simpler!
const EVENT_FIELDS_ENRICHED = `
  id, name, comp_id,
  dance_style:dance_style_id (id, name),
  event_level:event_level_id (id, name),
  ruleset:ruleset_id (id, name, scoring_method:scoring_method_id (...))
`;
```

### Simplified Event Creation
```typescript
export async function createEvent(
  supabase: SupabaseClientType,
  category: EventCategory,
  rulesetId: string,
  eventData: { name: string; comp_id: string; ... }
): Promise<any> {
  // 1. Look up dance_style_id
  const { data: danceStyle } = await supabase
    .from("dance_styles")
    .select("id")
    .eq("name", category.style)
    .single();

  // 2. Look up event_level_id
  const { data: eventLevel } = await supabase
    .from("event_levels")
    .select("id")
    .eq("name", category.level)
    .single();

  // 3. Create event directly - no junction tables!
  return await supabase
    .from("event_info")
    .insert({
      ...eventData,
      dance_style_id: danceStyle.id,
      event_level_id: eventLevel.id,
      ruleset_id: rulesetId,
    })
    .select(EVENT_FIELDS_ENRICHED)
    .single();
}
```

### Code to Delete
- `getOrCreateEventCategory()` in `server/src/dal/event.ts`
- `getOrCreateCategoryRuleset()` in `server/src/dal/event.ts`
- `getCategoryRulesetFromEventCategory()` in `server/src/dal/event.ts`

### Code to Update
- `createEvent()` - simplified to direct insertion
- `getCompetitionEventsEnriched()` - simplified query
- `getEventByIdEnriched()` - simplified query
- `mapEventRowEnrichedToCompEvent()` - updated field paths

---

## 6. Benefits

1. **Simpler schema**: 3 direct FKs instead of 2 junction tables
2. **Fewer joins**: Event queries go from 4 joins to 2 joins
3. **Better performance**: Direct lookups via indexed FKs
4. **Less code**: Remove ~80 lines of junction table helpers
5. **Clearer semantics**: Schema matches domain model
6. **Easier to reason about**: Direct relationships are intuitive
7. **Future flexibility**: Easy to add event-specific overrides (e.g., custom level names)

**Performance Impact:**
- Current: `event_info` → `category_ruleset` → `event_categories` → `dance_styles`, `event_levels`
- Proposed: `event_info` → `dance_styles`, `event_levels`
- **~50% fewer joins** for every event query

---

## 7. Risks & Tradeoffs

**Risks:**
- **Migration complexity**: Must carefully migrate existing data
- **Rollback difficulty**: Once junction tables are dropped, rollback requires data reconstruction
- **Downtime**: Migration may require brief service interruption

**Tradeoffs:**
- **Lose "category as entity" abstraction**: If we ever need to store metadata about a (style, level) combination, we'd need to add it back (unlikely)
- **Duplicate lookup calls**: Event creation now has 2 lookup queries instead of navigating junction tables (negligible impact, clearer code)

**Mitigation:**
- Test migration thoroughly on staging data
- Take database backup before migration
- Consider blue-green deployment for zero downtime

---

## 8. Migration Plan

### Phase 1: Preparation (No Downtime)
1. Review proposal with team
2. Create migration script
3. Test migration on local development database
4. Test migration on staging database with production data copy
5. Verify all event queries work correctly after migration

### Phase 2: Code Changes (No Downtime)
1. Update DAL functions to use new schema
2. Update mappers to use direct field paths
3. Remove junction table helper functions
4. Deploy code that works with BOTH old and new schema (read from new columns, fall back to old)

### Phase 3: Migration (Brief Downtime - Recommended)
1. Enable maintenance mode or schedule during low-traffic window
2. Run migration script:
   - Add new columns
   - Migrate data
   - Add constraints
   - Verify data integrity
3. Deploy new code that only uses new schema
4. Drop old tables
5. Disable maintenance mode

### Phase 4: Validation
1. Monitor error logs for any issues
2. Verify event creation works
3. Verify event queries return correct data
4. Performance testing to confirm join reduction benefits

**Rollback Plan:**
If issues arise before dropping old tables:
1. Revert to previous code version
2. Old schema still exists, system works as before

If issues arise after dropping old tables:
1. Cannot rollback without data loss
2. Must fix forward or restore from backup

---

## 9. Test Strategy

### Pre-Migration Tests
- [ ] Verify migration script on empty database
- [ ] Verify migration script on database with sample events
- [ ] Verify migration script on production data copy

### Post-Migration Tests
- [ ] Unit tests for updated DAL functions
- [ ] Integration tests for event creation with each dance style
- [ ] Integration tests for event queries return correct category data
- [ ] Manual verification: Create events with different style/level combinations
- [ ] Manual verification: Query events and verify correct style/level display
- [ ] Performance testing: Compare query execution times before/after

### Data Integrity Checks
```sql
-- Verify all events have valid dance_style_id
SELECT COUNT(*) FROM event_info WHERE dance_style_id IS NULL;

-- Verify all events have valid event_level_id  
SELECT COUNT(*) FROM event_info WHERE event_level_id IS NULL;

-- Verify all events have valid ruleset_id
SELECT COUNT(*) FROM event_info WHERE ruleset_id IS NULL;

-- Verify referential integrity
SELECT COUNT(*) FROM event_info e
LEFT JOIN dance_styles ds ON e.dance_style_id = ds.id
WHERE ds.id IS NULL;
```

---

## 10. Open Questions

1. **Downtime tolerance**: Can we tolerate 5-10 minutes of downtime, or must migration be zero-downtime?
   - Zero-downtime is possible but requires dual-write strategy during transition

2. **Historical data**: Do we need to preserve `event_categories` and `category_ruleset` tables for historical analytics?
   - If yes, consider renaming to `deprecated_*` instead of dropping

3. **RLS policies**: Are there Row Level Security policies on the junction tables that need to be migrated?
   - Need to audit `category_ruleset` and `event_categories` for RLS

---

## 11. Checklist
- [ ] Proposal reviewed and approved by team
- [ ] Migration script created
- [ ] Migration tested on local database
- [ ] Migration tested on staging database
- [ ] DAL functions updated
- [ ] Mapper functions updated
- [ ] Junction table helpers removed
- [ ] Unit tests updated
- [ ] Integration tests pass
- [ ] Performance tests show improvement
- [ ] Migration deployed to production
- [ ] Old tables dropped
- [ ] Documentation updated
- [ ] RAG embeddings refreshed
