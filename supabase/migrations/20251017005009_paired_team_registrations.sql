-- Migration for paired/team registrations schema
-- This migration creates the new registration system that supports individual, paired, and team entries

-- Create event_registrations table
create table event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references event_info(id) on delete cascade,
  team_name text,                      -- optional: for team or formation entries
  status text default 'active' check (status in ('active', 'withdrawn', 'pending')),
  created_at timestamptz default now()
);

-- Create event_registration_participants table
create table event_registration_participants (
  registration_id uuid not null references event_registrations(id) on delete cascade,
  user_id uuid not null references user_info(id) on delete cascade,
  role text check (role in ('lead', 'follow', 'coach', 'member')) default 'member',
  primary key (registration_id, user_id)
);

-- Enable RLS on the new tables
alter table event_registrations enable row level security;
alter table event_registration_participants enable row level security;

-- RLS policies for event_registrations
-- Users can read registrations for events they have access to
create policy "Users can read event registrations for accessible events"
  on event_registrations for select
  using (
    -- Allow if user is competition admin or participant
    exists (
      select 1 from event_info ei
      join comp_info ci on ei.comp_id = ci.id
      left join competition_admins ca on ci.id = ca.comp_id and ca.user_id = auth.uid()
      left join comp_participant cp on ci.id = cp.comp_id and cp.user_id = auth.uid()
      where ei.id = event_registrations.event_id
      and (ca.user_id is not null or cp.user_id is not null)
    )
  );

-- Users can create registrations for events they can participate in
create policy "Users can create event registrations for accessible events"
  on event_registrations for insert
  with check (
    exists (
      select 1 from event_info ei
      join comp_info ci on ei.comp_id = ci.id
      left join comp_participant cp on ci.id = cp.comp_id and cp.user_id = auth.uid()
      where ei.id = event_registrations.event_id
      and cp.user_id is not null
    )
  );

-- Users can update registrations they participate in
create policy "Users can update their own event registrations"
  on event_registrations for update
  using (
    exists (
      select 1 from event_registration_participants erp
      where erp.registration_id = event_registrations.id
      and erp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from event_registration_participants erp
      where erp.registration_id = event_registrations.id
      and erp.user_id = auth.uid()
    )
  );

-- Competition admins can update any registration in their competitions
create policy "Competition admins can update event registrations"
  on event_registrations for update
  using (
    exists (
      select 1 from event_info ei
      join comp_info ci on ei.comp_id = ci.id
      join competition_admins ca on ci.id = ca.comp_id
      where ei.id = event_registrations.event_id
      and ca.user_id = auth.uid()
    )
  );

-- RLS policies for event_registration_participants
-- Users can read participants for registrations they have access to
create policy "Users can read event registration participants for accessible registrations"
  on event_registration_participants for select
  using (
    exists (
      select 1 from event_registrations er
      join event_info ei on er.event_id = ei.id
      join comp_info ci on ei.comp_id = ci.id
      left join competition_admins ca on ci.id = ca.comp_id and ca.user_id = auth.uid()
      left join comp_participant cp on ci.id = cp.comp_id and cp.user_id = auth.uid()
      where er.id = event_registration_participants.registration_id
      and (ca.user_id is not null or cp.user_id is not null)
    )
  );

-- Users can insert themselves as participants
create policy "Users can add themselves as participants"
  on event_registration_participants for insert
  with check (user_id = auth.uid());

-- Users can remove themselves as participants
create policy "Users can remove themselves as participants"
  on event_registration_participants for delete
  using (user_id = auth.uid());

-- Competition admins can manage all participants in their competitions
create policy "Competition admins can manage event registration participants"
  on event_registration_participants for all
  using (
    exists (
      select 1 from event_registrations er
      join event_info ei on er.event_id = ei.id
      join comp_info ci on ei.comp_id = ci.id
      join competition_admins ca on ci.id = ca.comp_id
      where er.id = event_registration_participants.registration_id
      and ca.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from event_registrations er
      join event_info ei on er.event_id = ei.id
      join comp_info ci on ei.comp_id = ci.id
      join competition_admins ca on ci.id = ca.comp_id
      where er.id = event_registration_participants.registration_id
      and ca.user_id = auth.uid()
    )
  );

-- Create indexes for performance
create index idx_event_registrations_event_id on event_registrations(event_id);
create index idx_event_registrations_status on event_registrations(status);
create index idx_event_registration_participants_registration_id on event_registration_participants(registration_id);
create index idx_event_registration_participants_user_id on event_registration_participants(user_id);