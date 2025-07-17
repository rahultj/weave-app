-- Migration: Update scraps table structure
-- Date: 2024-01-XX
-- Description: Add creator, medium, observations fields and make title required

-- SAFETY CHECKS
DO $$
BEGIN
    -- Check if we're in the right database
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scraps') THEN
        RAISE EXCEPTION 'scraps table not found - wrong database?';
    END IF;
    
    -- Check if migration already applied
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scraps' AND column_name = 'observations') THEN
        RAISE NOTICE 'Migration already applied - skipping';
        RETURN;
    END IF;
END $$;

-- MIGRATION
BEGIN;

-- Step 1: Add new columns
ALTER TABLE public.scraps 
    ADD COLUMN IF NOT EXISTS creator TEXT,
    ADD COLUMN IF NOT EXISTS medium TEXT,
    ADD COLUMN IF NOT EXISTS observations TEXT;

-- Step 2: Migrate existing content to observations
UPDATE public.scraps 
SET observations = content 
WHERE content IS NOT NULL;

-- Step 3: Update any NULL titles to prevent NOT NULL constraint failure
UPDATE public.scraps 
SET title = CASE 
    WHEN title IS NULL OR title = '' THEN 'Untitled'
    ELSE title
END
WHERE title IS NULL OR title = '';

-- Step 4: Make title required
ALTER TABLE public.scraps 
    ALTER COLUMN title SET NOT NULL;

-- Step 5: Drop old columns (after data migration)
ALTER TABLE public.scraps 
    DROP COLUMN IF EXISTS content,
    DROP COLUMN IF EXISTS source;

-- Step 6: Add comment for tracking
COMMENT ON TABLE public.scraps IS 'Updated schema - migration 001 applied';

COMMIT; 