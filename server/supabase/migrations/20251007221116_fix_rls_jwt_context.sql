-- Alternative approach: Use JWT claims directly for RLS
-- This checks if the JWT token contains the user ID in the 'sub' claim

-- Drop the current policy that uses auth.uid()
DROP POLICY IF EXISTS "Users can register for competitions" ON "public"."comp_participant";

-- Create a policy that uses JWT claims directly
-- The (current_setting('request.jwt.claims'))::json->>'sub' extracts the 'sub' claim from JWT
CREATE POLICY "Users can register for competitions"
ON "public"."comp_participant"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  user_id::text = (current_setting('request.jwt.claims', true))::json->>'sub'
  OR 
  user_id = auth.uid()  -- Fallback to auth.uid() if available
);