-- Create user_feedback table for collecting product validation insights
-- Run this migration against your Supabase database

CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_reason TEXT,
  would_recommend INTEGER CHECK (would_recommend >= 1 AND would_recommend <= 5),
  missing_feature TEXT,
  open_feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_submitted_at ON user_feedback(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_feedback_would_recommend ON user_feedback(would_recommend);

-- Enable Row Level Security
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only insert their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON user_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
  ON user_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Admins can read all feedback
-- Note: This assumes you have an admin role or function to check admin status
-- You may need to adjust based on your admin setup
CREATE POLICY "Admins can read all feedback"
  ON user_feedback
  FOR SELECT
  TO authenticated
  USING (
    -- Option 1: Check if user email is in admin list (simple approach)
    auth.jwt() ->> 'email' IN (
      SELECT email FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
    -- Option 2: If you have a separate admin check, replace the above
    -- OR exists (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Grant permissions
GRANT ALL ON user_feedback TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE user_feedback IS 'Stores user feedback for product validation and improvement insights';
COMMENT ON COLUMN user_feedback.usage_reason IS 'What brought the user to Weave - their motivation for trying the product';
COMMENT ON COLUMN user_feedback.would_recommend IS 'NPS-style score 1-5 on likelihood to recommend';
COMMENT ON COLUMN user_feedback.missing_feature IS 'The one feature user feels is missing';
COMMENT ON COLUMN user_feedback.open_feedback IS 'Optional open-ended feedback';

