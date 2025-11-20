# Refactor Proposal: Database Schema Alignment with Domain Model

## 1. Summary
**Purpose:**  
Align database schema for `comp_info` and `venue` tables with the updated domain model from the Type System Unification refactor. Ensure database structure matches the canonical domain types defined in `shared/`.

**Status:**  
- Proposed

**Owner:**  
- TBD

---

## 2. Motivation
The Type System Unification refactor (ADR-004) established domain types as the canonical source of truth. However, the database schema may not fully align with the updated domain model:

**Domain model changes:**
- `Competition` now includes `timeZone: string` field (IANA time zone identifier)
- `Competition.venue` changed from `location: Venue` to `venue: Venue | null`
- `Venue` structure includes `id: string`, `name: string`, `address: Address | null`, `floors?: DanceFloor[]`

**Current database schema (assumed):**
- `comp_info.time_zone` - likely exists (used in queries), verify data type
- `comp_info.venue_id` - foreign key to `venue` table
- `venue` table structure - needs verification against domain `Venue` type
- Potential mismatch: venue stores `city`, `state` at top level, but domain expects structured `Address`

**Pain points:**
- Venue mapper creates temporary Address from city/state fields
- Inconsistency between flat venue storage (city, state) and structured domain (Address)
- Need to verify timeZone field exists and has correct constraints

---

## 3. Scope
**Modules affected:**
- Database schema: `comp_info`, `venue`, possibly `address` tables
- Migration scripts
- DAL queries in `server/src/dal/competition.ts` and `server/src/dal/venue.ts`
- Mappers in `server/src/mappers/venueMapper.ts`

**Types of changes:**
- Schema verification and documentation
- Possible schema migration if misalignments found
- Update queries to fetch complete address data
- Update mappers to handle proper address structure

**What is NOT included:**
- Changes to domain types (already complete)
- Changes to other tables unrelated to Competition/Venue

---

## 4. Current State

### Known Schema (from queries and mappers):

**comp_info table:**
```sql
-- Fields referenced in code:
id               uuid PRIMARY KEY
slug             text UNIQUE
name             text
start_date       date (or timestamp?)
end_date         date (or timestamp?)
time_zone        text (assumed - used in queries)
venue_id         uuid REFERENCES venue(id)
```

**venue table:**
```sql
-- Fields referenced in VenueRow type:
id               uuid PRIMARY KEY
name             text
city             text (nullable)
state            text (nullable)

-- Fields NOT currently fetched but in domain:
-- address structure?
-- floors relationship?
```

### Current Mapper Workaround:

`venueMapper.ts` creates a temporary Address structure:
```typescript
address: row.city && row.state ? {
  street1: "",
  city: row.city,
  state: row.state,
  postalCode: "",
  country: "USA",
} : null
```

This indicates the database doesn't store structured addresses.

---

## 5. Proposed Changes

### 5.1 Schema Investigation Phase

**Action items:**
1. Generate current schema documentation
   ```bash
   npm run db:generate-types
   ```

2. Review `supabase/migrations/` for existing schema
   - Check `comp_info` table definition
   - Check `venue` table definition
   - Check if `address` table exists

3. Verify timeZone field:
   - Data type (text vs varchar)
   - Constraints (valid IANA timezone check?)
   - Default value

4. Identify address storage approach:
   - Option A: Flat fields in venue (current: city, state)
   - Option B: Separate address table with foreign key
   - Option C: JSON column in venue table

### 5.2 Proposed Schema Changes

**Option A: Minimal Changes (Keep Flat Structure)**

If address data is optional and simple:
```sql
-- Add missing fields to venue table
ALTER TABLE venue
  ADD COLUMN IF NOT EXISTS street1 text,
  ADD COLUMN IF NOT EXISTS street2 text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'USA';

-- Ensure comp_info.time_zone exists with proper constraints
ALTER TABLE comp_info
  ALTER COLUMN time_zone SET NOT NULL,
  ALTER COLUMN time_zone SET DEFAULT 'UTC';
```

**Pros:** Simple migration, minimal data restructuring
**Cons:** Denormalized address data

**Option B: Normalized Address Table (Recommended)**

If addresses are shared or complex:
```sql
-- Create address table
CREATE TABLE IF NOT EXISTS address (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  street1 text NOT NULL,
  street2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'USA',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add address_id to venue, migrate data
ALTER TABLE venue
  ADD COLUMN address_id uuid REFERENCES address(id);

-- Migrate existing city/state to address table
-- (migration script needed)

-- Eventually drop old city/state columns
-- ALTER TABLE venue DROP COLUMN city, DROP COLUMN state;
```

**Pros:** Normalized, reusable addresses, supports full address data
**Cons:** More complex migration, additional joins in queries

**Option C: JSON Column**

```sql
ALTER TABLE venue
  ADD COLUMN address jsonb;

-- Migrate data
UPDATE venue
SET address = jsonb_build_object(
  'street1', '',
  'city', city,
  'state', state,
  'postalCode', '',
  'country', 'USA'
)
WHERE city IS NOT NULL AND state IS NOT NULL;
```

**Pros:** Flexible, schema-less address storage
**Cons:** Harder to query, validate, and index

### 5.3 Recommended Approach

**For Competition.timeZone:**
- Verify field exists and has text type
- Add constraint for valid IANA timezone (optional)
- Set default to 'UTC'

**For Venue.address:**
- **Recommend Option A (flat structure)** for Phase 1
- Addresses are simple (street, city, state, postal code)
- Can migrate to Option B later if addresses become shared/complex

### 5.4 Migration Script Template

```sql
-- Migration: Align venue schema with domain model
-- Date: 2025-11-20

BEGIN;

-- 1. Add address fields to venue (if not exists)
ALTER TABLE venue
  ADD COLUMN IF NOT EXISTS street1 text,
  ADD COLUMN IF NOT EXISTS street2 text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'USA';

-- 2. Ensure comp_info.time_zone is properly configured
ALTER TABLE comp_info
  ALTER COLUMN time_zone TYPE text,
  ALTER COLUMN time_zone SET DEFAULT 'UTC';

-- Note: Don't set NOT NULL on time_zone yet - need to backfill existing rows
UPDATE comp_info
SET time_zone = 'UTC'
WHERE time_zone IS NULL;

ALTER TABLE comp_info
  ALTER COLUMN time_zone SET NOT NULL;

-- 3. Create index for timezone queries (optional)
CREATE INDEX IF NOT EXISTS idx_comp_info_time_zone
  ON comp_info(time_zone);

COMMIT;
```

### 5.5 Update Venue Mapper

After migration, update `venueMapper.ts`:

```typescript
export function mapVenueRowToDTO(row: VenueRow): Venue {
  return {
    id: row.id,
    name: row.name,
    address: row.street1 && row.city && row.state ? {
      street1: row.street1,
      street2: row.street2 || undefined,
      city: row.city,
      state: row.state,
      postalCode: row.postal_code || "",
      country: row.country || "USA",
    } : null,
    floors: [], // TODO: Fetch from dance_floor table if relationship exists
  };
}
```

### 5.6 Update DAL Queries

Update `COMPETITION_FIELDS` in `dal/competition.ts`:

```typescript
const COMPETITION_FIELDS = `
  id,
  slug,
  name,
  start_date,
  end_date,
  time_zone,
  venue:venue_id (
    id,
    name,
    street1,
    street2,
    city,
    state,
    postal_code,
    country
  ),
  events:event_info (
    id,
    name,
    start_at,
    end_at,
    event_status,
    comp_id,
    category_ruleset_id
  )
` as const;
```

---

## 6. Benefits

1. **Schema-domain alignment**: Database structure matches canonical domain types
2. **Remove temporary workarounds**: Eliminate address construction in mapper
3. **Complete address support**: Enable full address data (street, postal code, country)
4. **TimeZone validation**: Ensure all competitions have valid time zones
5. **Better documentation**: Clear schema definition for developers

---

## 7. Risks & Tradeoffs

**Risks:**
- Data migration required for existing venues
- Potential downtime during migration (minimal if done carefully)
- Need to update all venue-related queries and mappers

**Tradeoffs:**
- Option A (flat structure) is simpler but less normalized
- Option B (normalized) is cleaner but more complex
- Adding NOT NULL constraint on time_zone requires backfilling

**Mitigation:**
- Test migration on staging/development database first
- Create rollback migration script
- Backfill time_zone before adding NOT NULL constraint
- Use transactions for atomic migration

---

## 8. Migration Plan

### Phase 1: Investigation (Week 1)
1. Generate and review current schema
2. Identify exact schema mismatches
3. Determine if address table already exists
4. Choose address storage approach (A, B, or C)

### Phase 2: Development (Week 1-2)
1. Write migration script
2. Write rollback script
3. Update DAL queries to fetch new fields
4. Update venue mapper to use real address data
5. Update VenueRow type definition

### Phase 3: Testing (Week 2)
1. Test migration on development database
2. Verify venue mapper returns correct Address structure
3. Test competition queries include complete venue data
4. Verify no breaking changes to API responses

### Phase 4: Deployment (Week 3)
1. Run migration on staging database
2. Verify staging environment
3. Schedule production migration
4. Run migration on production
5. Monitor for issues

### Backward Compatibility:
- If using Option A, old queries work until city/state are dropped
- Mappers handle both old and new address structures during transition
- Client receives same Venue shape regardless of migration status

---

## 9. Test Strategy

### Schema Tests:
```sql
-- Verify time_zone exists and is NOT NULL
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'comp_info' AND column_name = 'time_zone';

-- Verify venue has address fields
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'venue'
  AND column_name IN ('street1', 'city', 'state', 'postal_code', 'country');
```

### Integration Tests:
- Test that venues with addresses map correctly
- Test that venues without addresses return `address: null`
- Test that competitions include timeZone field
- Test that timeZone defaults to 'UTC' for new competitions

### Manual Verification:
```bash
# After migration, verify data
npm run db:start
psql $DATABASE_URL -c "SELECT id, name, street1, city, state FROM venue LIMIT 5;"
psql $DATABASE_URL -c "SELECT id, slug, time_zone FROM comp_info LIMIT 5;"
```

---

## 10. Open Questions

1. **Q:** Does an `address` table already exist in the schema?
   - **A:** Need to check migrations - if yes, use normalized approach

2. **Q:** Are addresses shared between venues or unique per venue?
   - **A:** If shared (e.g., multiple studios at same address), use Option B

3. **Q:** Do we need to support international addresses?
   - **A:** If yes, country field is important; consider address format variations

4. **Q:** Is there a `dance_floor` table for Venue.floors relationship?
   - **A:** Check schema - if not, floors array remains empty for now

5. **Q:** What's the current default for time_zone?
   - **A:** Verify with `SELECT DISTINCT time_zone FROM comp_info;`

---

## 11. Checklist
- [ ] Generate current schema documentation
- [ ] Review existing migrations
- [ ] Choose address storage approach
- [ ] Write migration script
- [ ] Write rollback script
- [ ] Update VenueRow type definition
- [ ] Update DAL queries
- [ ] Update venue mapper
- [ ] Test on development database
- [ ] Create integration tests
- [ ] Deploy to staging
- [ ] Deploy to production
- [ ] Update RAG embeddings
- [ ] Mark type-system-unification refactor as completed
