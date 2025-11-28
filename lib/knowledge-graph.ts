// Database helper functions for knowledge graph operations
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Artifact,
  Concept,
  Connection,
  Conversation,
  CreateArtifactData,
  CreateConceptData,
  CreateConnectionData,
  CreateConversationData,
  UpdateArtifactData,
  UpdateConnectionData,
  UpdateConversationData,
  EnrichedConnection,
  ArtifactWithRelations,
  ConnectionSuggestion,
  ConceptType
} from '@/lib/types/knowledge-graph'

// ============================================================================
// ARTIFACT OPERATIONS
// ============================================================================

/**
 * Get Supabase client (works in both client and server components)
 */
function getSupabaseClient() {
  // Try to get client component version first
  if (typeof window !== 'undefined') {
    return createClientComponentClient()
  }
  // Fallback to server version
  return null
}

/**
 * Create a new artifact in the database
 */
export async function createArtifact(
  data: CreateArtifactData,
  userId: string,
  supabaseClient?: SupabaseClient
): Promise<Artifact> {
  const supabase = supabaseClient || getSupabaseClient()
  if (!supabase) throw new Error('Supabase client not available')

  const { data: artifact, error } = await supabase
    .from('artifacts')
    .insert({
      user_id: userId,
      type: data.type,
      title: data.title,
      creator: data.creator || null,
      year: data.year || null,
      medium: data.medium || null,
      user_notes: data.user_notes || null,
      status: data.status || 'want_to_explore',
      discovered_via: data.discovered_via || null,
      discovered_at: new Date().toISOString(),
      image_url: data.image_url || null,
      external_links: data.external_links || [],
      metadata: data.metadata || {}
    })
    .select()
    .single()

  if (error) throw error
  return artifact
}

/**
 * Update an existing artifact
 */
export async function updateArtifact(
  artifactId: string,
  data: UpdateArtifactData
): Promise<Artifact> {
  const supabase = createClientComponentClient()

  const { data: artifact, error } = await supabase
    .from('artifacts')
    .update(data)
    .eq('id', artifactId)
    .select()
    .single()

  if (error) throw error
  return artifact
}

/**
 * Delete an artifact from the database
 */
export async function deleteArtifact(
  artifactId: string,
  supabaseClient?: SupabaseClient
): Promise<void> {
  const supabase = supabaseClient || getSupabaseClient()
  if (!supabase) throw new Error('Supabase client not available')

  // First delete related records (artifact_concepts)
  await supabase
    .from('artifact_concepts')
    .delete()
    .eq('artifact_id', artifactId)

  // Then delete the artifact itself
  const { error } = await supabase
    .from('artifacts')
    .delete()
    .eq('id', artifactId)

  if (error) throw error
}

/**
 * Find artifact by title and creator to avoid duplicates
 */
export async function findArtifactByTitleAndCreator(
  title: string,
  creator: string | null | undefined,
  userId: string
): Promise<Artifact | null> {
  const supabase = createClientComponentClient()

  const query = supabase
    .from('artifacts')
    .select('*')
    .eq('user_id', userId)
    .ilike('title', title)

  if (creator) {
    query.ilike('creator', creator)
  }

  const { data, error } = await query.maybeSingle()

  if (error) throw error
  return data
}

/**
 * Get all artifacts for a user
 */
export async function getUserArtifacts(userId: string, supabaseClient?: SupabaseClient): Promise<Artifact[]> {
  const supabase = supabaseClient || getSupabaseClient()
  if (!supabase) throw new Error('Supabase client not available')

  const { data, error } = await supabase
    .from('artifacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get artifact with all its relations (connections, concepts)
 */
export async function getArtifactWithRelations(
  artifactId: string
): Promise<ArtifactWithRelations | null> {
  const supabase = createClientComponentClient()

  // Get the artifact
  const { data: artifact, error: artifactError } = await supabase
    .from('artifacts')
    .select('*')
    .eq('id', artifactId)
    .single()

  if (artifactError) throw artifactError
  if (!artifact) return null

  // Get connections (both incoming and outgoing)
  const { data: connections, error: connectionsError } = await supabase
    .from('connections')
    .select(`
      *,
      source_artifact:artifacts!connections_source_artifact_id_fkey(*),
      target_artifact:artifacts!connections_target_artifact_id_fkey(*)
    `)
    .or(`source_artifact_id.eq.${artifactId},target_artifact_id.eq.${artifactId}`)

  if (connectionsError) throw connectionsError

  // Get concepts
  const { data: artifactConcepts, error: conceptsError } = await supabase
    .from('artifact_concepts')
    .select('concept_id, concepts(*)')
    .eq('artifact_id', artifactId)

  if (conceptsError) throw conceptsError

  const concepts = artifactConcepts?.map(ac => ac.concepts).filter(Boolean) as Concept[] || []

  return {
    ...artifact,
    connections: connections as EnrichedConnection[] || [],
    concepts
  }
}

// ============================================================================
// CONCEPT OPERATIONS
// ============================================================================

/**
 * Create a new concept or find existing
 */
export async function findOrCreateConcept(
  name: string,
  type: ConceptType,
  userId: string | null = null,
  supabaseClient?: SupabaseClient
): Promise<Concept> {
  const supabase = supabaseClient || getSupabaseClient()
  if (!supabase) throw new Error('Supabase client not available')

  // Try to find existing concept (case-insensitive)
  const { data: existing, error: findError } = await supabase
    .from('concepts')
    .select('*')
    .ilike('name', name)
    .maybeSingle()

  if (findError) throw findError
  if (existing) return existing

  // Create new concept
  const { data: newConcept, error: createError } = await supabase
    .from('concepts')
    .insert({
      name: name.toLowerCase().trim(),
      type,
      is_user_created: userId ? true : false,
      created_by_user: userId
    })
    .select()
    .single()

  if (createError) throw createError
  return newConcept
}

/**
 * Link an artifact to a concept
 */
export async function linkArtifactToConcept(
  artifactId: string,
  conceptId: string,
  userId: string,
  relevanceScore: number = 0.5,
  supabaseClient?: SupabaseClient
): Promise<void> {
  const supabase = supabaseClient || getSupabaseClient()
  if (!supabase) throw new Error('Supabase client not available')

  const { error } = await supabase
    .from('artifact_concepts')
    .insert({
      artifact_id: artifactId,
      concept_id: conceptId,
      added_by_user: userId,
      relevance_score: relevanceScore
    })

  if (error && !error.message.includes('duplicate')) {
    throw error
  }
}

// ============================================================================
// CONNECTION OPERATIONS
// ============================================================================

/**
 * Create a connection between two artifacts
 */
export async function createConnection(
  data: CreateConnectionData,
  userId: string
): Promise<Connection> {
  const supabase = createClientComponentClient()

  const { data: connection, error } = await supabase
    .from('connections')
    .insert({
      user_id: userId,
      source_artifact_id: data.source_artifact_id,
      target_artifact_id: data.target_artifact_id,
      relationship_type: data.relationship_type,
      description: data.description || null,
      connection_source: data.connection_source,
      user_accepted: data.connection_source === 'user_discovered' ? true : null,
      user_insight: data.user_insight || null,
      discovered_in_conversation_id: data.discovered_in_conversation_id || null,
      strength: data.strength || 0.5
    })
    .select()
    .single()

  if (error) throw error
  return connection
}

/**
 * Update a connection (for accepting/rejecting suggestions)
 */
export async function updateConnection(
  connectionId: string,
  data: UpdateConnectionData
): Promise<Connection> {
  const supabase = createClientComponentClient()

  const { data: connection, error } = await supabase
    .from('connections')
    .update(data)
    .eq('id', connectionId)
    .select()
    .single()

  if (error) throw error
  return connection
}

/**
 * Accept a connection suggestion
 */
export async function acceptConnection(connectionId: string): Promise<Connection> {
  return updateConnection(connectionId, { user_accepted: true })
}

/**
 * Reject a connection suggestion
 */
export async function rejectConnection(connectionId: string): Promise<Connection> {
  return updateConnection(connectionId, { user_accepted: false })
}

/**
 * Get pending connection suggestions for a user
 */
export async function getPendingSuggestions(userId: string): Promise<ConnectionSuggestion[]> {
  const supabase = createClientComponentClient()

  const { data, error } = await supabase
    .from('connections')
    .select(`
      *,
      source_artifact:artifacts!connections_source_artifact_id_fkey(*),
      target_artifact:artifacts!connections_target_artifact_id_fkey(*)
    `)
    .eq('user_id', userId)
    .eq('connection_source', 'ai_suggested')
    .is('user_accepted', null)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map(conn => ({
    connection: {
      id: conn.id,
      user_id: conn.user_id,
      source_artifact_id: conn.source_artifact_id,
      target_artifact_id: conn.target_artifact_id,
      relationship_type: conn.relationship_type,
      description: conn.description,
      connection_source: conn.connection_source,
      user_accepted: conn.user_accepted,
      user_insight: conn.user_insight,
      discovered_in_conversation_id: conn.discovered_in_conversation_id,
      strength: conn.strength,
      created_at: conn.created_at,
      updated_at: conn.updated_at
    },
    confidence: conn.strength,
    reasoning: conn.description || '',
    source_artifact: conn.source_artifact,
    target_artifact: conn.target_artifact
  }))
}

// ============================================================================
// CONVERSATION OPERATIONS
// ============================================================================

/**
 * Create a new conversation
 */
export async function createConversation(
  data: CreateConversationData,
  userId: string,
  supabaseClient?: SupabaseClient
): Promise<Conversation> {
  const supabase = supabaseClient || getSupabaseClient()
  if (!supabase) throw new Error('Supabase client not available')

  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      title: data.title || null,
      messages: data.messages || []
    })
    .select()
    .single()

  if (error) throw error
  return conversation
}

/**
 * Update a conversation
 */
export async function updateConversation(
  conversationId: string,
  data: UpdateConversationData
): Promise<Conversation> {
  const supabase = createClientComponentClient()

  const { data: conversation, error } = await supabase
    .from('conversations')
    .update(data)
    .eq('id', conversationId)
    .select()
    .single()

  if (error) throw error
  return conversation
}

/**
 * Get a conversation by ID
 */
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const supabase = createClientComponentClient()

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single()

  if (error) throw error
  return data
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const supabase = createClientComponentClient()

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}
