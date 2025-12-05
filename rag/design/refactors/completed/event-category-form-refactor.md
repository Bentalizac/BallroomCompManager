# Refactor Proposal: Event Category Form Refactor

## 1. Summary
**Purpose:**  
Refactor the client-side event creation form to use `DanceStyle` and `Level` enums directly instead of fetching categories from a database table, aligning with the modified `EventCategory` discriminated union type definition.

**Status:**  
- Completed (2025-12-05)

**Owner:**  
- WARP Agent / Development Team

---

## 2. Motivation
The current implementation has a mismatch between the domain model and the UI:

- The `EventCategory` type in `shared/data/enums/eventTypes.ts` is defined as a discriminated union with `style` (DanceStyle) and `level` (BallroomLevel | WCSLevel | CountrySwingLevel | OtherLevel)
- The create event form currently fetches categories from an `event_categories` database table using `categoryId`
- This creates a disconnect between the type-safe domain model and the database-driven UI
- The form doesn't reflect the true structure of `EventCategory` which should be composed of style + level combinations
- Maintainability issues: adding new dance styles or levels requires database migrations instead of just updating enum definitions

---

## 3. Scope
**Modules affected:**
- **Client**: `client/components/competitions/CreateEventForm.tsx`
- **Client**: `client/hooks/useData.ts` (remove `useEventCategories` hook)
- **Server**: `server/src/trpc/routers/event.ts` (update event creation endpoint)
- **Server**: `server/src/trpc/routers/data.ts` (remove or deprecate `getEventCategories` endpoint)
- **Server**: `server/src/dal/event.ts` (update event creation logic)
- **Server**: `server/src/mappers/eventMapper.ts` (update mapping logic if needed)
- **Shared**: May need to add validation schemas for all level enums

**Types of changes:**
- UI component restructuring (cascade dropdown: style → level)
- API endpoint parameter changes (from `categoryId: UUID` to `category: EventCategory`)
- Remove database dependency on `event_categories` table (or deprecate for existing events)
- Update validation schemas

**What is NOT included:**
- Database schema changes for existing events (migration strategy separate)
- Changes to how events are displayed or filtered
- Changes to event registration flow

---

## 4. Current State

### Frontend
- Form uses `useEventCategories()` hook to fetch categories from database
- Form has single dropdown for category selection by ID
- Form submits `categoryId: string` to backend
- Located in `client/components/competitions/CreateEventForm.tsx`

### Backend
- `event.create` endpoint accepts `categoryId: z.string().uuid()`
- Uses `EventDAL.getOrCreateCategoryRuleset()` to link category + ruleset
- Database has `event_categories` table and `category_ruleset` junction table
- Current schema stores event category as foreign key reference

### Domain Model
```typescript
// shared/data/enums/eventTypes.ts
export type EventCategory =
  | { style: DanceStyle.Ballroom | ...; level: BallroomLevel }
  | { style: DanceStyle.WestCoast; level: WCSLevel }
  | { style: DanceStyle.CountrySwing; level: CountrySwingLevel }
  | { style: DanceStyle.Other; level: OtherLevel };

export enum DanceStyle {
  Ballroom = "ballroom",
  Latin = "latin",
  Smooth = "smooth",
  Rhythm = "rhythm",
  WestCoast = "west_coast",
  CountrySwing = "country_swing",
  Other = "other",
}

export enum BallroomLevel {
  Newcomer = "newcomer",
  Bronze = "bronze",
  // ...
}
```

---

## 5. Proposed Changes

### 5.1 Shared Package Updates

**File: `shared/validation/zodEnums.ts`**
- Add Zod schemas for `WCSLevel`, `CountrySwingLevel`, `OtherLevel` enums
- Create discriminated union schema for `EventCategory`:

```typescript
export const WCSLevelSchema = z.nativeEnum(WCSLevel);
export const CountrySwingLevelSchema = z.nativeEnum(CountrySwingLevel);
export const OtherLevelSchema = z.nativeEnum(OtherLevel);

export const EventCategorySchema = z.discriminatedUnion("style", [
  z.object({
    style: z.enum([DanceStyle.Ballroom, DanceStyle.Latin, DanceStyle.Smooth, DanceStyle.Rhythm]),
    level: BallroomLevelSchema
  }),
  z.object({
    style: z.literal(DanceStyle.WestCoast),
    level: WCSLevelSchema
  }),
  z.object({
    style: z.literal(DanceStyle.CountrySwing),
    level: CountrySwingLevelSchema
  }),
  z.object({
    style: z.literal(DanceStyle.Other),
    level: OtherLevelSchema
  })
]);
```

**File: `shared/index.ts`**
- Export new level schemas and `EventCategorySchema`

### 5.2 Client Updates

**File: `client/components/competitions/CreateEventForm.tsx`**

Changes:
1. Remove `useEventCategories()` hook dependency
2. Replace single category dropdown with cascading dropdowns:
   - First dropdown: Select `DanceStyle` 
   - Second dropdown: Select appropriate level based on style (BallroomLevel, WCSLevel, etc.)
3. Update form state from `categoryId: string` to `category: { style: string, level: string } | null`
4. Update `generateEventName()` to use style + level instead of category name
5. Update form submission to send `category: EventCategory` object

Example UI flow:
```
[Select Dance Style ▼]  [Select Level ▼]
 - Ballroom              - Newcomer
 - Latin                 - Bronze
 - Smooth                - Silver
 - Rhythm                ...
 - West Coast
```

When user selects "West Coast", the level dropdown updates to show WCS-specific levels.

**File: `client/hooks/useData.ts`**
- Remove or comment out `useEventCategories()` hook (to be fully removed after backend deprecation)

### 5.3 Server Updates

**File: `server/src/trpc/routers/event.ts`**

Update `create` endpoint input schema:
```typescript
create: authedProcedure
  .input(
    z.object({
      competitionId: z.string().uuid(),
      name: z.string().min(1, "Event name is required"),
      startDate: z.date().nullable(),
      endDate: z.date().nullable(),
      category: EventCategorySchema,  // Changed from categoryId
      rulesetId: z.string().uuid(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    // Implementation changes below
  })
```

Update mutation logic:
- Accept `input.category` instead of `input.categoryId`
- Update `EventDAL.getOrCreateCategoryRuleset()` to accept EventCategory object or deprecate entirely
- May need to restructure how category is stored (see database strategy)

**File: `server/src/dal/event.ts`**
- Update or create function to handle EventCategory object
- Decision needed: 
  - Option A: Store as JSONB column in events table
  - Option B: Keep category_ruleset table but populate it differently
  - Option C: Serialize to string like "ballroom-bronze"

**File: `server/src/trpc/routers/data.ts`**
- Mark `getEventCategories` endpoint as deprecated (add comment)
- Can remove in future phase after all clients updated

**File: `server/src/mappers/eventMapper.ts`**
- Update mapper to construct EventCategory from database representation
- Ensure CompEvent.category maps correctly to discriminated union

---

## 6. Benefits

- **Type Safety**: Form directly uses the same enums as the domain model
- **Maintainability**: Adding new styles/levels only requires updating enums, no database changes
- **User Experience**: Cascading dropdown provides better context and prevents invalid combinations
- **Reduced Database Calls**: No need to fetch category list on every form load
- **Alignment**: Client code aligns with the canonical EventCategory definition in shared
- **Simplified Architecture**: Removes unnecessary database table and API endpoint

---

## 7. Risks & Tradeoffs

**Risks:**
- **Breaking Change**: API contract change from `categoryId` to `category` object
- **Database Migration**: Existing events may reference old category IDs
- **Backward Compatibility**: Need strategy for reading old events
- **Coordination**: Client and server must be updated together

**Tradeoffs:**
- Increased client-side code complexity (cascading dropdown logic)
- May need database migration for existing events
- Event category becomes less flexible (can't add arbitrary categories without code change)

---

## 8. Migration Plan

### Phase 1: Backend Preparation (Can be done independently)
1. Add EventCategorySchema to shared/validation
2. Update server DAL to support both categoryId (old) and category object (new)
3. Deploy server with dual support

### Phase 2: Frontend Update
1. Update CreateEventForm to use new cascade dropdowns
2. Update form to submit category object
3. Remove useEventCategories hook call
4. Test thoroughly in development

### Phase 3: Backend Cleanup (After all clients updated)
1. Remove categoryId support from API
2. Deprecate getEventCategories endpoint
3. Document event_categories table as legacy (don't delete yet - needed for existing events)

### Backward Compatibility Strategy
- Existing events in database still reference categoryId in category_ruleset table
- Mapper reads old format and constructs EventCategory object
- Only new events use new format
- Consider data migration script to backfill EventCategory for old events (optional)

---

## 9. Test Strategy

**Unit Tests:**
- Test EventCategorySchema validation with valid/invalid inputs
- Test cascading dropdown logic (style selection updates available levels)
- Test form validation with new category structure

**Integration Tests:**
- Test event creation with all dance style + level combinations
- Test that events created with new format are correctly read back
- Test backward compatibility: old events still render correctly

**Manual Testing:**
- Create events with each dance style
- Verify level dropdown updates appropriately
- Verify event name auto-generation works
- Test form validation (all fields required)

---

## 10. Open Questions

1. **Database Storage Strategy**: How should we store EventCategory in the database?
   - JSONB column: `{ "style": "ballroom", "level": "bronze" }`
   - String serialization: `"ballroom-bronze"`
   - Keep current category_ruleset approach but populate differently?

2. **Migration of Existing Events**: Should we backfill EventCategory for existing events?
   - If yes, need mapping from old category names to style+level
   - If no, need robust fallback in mapper

3. **Category Names**: Should we keep generating display names like "Ballroom Bronze" or let UI compose them?
   - Current `generateEventName()` concatenates category.name + ruleset.name
   - New approach: concatenate style + level + ruleset?

4. **Deprecation Timeline**: How long should we maintain backward compatibility?
   - Immediate breaking change vs. graceful deprecation period?

---

## 11. Checklist
- [x] Add level enum schemas to shared/validation/zodEnums.ts
- [x] Create EventCategorySchema in shared/validation
- [x] Export new schemas from shared/index.ts
- [x] Update CreateEventForm with cascading dropdowns
- [x] Update form state and submission logic
- [x] Remove useEventCategories hook usage
- [x] Update event.create endpoint input schema
- [x] Update EventDAL to handle category object (added getCategoryRulesetFromEventCategory)
- [x] Update eventMapper if needed (no changes needed, existing mapper handles it)
- [ ] Add unit tests for new validation schemas
- [ ] Add integration tests for event creation
- [x] Update documentation (this proposal document)
- [ ] Manual testing of all dance styles (requires dev server testing)
- [ ] RAG embeddings refreshed

## 12. Implementation Notes

### Completed Changes (2025-12-05)

**Shared Package:**
- Added `WCSLevelSchema`, `CountrySwingLevelSchema`, `OtherLevelSchema` to `shared/validation/zodEnums.ts`
- Created `EventCategorySchema` as a discriminated union for type-safe validation
- Exported all new schemas and `OtherLevel` enum from `shared/index.ts`
- Successfully built shared package with all TypeScript types intact

**Client:**
- Refactored `CreateEventForm.tsx` to use cascading dropdowns:
  - First dropdown: DanceStyle selection
  - Second dropdown: Level selection (dynamically populated based on style)
  - Level dropdown is disabled until style is selected
- Removed dependency on `useEventCategories()` hook
- Updated form state from `categoryId: string` to `style: string` and `level: string`
- Updated validation to check both style and level
- Updated event name auto-generation to use style + level + ruleset
- Form now submits `EventCategory` object instead of `categoryId`
- Client builds successfully with no TypeScript errors related to changes

**Server:**
- Updated `event.create` endpoint in `server/src/trpc/routers/event.ts`:
  - Changed input schema from `categoryId: z.string().uuid()` to `category: EventCategorySchema`
  - Imported `EventCategorySchema` from shared package
- Added new DAL function `getCategoryRulesetFromEventCategory()` in `server/src/dal/event.ts`:
  - Converts EventCategory object to category_ruleset_id for database storage
  - Finds or creates dance_styles, event_levels, event_categories, and category_ruleset entries
  - Maintains backward compatibility with existing database schema
- Fixed column name issues (`dance_style` and `event_level` instead of `dance_styles_id` and `event_levels_id`)
- Server DAL compiles successfully (remaining errors are pre-existing issues unrelated to this refactor)

### Database Strategy
- Kept existing database schema for backward compatibility
- New EventCategory objects are converted to the existing table structure
- Database tables automatically populated as needed (dance_styles, event_levels, event_categories, category_ruleset)
- Existing events continue to work without migration
- Future: Consider data migration to backfill EventCategory for old events

### Testing Status
- TypeScript compilation: ✅ Shared and server compile successfully
- Client build: ✅ Builds successfully (linting warnings unrelated to refactor)
- Manual testing: ⏳ Pending (requires starting dev servers)
- Unit tests: ⏳ To be added
- Integration tests: ⏳ To be added
