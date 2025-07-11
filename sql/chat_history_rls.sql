-- Add unique constraint to prevent duplicate chat histories per scrap/user combination
ALTER TABLE chat_history ADD CONSTRAINT chat_history_scrap_user_unique 
  UNIQUE (scrap_id, user_id);

-- Enable RLS on chat_history table
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own chat history
CREATE POLICY "Users can view their own chat history" ON chat_history
    FOR SELECT USING (auth.uid() = user_id::uuid);

-- Policy: Users can insert their own chat history
CREATE POLICY "Users can insert their own chat history" ON chat_history
    FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

-- Policy: Users can update their own chat history
CREATE POLICY "Users can update their own chat history" ON chat_history
    FOR UPDATE USING (auth.uid() = user_id::uuid);

-- Policy: Users can delete their own chat history
CREATE POLICY "Users can delete their own chat history" ON chat_history
    FOR DELETE USING (auth.uid() = user_id::uuid);

-- Create a function for proper upsert with created_at handling
CREATE OR REPLACE FUNCTION upsert_chat_history(
  p_scrap_id text,
  p_user_id text, 
  p_messages jsonb,
  p_updated_at timestamptz DEFAULT now()
)
RETURNS TABLE(
  id text,
  scrap_id text,
  user_id text,
  messages jsonb,
  created_at timestamptz,
  updated_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO chat_history (scrap_id, user_id, messages, created_at, updated_at)
  VALUES (p_scrap_id, p_user_id, p_messages, p_updated_at, p_updated_at)
  ON CONFLICT (scrap_id, user_id)
  DO UPDATE SET 
    messages = EXCLUDED.messages,
    updated_at = EXCLUDED.updated_at
  RETURNING 
    chat_history.id,
    chat_history.scrap_id,
    chat_history.user_id,
    chat_history.messages,
    chat_history.created_at,
    chat_history.updated_at;
END;
$$;

-- Grant necessary permissions
GRANT ALL ON chat_history TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_chat_history TO authenticated; 