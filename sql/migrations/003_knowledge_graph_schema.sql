-- Migration: Create Knowledge Graph Schema for Cultural Connections
-- This creates a comprehensive schema for tracking artifacts, concepts, and connections

-- ============================================================================
-- 1. ARTIFACTS TABLE
-- Stores cultural objects: books, albums, films, essays, artworks, podcasts
-- ============================================================================

CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core metadata
  type TEXT NOT NULL CHECK (type IN ('book', 'album', 'film', 'essay', 'artwork', 'podcast', 'article', 'other')),
  title TEXT NOT NULL,
  creator TEXT, -- Author, artist, director, etc.
  year INTEGER,
  medium TEXT, -- "Novel", "Oil painting", "Documentary", etc.

  -- User engagement
  user_notes TEXT, -- User's personal observations and reflections
  status TEXT CHECK (status IN ('want_to_explore', 'exploring', 'explored', 'archived')),

  -- Discovery context
  discovered_via UUID, -- Foreign key added later after conversations table exists
  discovered_at TIMESTAMPTZ,

  -- Rich media
  image_url TEXT,
  external_links JSONB DEFAULT '[]'::jsonb, -- [{type: 'spotify', url: '...'}, ...]

  -- Structured metadata (flexible JSON for type-specific fields)
  metadata JSONB DEFAULT '{}'::jsonb, -- {isbn: '...', runtime: 120, etc.}

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_artifacts_user_id ON artifacts(user_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(type);
CREATE INDEX IF NOT EXISTS idx_artifacts_created_at ON artifacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artifacts_discovered_via ON artifacts(discovered_via);

-- Full-text search on title and creator
CREATE INDEX IF NOT EXISTS idx_artifacts_search ON artifacts USING gin(to_tsvector('english', title || ' ' || COALESCE(creator, '')));

COMMENT ON TABLE artifacts IS 'Cultural artifacts tracked by users (books, albums, films, etc.)';
COMMENT ON COLUMN artifacts.user_notes IS 'User''s personal observations and reflections about the artifact';
COMMENT ON COLUMN artifacts.discovered_via IS 'Conversation where this artifact was discovered';
COMMENT ON COLUMN artifacts.metadata IS 'Flexible JSON for type-specific fields (ISBN, runtime, etc.)';

-- ============================================================================
-- 2. CONCEPTS TABLE
-- Stores themes, movements, theories, techniques that connect artifacts
-- ============================================================================

CREATE TABLE IF NOT EXISTS concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core fields
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('theme', 'movement', 'theory', 'technique', 'style', 'genre', 'other')),
  description TEXT,

  -- Context
  is_user_created BOOLEAN DEFAULT false, -- Personal concept vs universal
  created_by_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_concepts_type ON concepts(type);
CREATE INDEX IF NOT EXISTS idx_concepts_created_by_user ON concepts(created_by_user);

-- Create unique index on lowercase name for case-insensitive uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_concepts_name_lower ON concepts (LOWER(name));

COMMENT ON TABLE concepts IS 'Themes, movements, theories that connect cultural artifacts';
COMMENT ON COLUMN concepts.is_user_created IS 'True if concept was created by a user, false if universal/AI-suggested';

-- ============================================================================
-- 3. CONNECTIONS TABLE
-- Stores relationships between artifacts (both personal and universal)
-- ============================================================================

CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- The connection
  source_artifact_id UUID REFERENCES artifacts(id) ON DELETE CASCADE NOT NULL,
  target_artifact_id UUID REFERENCES artifacts(id) ON DELETE CASCADE NOT NULL,

  -- Relationship metadata
  relationship_type TEXT NOT NULL, -- 'references', 'influenced_by', 'samples', 'in_conversation_with', etc.
  description TEXT, -- How they're connected

  -- Connection classification
  connection_source TEXT NOT NULL CHECK (connection_source IN ('user_discovered', 'ai_suggested', 'factual_reference')),
  user_accepted BOOLEAN DEFAULT NULL, -- NULL = pending, true = accepted, false = rejected

  -- User insight
  user_insight TEXT, -- User's personal interpretation of the connection

  -- Discovery context
  discovered_in_conversation_id UUID, -- Foreign key added later after conversations table exists

  -- Strength/confidence (0.0 to 1.0)
  strength FLOAT DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate connections
  CONSTRAINT unique_connection UNIQUE (user_id, source_artifact_id, target_artifact_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_source ON connections(source_artifact_id);
CREATE INDEX IF NOT EXISTS idx_connections_target ON connections(target_artifact_id);
CREATE INDEX IF NOT EXISTS idx_connections_conversation ON connections(discovered_in_conversation_id);
CREATE INDEX IF NOT EXISTS idx_connections_user_accepted ON connections(user_accepted);

COMMENT ON TABLE connections IS 'Relationships between cultural artifacts';
COMMENT ON COLUMN connections.connection_source IS 'How the connection was discovered: user, AI, or factual';
COMMENT ON COLUMN connections.user_accepted IS 'NULL = pending review, true = accepted, false = rejected';
COMMENT ON COLUMN connections.strength IS 'Confidence score from 0.0 to 1.0';

-- ============================================================================
-- 4. CONVERSATIONS TABLE
-- Stores chat history where discoveries happen
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Conversation metadata
  title TEXT, -- Generated from first message or user-provided
  summary TEXT, -- AI-generated summary of key topics

  -- Messages (stored as JSONB array)
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Format: [{id, sender, content, timestamp, media}, ...]

  -- Extracted entities (for quick reference)
  mentioned_artifact_ids UUID[] DEFAULT '{}',
  discovered_connection_ids UUID[] DEFAULT '{}',
  key_concepts TEXT[] DEFAULT '{}',

  -- Status
  is_archived BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_is_archived ON conversations(is_archived);

-- GIN index for array columns
CREATE INDEX IF NOT EXISTS idx_conversations_mentioned_artifacts ON conversations USING gin(mentioned_artifact_ids);

COMMENT ON TABLE conversations IS 'Chat history where cultural discoveries happen';
COMMENT ON COLUMN conversations.messages IS 'JSONB array of message objects';
COMMENT ON COLUMN conversations.mentioned_artifact_ids IS 'Quick reference to artifacts discussed';

-- ============================================================================
-- 5. ARTIFACT_CONCEPTS JUNCTION TABLE
-- Many-to-many relationship between artifacts and concepts
-- ============================================================================

CREATE TABLE IF NOT EXISTS artifact_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID REFERENCES artifacts(id) ON DELETE CASCADE NOT NULL,
  concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE NOT NULL,

  -- Context
  added_by_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  relevance_score FLOAT DEFAULT 0.5 CHECK (relevance_score >= 0 AND relevance_score <= 1),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicates
  CONSTRAINT unique_artifact_concept UNIQUE (artifact_id, concept_id)
);

CREATE INDEX IF NOT EXISTS idx_artifact_concepts_artifact ON artifact_concepts(artifact_id);
CREATE INDEX IF NOT EXISTS idx_artifact_concepts_concept ON artifact_concepts(concept_id);

COMMENT ON TABLE artifact_concepts IS 'Links artifacts to concepts (themes, movements, etc.)';

-- ============================================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifact_concepts ENABLE ROW LEVEL SECURITY;

-- Artifacts policies
DROP POLICY IF EXISTS "Users can view their own artifacts" ON artifacts;
CREATE POLICY "Users can view their own artifacts" ON artifacts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own artifacts" ON artifacts;
CREATE POLICY "Users can insert their own artifacts" ON artifacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own artifacts" ON artifacts;
CREATE POLICY "Users can update their own artifacts" ON artifacts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own artifacts" ON artifacts;
CREATE POLICY "Users can delete their own artifacts" ON artifacts
  FOR DELETE USING (auth.uid() = user_id);

-- Concepts policies (concepts can be shared, but user-created ones are private)
DROP POLICY IF EXISTS "Anyone can view concepts" ON concepts;
CREATE POLICY "Anyone can view concepts" ON concepts
  FOR SELECT USING (
    is_user_created = false OR
    created_by_user = auth.uid() OR
    created_by_user IS NULL
  );

DROP POLICY IF EXISTS "Users can create concepts" ON concepts;
CREATE POLICY "Users can create concepts" ON concepts
  FOR INSERT WITH CHECK (
    (is_user_created = true AND created_by_user = auth.uid()) OR
    (is_user_created = false)
  );

DROP POLICY IF EXISTS "Users can update their own concepts" ON concepts;
CREATE POLICY "Users can update their own concepts" ON concepts
  FOR UPDATE USING (created_by_user = auth.uid());

-- Connections policies
DROP POLICY IF EXISTS "Users can view their own connections" ON connections;
CREATE POLICY "Users can view their own connections" ON connections
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own connections" ON connections;
CREATE POLICY "Users can insert their own connections" ON connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own connections" ON connections;
CREATE POLICY "Users can update their own connections" ON connections
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own connections" ON connections;
CREATE POLICY "Users can delete their own connections" ON connections
  FOR DELETE USING (auth.uid() = user_id);

-- Conversations policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
CREATE POLICY "Users can insert their own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
CREATE POLICY "Users can delete their own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Artifact_concepts policies (follows artifact ownership)
DROP POLICY IF EXISTS "Users can view artifact concepts" ON artifact_concepts;
CREATE POLICY "Users can view artifact concepts" ON artifact_concepts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM artifacts
      WHERE artifacts.id = artifact_concepts.artifact_id
      AND artifacts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert artifact concepts" ON artifact_concepts;
CREATE POLICY "Users can insert artifact concepts" ON artifact_concepts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM artifacts
      WHERE artifacts.id = artifact_concepts.artifact_id
      AND artifacts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete artifact concepts" ON artifact_concepts;
CREATE POLICY "Users can delete artifact concepts" ON artifact_concepts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM artifacts
      WHERE artifacts.id = artifact_concepts.artifact_id
      AND artifacts.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_artifacts_updated_at ON artifacts;
CREATE TRIGGER update_artifacts_updated_at
  BEFORE UPDATE ON artifacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_concepts_updated_at ON concepts;
CREATE TRIGGER update_concepts_updated_at
  BEFORE UPDATE ON concepts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_connections_updated_at ON connections;
CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. DATA MIGRATION FROM SCRAPS
-- ============================================================================

-- Migrate existing 'text' and 'image' scraps to artifacts
INSERT INTO artifacts (user_id, type, title, creator, medium, user_notes, image_url, created_at)
SELECT
  user_id,
  CASE
    WHEN type = 'text' THEN 'other'
    WHEN type = 'image' THEN 'artwork'
    ELSE 'other'
  END as type,
  title,
  creator,
  medium,
  observations as user_notes,
  image_url,
  created_at
FROM scraps
WHERE type IN ('text', 'image')
ON CONFLICT DO NOTHING;

-- Migrate existing 'conversation' scraps to conversations
INSERT INTO conversations (user_id, title, messages, created_at, updated_at)
SELECT
  user_id,
  title,
  COALESCE(content::jsonb, '[]'::jsonb) as messages,
  created_at,
  COALESCE(updated_at, created_at) as updated_at
FROM scraps
WHERE type = 'conversation' AND content IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ADD FOREIGN KEY CONSTRAINTS (after all tables created)
-- ============================================================================

-- Add foreign key from artifacts.discovered_via to conversations.id
ALTER TABLE artifacts
  ADD CONSTRAINT fk_artifacts_discovered_via
  FOREIGN KEY (discovered_via)
  REFERENCES conversations(id)
  ON DELETE SET NULL;

-- Add foreign key from connections.discovered_in_conversation_id to conversations.id
ALTER TABLE connections
  ADD CONSTRAINT fk_connections_discovered_in_conversation
  FOREIGN KEY (discovered_in_conversation_id)
  REFERENCES conversations(id)
  ON DELETE SET NULL;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

SELECT 'Knowledge graph schema migration complete!' as status,
       'Created tables: artifacts, concepts, connections, conversations, artifact_concepts' as tables,
       'Migrated existing scraps data to new schema' as migration_status;
