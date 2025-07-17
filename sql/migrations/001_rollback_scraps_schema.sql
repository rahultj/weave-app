-- ROLLBACK: Update scraps table structure
-- Date: 2024-01-XX
-- Description: Rollback migration 001 - restore original schema

-- SAFETY CHECKS
DO $$
BEGIN
    -- Check if we're in the right database
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scraps') THEN
        RAISE EXCEPTION 'scraps table not found - wrong database?';
    END IF;
    
    -- Check if rollback is possible
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scraps' AND column_name = 'observations') THEN
        RAISE NOTICE 'Migration not applied - nothing to rollback';
        RETURN;
    END IF;
END $$;

-- ROLLBACK
BEGIN;

-- Step 1: Add back old columns
ALTER TABLE public.scraps 
    ADD COLUMN IF NOT EXISTS content TEXT,
    ADD COLUMN IF NOT EXISTS source TEXT;

-- Step 2: Migrate observations back to content
UPDATE public.scraps 
SET content = observations 
WHERE observations IS NOT NULL;

-- Step 3: Make title nullable again
ALTER TABLE public.scraps 
    ALTER COLUMN title DROP NOT NULL;

-- Step 4: Drop new columns
ALTER TABLE public.scraps 
    DROP COLUMN IF EXISTS creator,
    DROP COLUMN IF EXISTS medium,
    DROP COLUMN IF EXISTS observations;

-- Step 5: Update comment
COMMENT ON TABLE public.scraps IS 'Rollback completed - migration 001 undone';

COMMIT; 