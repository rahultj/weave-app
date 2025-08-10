-- Migration: Add conversation support fields to scraps table
-- This adds the fields needed for conversation scrap functionality

-- Add content field for storing conversation JSON data
ALTER TABLE scraps ADD COLUMN content TEXT;

-- Add conversation_id field for linking scraps to conversations
ALTER TABLE scraps ADD COLUMN conversation_id TEXT;

-- Add index on conversation_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_scraps_conversation_id ON scraps(conversation_id);

-- Add index on type for faster filtering
CREATE INDEX IF NOT EXISTS idx_scraps_type ON scraps(type);

-- Update the type constraint to include 'conversation'
-- First drop the existing constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'scraps_type_check' 
        AND table_name = 'scraps'
    ) THEN
        ALTER TABLE scraps DROP CONSTRAINT scraps_type_check;
    END IF;
END $$;

-- Add the updated constraint
ALTER TABLE scraps ADD CONSTRAINT scraps_type_check 
    CHECK (type IN ('text', 'image', 'conversation'));

-- Add comment to document the new fields
COMMENT ON COLUMN scraps.content IS 'JSON string containing conversation messages for conversation type scraps';
COMMENT ON COLUMN scraps.conversation_id IS 'Unique identifier linking scraps to chat conversations';

SELECT 'Conversation fields migration complete!' as status;