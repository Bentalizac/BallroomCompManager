-- Temporarily create a more permissive policy to test if auth is working at all
-- This helps us debug whether the issue is with auth.uid() specifically or the whole auth context

DROP POLICY IF EXISTS "Users can register for competitions" ON "public"."comp_participant";

-- Allow all authenticated users to insert (temporarily for debugging)
CREATE POLICY "Users can register for competitions"
ON "public"."comp_participant"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);  -- This should work if auth context is properly set

-- Also create a helper function to debug auth context
CREATE OR REPLACE FUNCTION debug_auth_context()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'auth_uid', auth.uid(),
        'auth_role', auth.role(),
        'jwt_claims', current_setting('request.jwt.claims', true),
        'current_user', current_user,
        'session_user', session_user
    ) INTO result;
    
    RETURN result;
END;
$$;