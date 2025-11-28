// TypeScript types for Weave Knowledge Graph Schema

export type ArtifactType =
  | 'book'
  | 'album'
  | 'film'
  | 'essay'
  | 'artwork'
  | 'podcast'
  | 'article'
  | 'other';

export type ArtifactStatus =
  | 'want_to_explore'
  | 'exploring'
  | 'explored'
  | 'archived';

export type ConceptType =
  | 'theme'
  | 'movement'
  | 'theory'
  | 'technique'
  | 'style'
  | 'genre'
  | 'other';

export type RelationshipType =
  // Influence & Lineage
  | 'influenced_by'
  | 'responds_to'
  | 'builds_on'
  // Direct References
  | 'references'
  | 'adapts'
  | 'samples'
  | 'quotes'
  // Thematic Connections
  | 'explores_similar_themes'
  | 'contrasts_with'
  | 'complements'
  // Structural/Formal
  | 'uses_similar_technique'
  | 'similar_style'
  | 'same_genre'
  // Personal Connections
  | 'reminds_me_of'
  | 'pairs_well_with'
  | 'discovered_through';

export type ConnectionSource =
  | 'user_discovered'
  | 'ai_suggested'
  | 'factual_reference';

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface Artifact {
  id: string;
  user_id: string | null;

  // Core metadata
  type: ArtifactType;
  title: string;
  creator: string | null;
  year: number | null;
  medium: string | null;

  // User engagement
  user_notes: string | null;
  status: ArtifactStatus | null;

  // Discovery context
  discovered_via: string | null; // conversation_id
  discovered_at: string | null; // ISO timestamp

  // Rich media
  image_url: string | null;
  external_links: ExternalLink[];

  // Structured metadata (type-specific fields)
  metadata: ArtifactMetadata;

  // Timestamps
  created_at: string;
  updated_at: string | null;
}

export interface Concept {
  id: string;
  name: string;
  type: ConceptType | null;
  description: string | null;
  is_user_created: boolean;
  created_by_user: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface Connection {
  id: string;
  user_id: string;

  // The connection
  source_artifact_id: string;
  target_artifact_id: string;

  // Relationship metadata
  relationship_type: RelationshipType;
  description: string | null;

  // Connection classification
  connection_source: ConnectionSource;
  user_accepted: boolean | null;

  // User insight
  user_insight: string | null;

  // Discovery context
  discovered_in_conversation_id: string | null;

  // Strength/confidence (0.0 to 1.0)
  strength: number;

  // Timestamps
  created_at: string;
  updated_at: string | null;
}

export interface Conversation {
  id: string;
  user_id: string;

  // Conversation metadata
  title: string | null;
  summary: string | null;

  // Messages
  messages: ConversationMessage[];

  // Extracted entities
  mentioned_artifact_ids: string[];
  discovered_connection_ids: string[];
  key_concepts: string[];

  // Status
  is_archived: boolean;

  // Timestamps
  created_at: string;
  updated_at: string | null;
}

export interface ArtifactConcept {
  id: string;
  artifact_id: string;
  concept_id: string;
  added_by_user: string | null;
  relevance_score: number;
  created_at: string;
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface ExternalLink {
  type: 'spotify' | 'goodreads' | 'imdb' | 'wikipedia' | 'youtube' | 'other';
  url: string;
  label?: string;
}

// Flexible metadata for different artifact types
export type ArtifactMetadata = Record<string, any>;

// Type-specific metadata interfaces for better type safety
export interface BookMetadata {
  isbn?: string;
  pages?: number;
  publisher?: string;
  genre?: string[];
  language?: string;
}

export interface AlbumMetadata {
  spotify_id?: string;
  apple_music_id?: string;
  label?: string;
  runtime_minutes?: number;
  genre?: string[];
  tracks?: number;
}

export interface FilmMetadata {
  imdb_id?: string;
  runtime_minutes?: number;
  director?: string;
  language?: string;
  country?: string;
  genre?: string[];
}

export interface EssayMetadata {
  publication?: string;
  word_count?: number;
  url?: string;
  published_date?: string;
}

export interface PodcastMetadata {
  show_name?: string;
  episode_number?: number;
  runtime_minutes?: number;
  host?: string;
  url?: string;
}

export interface ConversationMessage {
  id: string;
  sender: 'user' | 'bobbin';
  content: string;
  timestamp: string;
  media?: {
    type: 'image' | 'audio';
    url: string;
    caption?: string;
  };
}

// ============================================================================
// CREATE/UPDATE TYPES
// ============================================================================

export interface CreateArtifactData {
  type: ArtifactType;
  title: string;
  creator?: string | null;
  year?: number | null;
  medium?: string | null;
  user_notes?: string | null;
  status?: ArtifactStatus | null;
  discovered_via?: string | null;
  image_url?: string | null;
  external_links?: ExternalLink[];
  metadata?: ArtifactMetadata;
}

export interface UpdateArtifactData {
  title?: string;
  creator?: string | null;
  year?: number | null;
  medium?: string | null;
  user_notes?: string | null;
  status?: ArtifactStatus | null;
  image_url?: string | null;
  external_links?: ExternalLink[];
  metadata?: ArtifactMetadata;
}

export interface CreateConceptData {
  name: string;
  type?: ConceptType | null;
  description?: string | null;
  is_user_created?: boolean;
}

export interface CreateConnectionData {
  source_artifact_id: string;
  target_artifact_id: string;
  relationship_type: RelationshipType;
  description?: string | null;
  connection_source: ConnectionSource;
  user_insight?: string | null;
  discovered_in_conversation_id?: string | null;
  strength?: number;
}

export interface UpdateConnectionData {
  description?: string | null;
  user_accepted?: boolean | null;
  user_insight?: string | null;
  strength?: number;
}

export interface CreateConversationData {
  title?: string | null;
  messages?: ConversationMessage[];
}

export interface UpdateConversationData {
  title?: string | null;
  summary?: string | null;
  messages?: ConversationMessage[];
  mentioned_artifact_ids?: string[];
  discovered_connection_ids?: string[];
  key_concepts?: string[];
  is_archived?: boolean;
}

// ============================================================================
// ENRICHED/JOINED TYPES (for UI display)
// ============================================================================

// Connection with full artifact details
export interface EnrichedConnection extends Connection {
  source_artifact: Artifact;
  target_artifact: Artifact;
}

// Artifact with its connections and concepts
export interface ArtifactWithRelations extends Artifact {
  connections: EnrichedConnection[];
  concepts: Concept[];
  discovery_conversation?: Conversation | null;
}

// Conversation with mentioned artifacts
export interface ConversationWithArtifacts extends Conversation {
  artifacts: Artifact[];
  connections: Connection[];
}

// Concept with linked artifacts
export interface ConceptWithArtifacts extends Concept {
  artifacts: Artifact[];
  artifact_count: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ArtifactGraphNode {
  artifact: Artifact;
  connections: {
    outgoing: EnrichedConnection[];
    incoming: EnrichedConnection[];
  };
  concepts: Concept[];
  depth: number; // How many hops from origin
}

export interface ConnectionSuggestion {
  connection: Connection;
  confidence: number;
  reasoning: string;
  source_artifact: Artifact;
  target_artifact: Artifact;
}

// ============================================================================
// ENTITY EXTRACTION TYPES
// ============================================================================

export interface ExtractedEntity {
  type: 'artifact' | 'concept';
  artifact_type?: ArtifactType;
  concept_type?: ConceptType;
  title?: string; // for artifacts
  name?: string; // for concepts
  creator?: string;
  context: string; // The sentence/phrase where it was mentioned
  confidence: number; // 0.0 to 1.0
}

export interface ExtractedConnection {
  source: string; // artifact title or id
  target: string; // artifact title or id
  relationship_type: RelationshipType;
  description: string;
  user_insight?: string;
  confidence: number;
}

export interface ConversationAnalysis {
  entities: ExtractedEntity[];
  connections: ExtractedConnection[];
  key_concepts: string[];
  summary: string;
}

// ============================================================================
// FILTER/QUERY TYPES
// ============================================================================

export interface ArtifactFilters {
  type?: ArtifactType[];
  status?: ArtifactStatus[];
  creator?: string;
  year_min?: number;
  year_max?: number;
  has_connections?: boolean;
  concept_ids?: string[];
  search_query?: string;
}

export interface ConnectionFilters {
  relationship_types?: RelationshipType[];
  connection_source?: ConnectionSource[];
  user_accepted?: boolean | null;
  strength_min?: number;
  artifact_id?: string; // Find connections to/from this artifact
  concept_id?: string; // Find connections related to this concept
}

// ============================================================================
// PATTERN DETECTION TYPES
// ============================================================================

export type PatternType =
  | 'thematic'    // Similar themes, ideas, or subjects
  | 'stylistic'   // Artistic approach, tone, mood
  | 'temporal'    // Era, movement, time period
  | 'creator'     // Same creator or collaborative relationships
  | 'medium'      // Similar medium or format
  | 'personal'    // Based on user's notes/reflections

export interface DetectedPattern {
  id: string
  pattern: string           // Brief, insightful statement
  description: string       // Longer explanation
  artifact_ids: string[]    // IDs of artifacts in this pattern
  artifact_titles: string[] // Titles for display
  confidence: number        // 0.0 to 1.0
  pattern_type: PatternType
  created_at?: string
}

export interface PatternDetectionResult {
  success: boolean
  patterns: DetectedPattern[]
  artifact_count: number
  message?: string
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PaginationParams {
  limit?: number;
  offset?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
}
