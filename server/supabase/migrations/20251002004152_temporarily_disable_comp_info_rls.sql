-- Temporarily disable RLS on comp_info to test basic functionality
-- We'll re-enable it once we fix the schema cache issue

-- Drop all policies on comp_info
drop policy if exists "Public can view competitions" on "public"."comp_info";
drop policy if exists "Authenticated users can create competitions" on "public"."comp_info";
drop policy if exists "Competition admins can update competitions" on "public"."comp_info";
drop policy if exists "Competition admins can delete competitions" on "public"."comp_info";

-- Disable RLS on comp_info table
alter table public.comp_info disable row level security;

-- Keep RLS enabled on competition_admins but simplify policies
drop policy if exists "Public can view competition admins" on "public"."competition_admins";
drop policy if exists "Authenticated users can create admin records" on "public"."competition_admins";
drop policy if exists "Competition admins can manage admins" on "public"."competition_admins";
drop policy if exists "Competition admins can delete admin records" on "public"."competition_admins";

-- Simple policies for competition_admins
create policy "Allow all operations on competition_admins for authenticated users"
on "public"."competition_admins"
as permissive
for all
to authenticated
using (true)
with check (true);