-- Fix RLS violation: Add INSERT policy for comp_participant table
-- This allows authenticated users to insert their own participation records

create policy "Users can register for competitions"
on "public"."comp_participant"
as permissive
for insert
to authenticated
with check (user_id = auth.uid());