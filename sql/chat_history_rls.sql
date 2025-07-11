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

-- Grant necessary permissions
GRANT ALL ON chat_history TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 