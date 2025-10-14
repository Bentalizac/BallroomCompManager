-- Add slug column to comp_info table
ALTER TABLE "public"."comp_info" ADD COLUMN "slug" text;

-- Function to generate a slug from competition name and year
CREATE OR REPLACE FUNCTION generate_competition_slug(
    competition_name text,
    created_at timestamp with time zone
) RETURNS text AS $$
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
$$ LANGUAGE plpgsql;

-- Function to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION set_competition_slug() RETURNS trigger AS $$
BEGIN
    -- Only generate if slug is null or empty
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_competition_slug(NEW.name, NEW.created_at);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update existing records with generated slugs
UPDATE "public"."comp_info" 
SET slug = generate_competition_slug(name, created_at)
WHERE slug IS NULL;

-- Add unique constraint
ALTER TABLE "public"."comp_info" ADD CONSTRAINT "comp_info_slug_unique" UNIQUE ("slug");

-- Add trigger for auto-generation
CREATE TRIGGER trigger_set_competition_slug
    BEFORE INSERT OR UPDATE ON "public"."comp_info"
    FOR EACH ROW
    EXECUTE FUNCTION set_competition_slug();

-- Make slug NOT NULL after populating existing records
ALTER TABLE "public"."comp_info" ALTER COLUMN "slug" SET NOT NULL;