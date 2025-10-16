-- Add RLS policies for user_info table
-- Users should be able to read and update their own user_info records

-- Allow users to select their own user_info record
create policy "users_select_own" on "public"."user_info"
  as permissive for select to authenticated
  using (auth.uid() = id);

-- Allow users to update their own user_info record  
create policy "users_update_own" on "public"."user_info"
  as permissive for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow users to insert their own user_info record (for trigger/auto-creation)
create policy "users_insert_own" on "public"."user_info"
  as permissive for insert to authenticated
  with check (auth.uid() = id);

-- Allow service role (triggers, etc.) full access for system operations
create policy "service_role_all" on "public"."user_info"
  as permissive for all to service_role
  using (true)
  with check (true);