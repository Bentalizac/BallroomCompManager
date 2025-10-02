-- Add role enums for consistency and drift prevention
create type public.participant_role as enum ('spectator','competitor','organizer','judge');
create type public.event_role as enum ('competitor','judge','scrutineer');

-- Drop existing check constraint that conflicts with enum
alter table "public"."comp_participant" drop constraint if exists "comp_participant_role_check";

-- Drop policies that depend on role columns before altering them
drop policy if exists "judge_delete" on "public"."event_results";
drop policy if exists "judge_insert" on "public"."event_results";
drop policy if exists "judge_update" on "public"."event_results";

-- Alter columns to use enums, normalizing existing text to lowercase before casting
alter table "public"."comp_participant" 
  alter column "role" type public.participant_role 
  using lower(role)::public.participant_role;

alter table "public"."event_registration" 
  alter column "role" type public.event_role 
  using lower(role)::public.event_role;

-- Update event_results RLS policies to use lowercase enum comparison

-- Recreate judge policies with lowercase enum comparison
create policy "judge_delete" on "public"."event_results"
  as permissive for delete to public
  using (
    exists (
      select 1 from event_registration er
      join comp_participant cp on er.comp_participant_id = cp.id
      where er.id = event_results.event_registration_id 
        and er.role in ('judge', 'scrutineer')
        and cp.user_id = auth.uid()
    )
  );

create policy "judge_insert" on "public"."event_results"
  as permissive for insert to public
  with check (
    exists (
      select 1 from event_registration er
      join comp_participant cp on er.comp_participant_id = cp.id
      where er.id = event_results.event_registration_id 
        and er.role in ('judge', 'scrutineer')
        and cp.user_id = auth.uid()
    )
  );

create policy "judge_update" on "public"."event_results"
  as permissive for update to public
  using (
    exists (
      select 1 from event_registration er
      join comp_participant cp on er.comp_participant_id = cp.id
      where er.id = event_results.event_registration_id 
        and er.role in ('judge', 'scrutineer')
        and cp.user_id = auth.uid()
    )
  );

-- Add comprehensive RLS policies for event_registration
-- Admin full control for a competition
create policy "er_admin_all" on "public"."event_registration" 
  for all to authenticated 
  using (
    exists (
      select 1 from event_info ei 
      join competition_admins ca on ca.comp_id = ei.comp_id 
      where ei.id = event_registration.event_info_id 
        and ca.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from event_info ei 
      join competition_admins ca on ca.comp_id = ei.comp_id 
      where ei.id = event_registration.event_info_id 
        and ca.user_id = auth.uid()
    )
  );

-- Self service - participants can manage their own registration rows
create policy "er_self_insert" on "public"."event_registration" 
  for insert to authenticated 
  with check (
    exists (
      select 1 from comp_participant cp 
      where cp.id = event_registration.comp_participant_id 
        and cp.user_id = auth.uid()
    )
  );

create policy "er_self_select" on "public"."event_registration" 
  for select to authenticated 
  using (
    exists (
      select 1 from comp_participant cp 
      where cp.id = event_registration.comp_participant_id 
        and cp.user_id = auth.uid()
    ) or 
    exists (
      select 1 from event_info ei 
      join competition_admins ca on ca.comp_id = ei.comp_id 
      where ei.id = event_registration.event_info_id 
        and ca.user_id = auth.uid()
    )
  );

create policy "er_self_update" on "public"."event_registration" 
  for update to authenticated 
  using (
    exists (
      select 1 from comp_participant cp 
      where cp.id = event_registration.comp_participant_id 
        and cp.user_id = auth.uid()
    ) or 
    exists (
      select 1 from event_info ei 
      join competition_admins ca on ca.comp_id = ei.comp_id 
      where ei.id = event_registration.event_info_id 
        and ca.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from comp_participant cp 
      where cp.id = event_registration.comp_participant_id 
        and cp.user_id = auth.uid()
    ) or 
    exists (
      select 1 from event_info ei 
      join competition_admins ca on ca.comp_id = ei.comp_id 
      where ei.id = event_registration.event_info_id 
        and ca.user_id = auth.uid()
    )
  );

create policy "er_self_delete" on "public"."event_registration" 
  for delete to authenticated 
  using (
    exists (
      select 1 from comp_participant cp 
      where cp.id = event_registration.comp_participant_id 
        and cp.user_id = auth.uid()
    ) or 
    exists (
      select 1 from event_info ei 
      join competition_admins ca on ca.comp_id = ei.comp_id 
      where ei.id = event_registration.event_info_id 
        and ca.user_id = auth.uid()
    )
  );