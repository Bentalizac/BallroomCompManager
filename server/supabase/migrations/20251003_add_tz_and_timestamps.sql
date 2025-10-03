-- Add competition time zones and precise event timestamps
-- Migration: 20251003_add_tz_and_timestamps.sql

-- Add time_zone column to comp_info table
ALTER TABLE comp_info 
ADD COLUMN time_zone TEXT NOT NULL DEFAULT 'UTC';

-- Backfill existing competitions with UTC timezone
UPDATE comp_info 
SET time_zone = 'UTC' 
WHERE time_zone IS NULL;

-- Add precise timestamp columns to event_info table
ALTER TABLE event_info 
ADD COLUMN start_at TIMESTAMPTZ,
ADD COLUMN end_at TIMESTAMPTZ;

-- Backfill start_at and end_at using existing start_date/end_date with competition timezone
UPDATE event_info 
SET 
    start_at = make_timestamptz(
        EXTRACT(YEAR FROM event_info.start_date)::int,
        EXTRACT(MONTH FROM event_info.start_date)::int, 
        EXTRACT(DAY FROM event_info.start_date)::int,
        0, 0, 0,
        comp_info.time_zone
    ),
    end_at = make_timestamptz(
        EXTRACT(YEAR FROM event_info.end_date)::int,
        EXTRACT(MONTH FROM event_info.end_date)::int,
        EXTRACT(DAY FROM event_info.end_date)::int, 
        23, 59, 59,
        comp_info.time_zone
    )
FROM comp_info 
WHERE event_info.comp_id = comp_info.id;

-- Make the new timestamp columns NOT NULL after backfilling
ALTER TABLE event_info 
ALTER COLUMN start_at SET NOT NULL,
ALTER COLUMN end_at SET NOT NULL;

-- Add comments to mark old date columns as deprecated
COMMENT ON COLUMN event_info.start_date IS 'DEPRECATED: Use start_at timestamptz instead. Date-only field, kept for backward compatibility.';
COMMENT ON COLUMN event_info.end_date IS 'DEPRECATED: Use end_at timestamptz instead. Date-only field, kept for backward compatibility.';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_info_start_at ON event_info(start_at);
CREATE INDEX IF NOT EXISTS idx_event_info_end_at ON event_info(end_at);
CREATE INDEX IF NOT EXISTS idx_comp_info_time_zone ON comp_info(time_zone);