-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.category_ruleset (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  ruleset_id uuid NOT NULL,
  CONSTRAINT category_ruleset_pkey PRIMARY KEY (id),
  CONSTRAINT fk_cr_ruleset FOREIGN KEY (ruleset_id) REFERENCES public.rulesets(id)
);
CREATE TABLE public.comp_info (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  venue_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  time_zone text NOT NULL DEFAULT 'UTC'::text,
  slug text NOT NULL UNIQUE,
  CONSTRAINT comp_info_pkey PRIMARY KEY (id),
  CONSTRAINT comp_info_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venue(id)
);
CREATE TABLE public.comp_participant (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  comp_id uuid,
  user_id uuid,
  role USER-DEFINED NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  participation_status text NOT NULL DEFAULT 'active'::text,
  CONSTRAINT comp_participant_pkey PRIMARY KEY (id),
  CONSTRAINT comp_participant_comp_id_fkey FOREIGN KEY (comp_id) REFERENCES public.comp_info(id),
  CONSTRAINT comp_participant_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_info(id)
);
CREATE TABLE public.competition_admins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  comp_id uuid,
  user_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT competition_admins_pkey PRIMARY KEY (id),
  CONSTRAINT competition_admins_comp_id_fkey FOREIGN KEY (comp_id) REFERENCES public.comp_info(id),
  CONSTRAINT competition_admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.dance_styles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  CONSTRAINT dance_styles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.event_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_registration_id uuid,
  action text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT event_audit_log_pkey PRIMARY KEY (id),
  CONSTRAINT event_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_info(id)
);
CREATE TABLE public.event_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  dance_style uuid NOT NULL DEFAULT gen_random_uuid(),
  event_level uuid DEFAULT gen_random_uuid(),
  CONSTRAINT event_categories_pkey PRIMARY KEY (id),
  CONSTRAINT event_categories_event_level_fkey FOREIGN KEY (event_level) REFERENCES public.event_levels(id),
  CONSTRAINT event_categories_dance_style_fkey FOREIGN KEY (dance_style) REFERENCES public.dance_styles(id)
);
CREATE TABLE public.event_info (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date,
  end_date date,
  category_ruleset_id uuid NOT NULL,
  comp_id uuid NOT NULL,
  event_status text NOT NULL DEFAULT 'scheduled'::text,
  start_at timestamp with time zone,
  end_at timestamp with time zone,
  entry_type USER-DEFINED,
  CONSTRAINT event_info_pkey PRIMARY KEY (id),
  CONSTRAINT fk_event_category_ruleset FOREIGN KEY (category_ruleset_id) REFERENCES public.category_ruleset(id),
  CONSTRAINT event_info_comp_id_fkey FOREIGN KEY (comp_id) REFERENCES public.comp_info(id)
);
CREATE TABLE public.event_levels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  CONSTRAINT event_levels_pkey PRIMARY KEY (id)
);
CREATE TABLE public.event_registration_participants (
  registration_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text DEFAULT 'member'::text CHECK (role = ANY (ARRAY['lead'::text, 'follow'::text, 'coach'::text, 'member'::text])),
  CONSTRAINT event_registration_participants_pkey PRIMARY KEY (registration_id, user_id),
  CONSTRAINT event_registration_participants_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.event_registrations(id),
  CONSTRAINT event_registration_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_info(id)
);
CREATE TABLE public.event_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  team_name text,
  status text DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT event_registrations_pkey PRIMARY KEY (id),
  CONSTRAINT event_registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event_info(id)
);
CREATE TABLE public.event_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_registration_id uuid NOT NULL UNIQUE,
  scoring_method_id uuid NOT NULL,
  score numeric NOT NULL,
  rank integer,
  CONSTRAINT event_results_pkey PRIMARY KEY (id),
  CONSTRAINT fk_results_scoring FOREIGN KEY (scoring_method_id) REFERENCES public.scoring_methods(id)
);
CREATE TABLE public.rulesets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  scoring_method_id uuid NOT NULL,
  CONSTRAINT rulesets_pkey PRIMARY KEY (id),
  CONSTRAINT fk_ruleset_scoring FOREIGN KEY (scoring_method_id) REFERENCES public.scoring_methods(id)
);
CREATE TABLE public.scoring_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  CONSTRAINT scoring_methods_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_info (
  id uuid NOT NULL,
  role text NOT NULL DEFAULT 'user'::text,
  email text,
  firstname text,
  lastname text,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  ndca_number text,
  is_stub boolean,
  created_by uuid,
  CONSTRAINT user_info_pkey PRIMARY KEY (id),
  CONSTRAINT user_info_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT user_info_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_info(id)
);
CREATE TABLE public.venue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  street text,
  city text,
  state text,
  postal_code text,
  country text,
  google_maps_url text,
  CONSTRAINT venue_pkey PRIMARY KEY (id)
);
