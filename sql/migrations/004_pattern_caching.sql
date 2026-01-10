-- Migration: Pattern Caching Tables
-- Required for: Pattern detection and caching feature
-- Run this on production Supabase before deploying

-- Table: pattern_cache_meta
-- Tracks when patterns were last computed for each user
CREATE TABLE IF NOT EXISTS pattern_cache_meta (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    last_computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    artifact_count_at_compute INTEGER NOT NULL DEFAULT 0
);

-- Table: cached_patterns
-- Stores detected patterns for each user
CREATE TABLE IF NOT EXISTS cached_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pattern TEXT NOT NULL,
    description TEXT,
    artifact_ids UUID[] DEFAULT '{}',
    artifact_titles TEXT[] DEFAULT '{}',
    confidence NUMERIC(3,2) NOT NULL DEFAULT 0.0,
    pattern_type TEXT NOT NULL DEFAULT 'thematic',
    pattern_hash TEXT,
    explored BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cached_patterns_user_id ON cached_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_cached_patterns_confidence ON cached_patterns(confidence DESC);

-- RLS Policies
ALTER TABLE pattern_cache_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_patterns ENABLE ROW LEVEL SECURITY;

-- pattern_cache_meta policies
CREATE POLICY "Users can view their own cache meta"
    ON pattern_cache_meta FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cache meta"
    ON pattern_cache_meta FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cache meta"
    ON pattern_cache_meta FOR UPDATE
    USING (auth.uid() = user_id);

-- cached_patterns policies
CREATE POLICY "Users can view their own cached patterns"
    ON cached_patterns FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cached patterns"
    ON cached_patterns FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cached patterns"
    ON cached_patterns FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cached patterns"
    ON cached_patterns FOR DELETE
    USING (auth.uid() = user_id);

