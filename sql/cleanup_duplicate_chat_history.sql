-- Check for duplicate chat history records
-- This script will identify and remove duplicate chat_history records
-- keeping only the most recent one for each scrap_id/user_id combination

-- First, let's see if there are any duplicates
SELECT 
  scrap_id, 
  user_id, 
  COUNT(*) as record_count,
  array_agg(id ORDER BY updated_at DESC) as all_ids,
  array_agg(updated_at ORDER BY updated_at DESC) as all_dates
FROM chat_history 
GROUP BY scrap_id, user_id 
HAVING COUNT(*) > 1
ORDER BY record_count DESC;

-- If duplicates exist, this query will remove them
-- It keeps the most recent record (highest updated_at) for each scrap_id/user_id
WITH duplicates_to_delete AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY scrap_id, user_id 
      ORDER BY updated_at DESC, created_at DESC
    ) as row_num
  FROM chat_history
)
DELETE FROM chat_history 
WHERE id IN (
  SELECT id 
  FROM duplicates_to_delete 
  WHERE row_num > 1
);

-- Show the count of records after cleanup
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT (scrap_id, user_id)) as unique_combinations
FROM chat_history;

-- Verify no duplicates remain
SELECT 
  scrap_id, 
  user_id, 
  COUNT(*) as record_count
FROM chat_history 
GROUP BY scrap_id, user_id 
HAVING COUNT(*) > 1; 