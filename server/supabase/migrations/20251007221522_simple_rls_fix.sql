-- Simplify the RLS policy to use only auth.uid()
-- This should work if the JWT is properly configured

DROP POLICY IF EXISTS "Users can register for competitions" ON "public"."comp_participant";

CREATE POLICY "Users can register for competitions"
ON "public"."comp_participant"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());