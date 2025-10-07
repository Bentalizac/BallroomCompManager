-- Debug and fix comp_participant RLS policies
-- Check current policies first, then ensure we have the correct ones

-- Drop any existing INSERT policies on comp_participant to start clean
DROP POLICY IF EXISTS "Users can register for competitions" ON "public"."comp_participant";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."comp_participant";
DROP POLICY IF EXISTS "Users can insert their own participation" ON "public"."comp_participant";

-- Create the correct INSERT policy for comp_participant
-- This allows authenticated users to insert records where user_id matches their auth.uid()
CREATE POLICY "Users can register for competitions"
ON "public"."comp_participant"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Ensure we have proper SELECT policy (should already exist)
DROP POLICY IF EXISTS "Public can view active participants" ON "public"."comp_participant";
CREATE POLICY "Public can view active participants"
ON "public"."comp_participant"
AS PERMISSIVE
FOR SELECT
TO public
USING (participation_status = 'active');

-- Ensure users can view their own participation records
DROP POLICY IF EXISTS "Users can view their own participation" ON "public"."comp_participant";
CREATE POLICY "Users can view their own participation"
ON "public"."comp_participant"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Ensure users can update their own participation status
DROP POLICY IF EXISTS "Users can update their own participation" ON "public"."comp_participant";
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON "public"."comp_participant";
CREATE POLICY "Users can update their own participation"
ON "public"."comp_participant"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND participation_status IN ('active', 'inactive'));

-- Allow competition admins to manage all participants
DROP POLICY IF EXISTS "Admins can modify participants" ON "public"."comp_participant";
CREATE POLICY "Admins can modify participants"
ON "public"."comp_participant"
AS PERMISSIVE
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM competition_admins ca
  WHERE ca.user_id = auth.uid() AND ca.comp_id = comp_participant.comp_id
))
WITH CHECK (EXISTS (
  SELECT 1 FROM competition_admins ca
  WHERE ca.user_id = auth.uid() AND ca.comp_id = comp_participant.comp_id
));