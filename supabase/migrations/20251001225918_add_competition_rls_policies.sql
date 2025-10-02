-- Add RLS policies for competition-related tables

-- ============================================================================
-- COMP_INFO (competitions) policies
-- ============================================================================

-- Allow public read access to competitions
create policy "Public can view competitions"
on "public"."comp_info"
as permissive
for select
to public
using (true);

-- Allow authenticated users to create competitions
create policy "Authenticated users can create competitions"
on "public"."comp_info"
as permissive
for insert
to public
with check (auth.uid() is not null);

-- Allow competition admins to update competitions
create policy "Competition admins can update competitions"
on "public"."comp_info"
as permissive
for update
to public
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
to public
using (EXISTS (
  SELECT 1 FROM competition_admins ca 
  WHERE ca.user_id = auth.uid() AND ca.comp_id = comp_info.id
));

-- ============================================================================
-- COMPETITION_ADMINS policies
-- ============================================================================

-- Allow public read access to competition admins (for admin checks)
create policy "Public can view competition admins"
on "public"."competition_admins"
as permissive
for select
to public
using (true);

-- Allow authenticated users to create admin records when creating competitions
-- This will be handled by the application logic, so we allow inserts by authenticated users
create policy "Authenticated users can create admin records"
on "public"."competition_admins"
as permissive
for insert
to public
with check (auth.uid() is not null);

-- Allow admins to manage other admins for their competitions
create policy "Competition admins can manage admins"
on "public"."competition_admins"
as permissive
for all
to public
using (EXISTS (
  SELECT 1 FROM competition_admins ca 
  WHERE ca.user_id = auth.uid() AND ca.comp_id = competition_admins.comp_id
))
with check (EXISTS (
  SELECT 1 FROM competition_admins ca 
  WHERE ca.user_id = auth.uid() AND ca.comp_id = competition_admins.comp_id
));

-- ============================================================================
-- COMP_PARTICIPANT policies  
-- ============================================================================
-- Note: These already exist, but adding here for completeness

-- Allow public read access to active participants
-- (This policy should already exist from previous migrations)
-- create policy "Public can view active participants"
-- on "public"."comp_participant"
-- as permissive
-- for select
-- to public
-- using (participation_status = 'active');

-- Allow authenticated users to manage their own participation
-- (This policy should already exist from previous migrations) 
-- create policy "Users can manage their own participation"
-- on "public"."comp_participant"
-- as permissive
-- for all
-- to public
-- using (user_id = auth.uid())
-- with check (user_id = auth.uid());

-- Allow competition admins to manage participants
-- (This policy should already exist from previous migrations)
-- create policy "Admins can manage participants"
-- on "public"."comp_participant"
-- as permissive  
-- for all
-- to public
-- using (EXISTS (
--   SELECT 1 FROM competition_admins ca
--   WHERE ca.user_id = auth.uid() AND ca.comp_id = comp_participant.comp_id
-- ));