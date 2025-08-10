# Staging Database Update for Conversation Scraps

## Overview
Before testing the conversation scrap feature, you need to update your staging database schema to include the required fields.

## Required Database Changes

### 1. Add New Columns
```sql
-- Add content field for storing conversation JSON data
ALTER TABLE scraps ADD COLUMN content TEXT;

-- Add conversation_id field for linking scraps to conversations
ALTER TABLE scraps ADD COLUMN conversation_id TEXT;
```

### 2. Add Indexes for Performance
```sql
-- Add index on conversation_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_scraps_conversation_id ON scraps(conversation_id);

-- Add index on type for faster filtering
CREATE INDEX IF NOT EXISTS idx_scraps_type ON scraps(type);
```

### 3. Update Type Constraint
```sql
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
```

## Easy Option: Run the Script
You can run the complete update script:
```bash
psql -d your_staging_database -f scripts/update-staging-schema.sql
```

## Verification
After running the updates, verify the changes:
```sql
-- Check new columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'scraps' 
    AND column_name IN ('content', 'conversation_id');

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'scraps' 
    AND indexname LIKE 'idx_scraps_%';
```

## What This Enables
- ✅ Conversation scraps creation without errors
- ✅ Proper conversation data storage in `content` field
- ✅ Direct conversation linking via `conversation_id`
- ✅ Fast queries with proper indexing
- ✅ Type safety with updated constraints

## After Database Update
Once the database is updated, the conversation scrap system will work properly:
1. Start a conversation → Scrap automatically created
2. Continue chatting → Conversation data updated in real-time  
3. View in feed → See conversation preview with "Continue" button
4. Click continue → Return to chat seamlessly

The React key errors and database insertion errors will be resolved.