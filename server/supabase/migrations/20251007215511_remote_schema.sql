drop policy "Users can update their own participation" on "public"."comp_participant";

drop policy "Users can view their own participation" on "public"."comp_participant";

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

create policy "Enable insert for authenticated users only"
on "public"."comp_info"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."comp_info"
as permissive
for select
to public
using (true);


create policy "Enable insert for authenticated users only"
on "public"."comp_participant"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable update for users based on user_id"
on "public"."comp_participant"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



-- Storage triggers are managed by Supabase and should not be included in user migrations
-- Removed storage.objects and storage.prefixes trigger operations


