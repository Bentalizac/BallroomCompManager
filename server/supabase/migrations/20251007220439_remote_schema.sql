drop policy "Enable insert for authenticated users only" on "public"."comp_participant";

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


-- Storage triggers are managed by Supabase and should not be included in user migrations
-- Removed storage.objects and storage.prefixes trigger operations


