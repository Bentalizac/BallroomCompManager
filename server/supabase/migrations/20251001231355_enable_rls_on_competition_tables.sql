-- Enable Row Level Security on competition-related tables

-- Enable RLS on comp_info (competitions)
alter table public.comp_info enable row level security;

-- Enable RLS on competition_admins
alter table public.competition_admins enable row level security;