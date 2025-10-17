-- Migration: Introduce event_entry system for team/pair registrations
-- This replaces the individual comp_participant_id references in event_registration
-- with a team-based event_entry system

-- First, create the new event_entry table
CREATE TABLE "public"."event_entry" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "event_info_id" uuid NOT NULL,
    "entry_name" text, -- Optional team/pair name (e.g., "Smith & Jones")
    "entry_type" text NOT NULL DEFAULT 'individual', -- 'individual', 'pair', 'team'
    "registration_status" text NOT NULL DEFAULT 'active',
    "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Create junction table for event_entry participants
CREATE TABLE "public"."event_entry_participant" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "event_entry_id" uuid NOT NULL,
    "comp_participant_id" uuid NOT NULL,
    "role" text NOT NULL, -- 'competitor', 'judge', 'scrutineer'
    "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Add constraints and indexes for event_entry
ALTER TABLE "public"."event_entry" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX event_entry_pkey ON public.event_entry USING btree (id);
ALTER TABLE "public"."event_entry" ADD CONSTRAINT "event_entry_pkey" PRIMARY KEY USING INDEX "event_entry_pkey";

ALTER TABLE "public"."event_entry" ADD CONSTRAINT "fk_event_entry_event" 
    FOREIGN KEY (event_info_id) REFERENCES event_info(id) ON DELETE CASCADE;

ALTER TABLE "public"."event_entry" ADD CONSTRAINT "entry_type_check" 
    CHECK ((entry_type = ANY (ARRAY['individual'::text, 'pair'::text, 'team'::text])));

-- Add constraints and indexes for event_entry_participant
ALTER TABLE "public"."event_entry_participant" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX event_entry_participant_pkey ON public.event_entry_participant USING btree (id);
ALTER TABLE "public"."event_entry_participant" ADD CONSTRAINT "event_entry_participant_pkey" PRIMARY KEY USING INDEX "event_entry_participant_pkey";

-- Ensure no duplicate participants in same entry
CREATE UNIQUE INDEX uq_entry_participant ON public.event_entry_participant USING btree (event_entry_id, comp_participant_id);
ALTER TABLE "public"."event_entry_participant" ADD CONSTRAINT "uq_entry_participant" UNIQUE USING INDEX "uq_entry_participant";

ALTER TABLE "public"."event_entry_participant" ADD CONSTRAINT "fk_entry_participant_entry" 
    FOREIGN KEY (event_entry_id) REFERENCES event_entry(id) ON DELETE CASCADE;

ALTER TABLE "public"."event_entry_participant" ADD CONSTRAINT "fk_entry_participant_comp_participant" 
    FOREIGN KEY (comp_participant_id) REFERENCES comp_participant(id) ON DELETE CASCADE;

ALTER TABLE "public"."event_entry_participant" ADD CONSTRAINT "entry_participant_role_check" 
    CHECK ((role = ANY (ARRAY['competitor'::text, 'judge'::text, 'scrutineer'::text])));

-- Migrate existing event_registration data to the new system
-- Step 1: Create event_entries for individual competitors and judges
INSERT INTO event_entry (id, event_info_id, entry_name, entry_type, registration_status, created_at)
SELECT 
    gen_random_uuid() as id,
    er.event_info_id,
    CASE 
        WHEN er.partner_id IS NULL THEN NULL -- Individual entries don't need names
        ELSE 'Team ' || ROW_NUMBER() OVER (PARTITION BY er.event_info_id ORDER BY er.id) -- Generate team names for pairs
    END as entry_name,
    CASE 
        WHEN er.partner_id IS NULL THEN 'individual'
        ELSE 'pair'
    END as entry_type,
    er.registration_status,
    NOW() as created_at
FROM event_registration er
WHERE er.partner_id IS NULL OR er.id < er.partner_id; -- Only create one entry per pair

-- Step 2: Create a temporary mapping table to track the new event_entry IDs
CREATE TEMP TABLE entry_mapping AS
SELECT 
    er.id as old_registration_id,
    ee.id as new_entry_id,
    er.partner_id,
    er.comp_participant_id,
    er.role
FROM event_registration er
JOIN event_entry ee ON (
    ee.event_info_id = er.event_info_id 
    AND (
        (er.partner_id IS NULL AND ee.entry_type = 'individual') 
        OR (er.partner_id IS NOT NULL AND ee.entry_type = 'pair')
    )
)
WHERE er.partner_id IS NULL OR er.id < er.partner_id;

-- Step 3: Add mapping for partner registrations
INSERT INTO entry_mapping (old_registration_id, new_entry_id, partner_id, comp_participant_id, role)
SELECT 
    er.id as old_registration_id,
    em.new_entry_id,
    er.partner_id,
    er.comp_participant_id,
    er.role
FROM event_registration er
JOIN entry_mapping em ON em.old_registration_id = er.partner_id
WHERE er.partner_id IS NOT NULL;

-- Step 4: Create event_entry_participant records
INSERT INTO event_entry_participant (event_entry_id, comp_participant_id, role)
SELECT DISTINCT
    em.new_entry_id,
    em.comp_participant_id,
    em.role
FROM entry_mapping em;

-- Step 5: Update event_registration to reference event_entry instead of comp_participant
-- First, add the new column
ALTER TABLE "public"."event_registration" ADD COLUMN "event_entry_id" uuid;

-- Populate the new column
UPDATE event_registration 
SET event_entry_id = em.new_entry_id
FROM entry_mapping em 
WHERE event_registration.id = em.old_registration_id;

-- Make the new column required
ALTER TABLE "public"."event_registration" ALTER COLUMN "event_entry_id" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "public"."event_registration" ADD CONSTRAINT "fk_event_registration_entry" 
    FOREIGN KEY (event_entry_id) REFERENCES event_entry(id) ON DELETE CASCADE;

-- Step 6: Remove old columns and constraints from event_registration
-- Drop the partner_id constraint first
ALTER TABLE "public"."event_registration" DROP CONSTRAINT IF EXISTS "fk_event_registration_partner";

-- Drop the old foreign key to comp_participant
ALTER TABLE "public"."event_registration" DROP CONSTRAINT IF EXISTS "fk_er_participant";

-- Drop the unique constraint on comp_participant_id and event_info_id
ALTER TABLE "public"."event_registration" DROP CONSTRAINT IF EXISTS "uq_event_participant";

-- Remove the old columns
ALTER TABLE "public"."event_registration" DROP COLUMN "comp_participant_id";
ALTER TABLE "public"."event_registration" DROP COLUMN "partner_id";

-- Step 7: Update event_results to maintain the connection
-- event_results should still reference event_registration records, which now reference event_entries
-- No changes needed here since the relationship chain is maintained

-- Step 8: Add RLS policies for the new tables
-- Event entry policies - similar to event_registration
CREATE POLICY "Public can view active entries"
ON "public"."event_entry"
AS PERMISSIVE
FOR SELECT
TO PUBLIC
USING ((registration_status = 'active'::text));

CREATE POLICY "Admins can modify entries"
ON "public"."event_entry"
AS PERMISSIVE
FOR ALL
TO PUBLIC
USING ((EXISTS ( SELECT 1
   FROM event_info ei
   JOIN competition_admins ca ON ca.comp_id = ei.comp_id
  WHERE ei.id = event_entry.event_info_id 
    AND ca.user_id = auth.uid()
)));

CREATE POLICY "Participants can view their entries"
ON "public"."event_entry"
AS PERMISSIVE
FOR SELECT
TO PUBLIC
USING ((EXISTS ( SELECT 1
   FROM event_entry_participant eep
   JOIN comp_participant cp ON cp.id = eep.comp_participant_id
  WHERE eep.event_entry_id = event_entry.id 
    AND cp.user_id = auth.uid()
)));

-- Event entry participant policies
CREATE POLICY "Public can view entry participants"
ON "public"."event_entry_participant"
AS PERMISSIVE
FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "Admins can modify entry participants"
ON "public"."event_entry_participant"
AS PERMISSIVE
FOR ALL
TO PUBLIC
USING ((EXISTS ( SELECT 1
   FROM event_entry ee
   JOIN event_info ei ON ei.id = ee.event_info_id
   JOIN competition_admins ca ON ca.comp_id = ei.comp_id
  WHERE ee.id = event_entry_participant.event_entry_id 
    AND ca.user_id = auth.uid()
)));

-- Drop the temp table
DROP TABLE entry_mapping;

-- Add helpful comment
COMMENT ON TABLE event_entry IS 'Represents a team/pair/individual entry in an event. Replaces direct comp_participant references.';
COMMENT ON TABLE event_entry_participant IS 'Junction table linking event entries to their participant members.';