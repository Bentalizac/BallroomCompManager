-- Fix RLS policies for competition-related tables

-- Drop existing policies that are causing issues
drop policy if exists "Authenticated users can create competitions" on "public"."comp_info";
drop policy if exists "Competition admins can update competitions" on "public"."comp_info";
drop policy if exists "Competition admins can delete competitions" on "public"."comp_info";
drop policy if exists "Authenticated users can create admin records" on "public"."competition_admins";
drop policy if exists "Competition admins can manage admins" on "public"."competition_admins";

-- ============================================================================
-- COMP_INFO (competitions) policies - CORRECTED
-- ============================================================================

-- Allow authenticated users to create competitions (no column reference needed)
create policy "Authenticated users can create competitions"
on "public"."comp_info"
as permissive
for insert
to authenticated
with check (true);

-- Allow competition admins to update competitions
create policy "Competition admins can update competitions"
on "public"."comp_info"
as permissive
for update
to authenticated
using (EXISTS (
  SELECT 1 FROM competition_admins ca 
  WHERE ca.user_id = auth.uid() AND ca.comp_id = comp_info.id
))
with check (EXISTS (
  SELECT 1 FROM competition_admins ca 
  WHERE ca.user_id = auth.uid() AND ca.comp_id = comp_info.id
));

-- Allow competition admins to delete competitions
create policy "Competition admins can delete competitions"
on "public"."comp_info"
as permissive
for delete
to authenticated
using (EXISTS (
  SELECT 1 FROM competition_admins ca 
  WHERE ca.user_id = auth.uid() AND ca.comp_id = comp_info.id
));

-- ============================================================================
-- COMPETITION_ADMINS policies - CORRECTED
-- ============================================================================

-- Allow authenticated users to create admin records when creating competitions
create policy "Authenticated users can create admin records"
on "public"."competition_admins"
as permissive
for insert
to authenticated
with check (true);

-- Allow admins to manage other admins for their competitions
create policy "Competition admins can manage admins"
on "public"."competition_admins"
as permissive
for update
to authenticated
using (EXISTS (
  SELECT 1 FROM competition_admins ca 
  WHERE ca.user_id = auth.uid() AND ca.comp_id = competition_admins.comp_id
))
with check (EXISTS (
  SELECT 1 FROM competition_admins ca 
  WHERE ca.user_id = auth.uid() AND ca.comp_id = competition_admins.comp_id
));

create policy "Competition admins can delete admin records"
on "public"."competition_admins"
as permissive
for delete
to authenticated
using (EXISTS (
  SELECT 1 FROM competition_admins ca 
  WHERE ca.user_id = auth.uid() AND ca.comp_id = competition_admins.comp_id
));