-- Staging Database Schema Update for Conversation Scraps
-- Run this on your staging database before testing

\echo 'Starting conversation scrap schema update...'

-- Add content field for storing conversation JSON data
ALTER TABLE scraps ADD COLUMN IF NOT EXISTS content TEXT;

-- Add conversation_id field for linking scraps to conversations  
ALTER TABLE scraps ADD COLUMN IF NOT EXISTS conversation_id TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scraps_conversation_id ON scraps(conversation_id);
CREATE INDEX IF NOT EXISTS idx_scraps_type ON scraps(type);

-- Update type constraint to include 'conversation'
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'scraps_type_check' 
        AND table_name = 'scraps'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE scraps DROP CONSTRAINT scraps_type_check;
        \echo 'Dropped existing type constraint';
    END IF;
    
    -- Add updated constraint
    ALTER TABLE scraps ADD CONSTRAINT scraps_type_check 
        CHECK (type IN ('text', 'image', 'conversation'));
    \echo 'Added updated type constraint with conversation support';
END $$;

-- Verify the changes
\echo 'Verifying schema changes...'

-- Check if columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'scraps' 
    AND table_schema = 'public'
    AND column_name IN ('content', 'conversation_id')
ORDER BY column_name;

-- Check indexes
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'scraps' 
    AND schemaname = 'public'
    AND indexname LIKE 'idx_scraps_%';

\echo 'Schema update complete! Ready for conversation scrap testing.'