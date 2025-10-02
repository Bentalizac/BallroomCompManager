-- Add RLS policies for venue table

-- Allow public read access to venues (everyone can see venues)
create policy "Public can view venues"
on "public"."venue"
as permissive
for select
to public
using (true);

-- Allow authenticated users to create venues
create policy "Authenticated users can create venues"
on "public"."venue"
as permissive
for insert
to public
with check (auth.uid() is not null);

-- Allow authenticated users to update venues they created
-- Note: We don't have a created_by field, so for now allow any authenticated user to update
-- In a production system, you might want to add a created_by field or restrict this further
create policy "Authenticated users can update venues"
on "public"."venue"
as permissive
for update
to public
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Allow authenticated users to delete venues
-- Same note as above - in production you might want stricter controls
create policy "Authenticated users can delete venues"
on "public"."venue"
as permissive
for delete
to public
using (auth.uid() is not null);