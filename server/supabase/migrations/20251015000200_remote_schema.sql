set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.debug_auth_context()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.generate_competition_slug(competition_name text, created_at timestamp with time zone)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    base_slug text;
    year_suffix text;
    final_slug text;
    counter int := 0;
    slug_exists boolean;
BEGIN
    -- Extract year from created_at
    year_suffix := EXTRACT(year FROM created_at)::text;
    
    -- Create base slug: lowercase, replace spaces with hyphens, remove special chars
    base_slug := lower(
        regexp_replace(
            regexp_replace(competition_name, '[^a-zA-Z0-9\s]', '', 'g'),
            '\s+', '-', 'g'
        )
    );
    
    -- Remove leading/trailing hyphens
    base_slug := trim(base_slug, '-');
    
    -- Combine with year
    final_slug := base_slug || '-' || year_suffix;
    
    -- Check for uniqueness and add differentiator if needed
    LOOP
        SELECT EXISTS(
            SELECT 1 FROM comp_info 
            WHERE slug = final_slug
        ) INTO slug_exists;
        
        IF NOT slug_exists THEN
            EXIT;
        END IF;
        
        counter := counter + 1;
        -- Add 2-character differentiator (aa, ab, ac, etc.)
        final_slug := base_slug || '-' || year_suffix || '-' || 
                     chr(97 + (counter - 1) % 26) || chr(97 + (counter - 1) / 26);
    END LOOP;
    
    RETURN final_slug;
END;
$function$
;

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

CREATE OR REPLACE FUNCTION public.set_competition_slug()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Only generate if slug is null or empty
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_competition_slug(NEW.name, NEW.created_at);
    END IF;
    RETURN NEW;
END;
$function$
;

create policy "Enable insert for users based on user_id"
on "public"."user_info"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = id));


create policy "Enable users to view their own data only"
on "public"."user_info"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = id));



drop trigger if exists "objects_delete_cleanup" on "storage"."objects";

drop trigger if exists "objects_update_cleanup" on "storage"."objects";

drop trigger if exists "prefixes_delete_cleanup" on "storage"."prefixes";

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


