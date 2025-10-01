create table "public"."category_ruleset" (
    "id" uuid not null default gen_random_uuid(),
    "category_id" uuid not null,
    "ruleset_id" uuid not null
);


create table "public"."comp_info" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "start_date" date not null,
    "end_date" date not null,
    "venue_id" uuid,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."comp_info" enable row level security;

create table "public"."comp_participant" (
    "id" uuid not null default gen_random_uuid(),
    "comp_id" uuid,
    "user_id" uuid,
    "role" text not null,
    "created_at" timestamp with time zone not null default now(),
    "participation_status" text not null default 'active'::text
);


alter table "public"."comp_participant" enable row level security;

create table "public"."competition_admins" (
    "id" uuid not null default gen_random_uuid(),
    "comp_id" uuid,
    "user_id" uuid,
    "created_at" timestamp without time zone default now()
);


create table "public"."event_audit_log" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "event_registration_id" uuid,
    "action" text not null,
    "created_at" timestamp without time zone default now()
);


create table "public"."event_categories" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null
);


create table "public"."event_info" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "start_date" date not null,
    "end_date" date not null,
    "category_ruleset_id" uuid not null,
    "comp_id" uuid not null,
    "event_status" text not null default 'scheduled'::text
);


alter table "public"."event_info" enable row level security;

create table "public"."event_registration" (
    "id" uuid not null default gen_random_uuid(),
    "comp_participant_id" uuid not null,
    "event_info_id" uuid not null,
    "role" text not null,
    "registration_status" text not null default 'active'::text,
    "partner_id" uuid
);


alter table "public"."event_registration" enable row level security;

create table "public"."event_results" (
    "id" uuid not null default gen_random_uuid(),
    "event_registration_id" uuid not null,
    "scoring_method_id" uuid not null,
    "score" numeric not null,
    "rank" integer
);


alter table "public"."event_results" enable row level security;

create table "public"."rulesets" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "scoring_method_id" uuid not null
);


create table "public"."scoring_methods" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text
);


create table "public"."user_info" (
    "id" uuid not null,
    "role" text not null default 'user'::text,
    "email" text,
    "firstname" text,
    "lastname" text,
    "created_at" timestamp without time zone not null default now()
);


alter table "public"."user_info" enable row level security;

create table "public"."venue" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "street" text,
    "city" text,
    "state" text,
    "postal_code" text,
    "country" text,
    "google_maps_url" text
);


alter table "public"."venue" enable row level security;

CREATE UNIQUE INDEX category_ruleset_pkey ON public.category_ruleset USING btree (id);

CREATE UNIQUE INDEX comp_info_pkey ON public.comp_info USING btree (id);

CREATE UNIQUE INDEX comp_participant_pkey ON public.comp_participant USING btree (id);

CREATE UNIQUE INDEX competition_admins_pkey ON public.competition_admins USING btree (id);

CREATE UNIQUE INDEX event_audit_log_pkey ON public.event_audit_log USING btree (id);

CREATE UNIQUE INDEX event_categories_pkey ON public.event_categories USING btree (id);

CREATE UNIQUE INDEX event_info_pkey ON public.event_info USING btree (id);

CREATE UNIQUE INDEX event_registration_pkey ON public.event_registration USING btree (id);

CREATE UNIQUE INDEX event_results_pkey ON public.event_results USING btree (id);

CREATE UNIQUE INDEX rulesets_pkey ON public.rulesets USING btree (id);

CREATE UNIQUE INDEX scoring_methods_pkey ON public.scoring_methods USING btree (id);

CREATE UNIQUE INDEX uq_category_ruleset ON public.category_ruleset USING btree (category_id, ruleset_id);

CREATE UNIQUE INDEX uq_event_participant ON public.event_registration USING btree (comp_participant_id, event_info_id);

CREATE UNIQUE INDEX uq_event_registration_result ON public.event_results USING btree (event_registration_id);

CREATE UNIQUE INDEX user_info_pkey ON public.user_info USING btree (id);

CREATE UNIQUE INDEX venue_pkey ON public.venue USING btree (id);

alter table "public"."category_ruleset" add constraint "category_ruleset_pkey" PRIMARY KEY using index "category_ruleset_pkey";

alter table "public"."comp_info" add constraint "comp_info_pkey" PRIMARY KEY using index "comp_info_pkey";

alter table "public"."comp_participant" add constraint "comp_participant_pkey" PRIMARY KEY using index "comp_participant_pkey";

alter table "public"."competition_admins" add constraint "competition_admins_pkey" PRIMARY KEY using index "competition_admins_pkey";

alter table "public"."event_audit_log" add constraint "event_audit_log_pkey" PRIMARY KEY using index "event_audit_log_pkey";

alter table "public"."event_categories" add constraint "event_categories_pkey" PRIMARY KEY using index "event_categories_pkey";

alter table "public"."event_info" add constraint "event_info_pkey" PRIMARY KEY using index "event_info_pkey";

alter table "public"."event_registration" add constraint "event_registration_pkey" PRIMARY KEY using index "event_registration_pkey";

alter table "public"."event_results" add constraint "event_results_pkey" PRIMARY KEY using index "event_results_pkey";

alter table "public"."rulesets" add constraint "rulesets_pkey" PRIMARY KEY using index "rulesets_pkey";

alter table "public"."scoring_methods" add constraint "scoring_methods_pkey" PRIMARY KEY using index "scoring_methods_pkey";

alter table "public"."user_info" add constraint "user_info_pkey" PRIMARY KEY using index "user_info_pkey";

alter table "public"."venue" add constraint "venue_pkey" PRIMARY KEY using index "venue_pkey";

alter table "public"."category_ruleset" add constraint "fk_cr_category" FOREIGN KEY (category_id) REFERENCES event_categories(id) ON DELETE CASCADE not valid;

alter table "public"."category_ruleset" validate constraint "fk_cr_category";

alter table "public"."category_ruleset" add constraint "fk_cr_ruleset" FOREIGN KEY (ruleset_id) REFERENCES rulesets(id) ON DELETE CASCADE not valid;

alter table "public"."category_ruleset" validate constraint "fk_cr_ruleset";

alter table "public"."category_ruleset" add constraint "uq_category_ruleset" UNIQUE using index "uq_category_ruleset";

alter table "public"."comp_info" add constraint "comp_info_venue_id_fkey" FOREIGN KEY (venue_id) REFERENCES venue(id) not valid;

alter table "public"."comp_info" validate constraint "comp_info_venue_id_fkey";

alter table "public"."comp_participant" add constraint "comp_participant_comp_id_fkey" FOREIGN KEY (comp_id) REFERENCES comp_info(id) ON DELETE CASCADE not valid;

alter table "public"."comp_participant" validate constraint "comp_participant_comp_id_fkey";

alter table "public"."comp_participant" add constraint "comp_participant_role_check" CHECK ((role = ANY (ARRAY['spectator'::text, 'competitor'::text, 'organizer'::text, 'judge'::text]))) not valid;

alter table "public"."comp_participant" validate constraint "comp_participant_role_check";

alter table "public"."comp_participant" add constraint "comp_participant_user_id_fkey" FOREIGN KEY (user_id) REFERENCES user_info(id) ON DELETE CASCADE not valid;

alter table "public"."comp_participant" validate constraint "comp_participant_user_id_fkey";

alter table "public"."competition_admins" add constraint "competition_admins_comp_id_fkey" FOREIGN KEY (comp_id) REFERENCES comp_info(id) ON DELETE CASCADE not valid;

alter table "public"."competition_admins" validate constraint "competition_admins_comp_id_fkey";

alter table "public"."competition_admins" add constraint "competition_admins_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."competition_admins" validate constraint "competition_admins_user_id_fkey";

alter table "public"."event_audit_log" add constraint "event_audit_log_event_registration_id_fkey" FOREIGN KEY (event_registration_id) REFERENCES event_registration(id) not valid;

alter table "public"."event_audit_log" validate constraint "event_audit_log_event_registration_id_fkey";

alter table "public"."event_audit_log" add constraint "event_audit_log_user_id_fkey" FOREIGN KEY (user_id) REFERENCES user_info(id) not valid;

alter table "public"."event_audit_log" validate constraint "event_audit_log_user_id_fkey";

alter table "public"."event_info" add constraint "event_info_comp_id_fkey" FOREIGN KEY (comp_id) REFERENCES comp_info(id) ON DELETE CASCADE not valid;

alter table "public"."event_info" validate constraint "event_info_comp_id_fkey";

alter table "public"."event_info" add constraint "fk_event_category_ruleset" FOREIGN KEY (category_ruleset_id) REFERENCES category_ruleset(id) ON DELETE RESTRICT not valid;

alter table "public"."event_info" validate constraint "fk_event_category_ruleset";

alter table "public"."event_registration" add constraint "fk_er_event" FOREIGN KEY (event_info_id) REFERENCES event_info(id) ON DELETE CASCADE not valid;

alter table "public"."event_registration" validate constraint "fk_er_event";

alter table "public"."event_registration" add constraint "fk_er_participant" FOREIGN KEY (comp_participant_id) REFERENCES comp_participant(id) ON DELETE CASCADE not valid;

alter table "public"."event_registration" validate constraint "fk_er_participant";

alter table "public"."event_registration" add constraint "fk_event_registration_partner" FOREIGN KEY (partner_id) REFERENCES event_registration(id) ON DELETE SET NULL not valid;

alter table "public"."event_registration" validate constraint "fk_event_registration_partner";

alter table "public"."event_registration" add constraint "uq_event_participant" UNIQUE using index "uq_event_participant";

alter table "public"."event_results" add constraint "fk_results_event_registration" FOREIGN KEY (event_registration_id) REFERENCES event_registration(id) ON DELETE CASCADE not valid;

alter table "public"."event_results" validate constraint "fk_results_event_registration";

alter table "public"."event_results" add constraint "fk_results_scoring" FOREIGN KEY (scoring_method_id) REFERENCES scoring_methods(id) ON DELETE RESTRICT not valid;

alter table "public"."event_results" validate constraint "fk_results_scoring";

alter table "public"."event_results" add constraint "uq_event_registration_result" UNIQUE using index "uq_event_registration_result";

alter table "public"."rulesets" add constraint "fk_ruleset_scoring" FOREIGN KEY (scoring_method_id) REFERENCES scoring_methods(id) ON DELETE RESTRICT not valid;

alter table "public"."rulesets" validate constraint "fk_ruleset_scoring";

alter table "public"."user_info" add constraint "user_info_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) not valid;

alter table "public"."user_info" validate constraint "user_info_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.user_info (id, email)
  values (new.id, new.email);
  return new;
end;
$function$
;

create policy "Admins can modify participants"
on "public"."comp_participant"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM competition_admins ca
  WHERE ((ca.user_id = auth.uid()) AND (ca.comp_id = comp_participant.comp_id)))));


create policy "Public can view active participants"
on "public"."comp_participant"
as permissive
for select
to public
using ((participation_status = 'active'::text));


create policy "Users can update their own participation"
on "public"."comp_participant"
as permissive
for update
to public
using ((user_id = auth.uid()))
with check ((participation_status = ANY (ARRAY['active'::text, 'inactive'::text])));


create policy "Users can view their own participation"
on "public"."comp_participant"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Admins can modify events"
on "public"."event_info"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM competition_admins ca
  WHERE ((ca.user_id = auth.uid()) AND (ca.comp_id = event_info.comp_id)))));


create policy "Public can view events"
on "public"."event_info"
as permissive
for select
to public
using ((event_status = ANY (ARRAY['scheduled'::text, 'completed'::text, 'current'::text])));


create policy "judge_delete"
on "public"."event_results"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM (event_registration er
     JOIN comp_participant cp ON ((er.comp_participant_id = cp.id)))
  WHERE ((er.id = event_results.event_registration_id) AND (er.role = ANY (ARRAY['Judge'::text, 'Scrutineer'::text])) AND (cp.user_id = (current_setting('jwt.claims.user_id'::text))::uuid)))));


create policy "judge_insert"
on "public"."event_results"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM (event_registration er
     JOIN comp_participant cp ON ((er.comp_participant_id = cp.id)))
  WHERE ((er.id = event_results.event_registration_id) AND (er.role = ANY (ARRAY['Judge'::text, 'Scrutineer'::text])) AND (cp.user_id = (current_setting('jwt.claims.user_id'::text))::uuid)))));


create policy "judge_update"
on "public"."event_results"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM (event_registration er
     JOIN comp_participant cp ON ((er.comp_participant_id = cp.id)))
  WHERE ((er.id = event_results.event_registration_id) AND (er.role = ANY (ARRAY['Judge'::text, 'Scrutineer'::text])) AND (cp.user_id = (current_setting('jwt.claims.user_id'::text))::uuid)))));


create policy "public_read"
on "public"."event_results"
as permissive
for select
to public
using (true);



CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


