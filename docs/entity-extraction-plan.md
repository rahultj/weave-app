# Entity Extraction & Connection Discovery Plan

## Overview

This document outlines the system for analyzing conversations with Bobbin to automatically:
1. Extract mentioned cultural artifacts
2. Identify concepts and themes
3. Suggest connections between artifacts
4. Learn user preferences over time

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     User chats with Bobbin                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Conversation saved to database                     │
│              (conversations.messages JSONB)                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│            Entity Extraction Triggered (async)                  │
│                                                                 │
│  When:                                                          │
│  • User explicitly saves conversation                           │
│  • Every N messages (e.g., every 10 messages)                   │
│  • User clicks "Find connections"                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   LLM Analysis Pipeline                         │
│                                                                 │
│  1. Analyze conversation transcript                             │
│  2. Extract artifacts mentioned                                 │
│  3. Identify key concepts/themes                                │
│  4. Detect stated connections                                   │
│  5. Suggest potential connections                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Store Results in Database                      │
│                                                                 │
│  • New artifacts → artifacts table                              │
│  • User-stated connections → connections (user_discovered)      │
│  • AI suggestions → connections (ai_suggested, pending)         │
│  • Update conversation.mentioned_artifact_ids                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    User Reviews Results                         │
│                                                                 │
│  Feed shows:                                                    │
│  • "New artifact discovered: The Dispossessed"                  │
│  • "Suggested connection: MOTOMAMI ↔ Carrier Bag Theory"       │
│  • User can: Accept / Reject / Edit                             │
└─────────────────────────────────────────────────────────────────┘
```

## Entity Extraction Process

### Step 1: Conversation Analysis

When triggered, send conversation transcript to LLM with structured prompt:

```typescript
const extractionPrompt = `
Analyze this conversation between a user and their cultural AI assistant.
Extract all cultural artifacts mentioned and identify key themes/concepts.

Conversation:
${conversationTranscript}

Return a JSON response with:
{
  "artifacts": [
    {
      "title": "The Dispossessed",
      "type": "book",
      "creator": "Ursula K. Le Guin",
      "year": 1974,
      "context": "User mentioned finishing this book",
      "confidence": 0.95
    }
  ],
  "concepts": [
    {
      "name": "anarchism",
      "type": "theme",
      "context": "Discussed as central theme of The Dispossessed"
    }
  ],
  "user_stated_connections": [
    {
      "source": "The Dispossessed",
      "target": "MOTOMAMI",
      "relationship_type": "explores_similar_themes",
      "description": "Both challenge established power structures",
      "user_insight": "The way it challenges capitalist structures felt similar..."
    }
  ],
  "suggested_connections": [
    {
      "source": "The Dispossessed",
      "target": "Carrier Bag Theory of Fiction",
      "relationship_type": "written_by_same_author",
      "reasoning": "Both written by Ursula K. Le Guin",
      "confidence": 1.0
    }
  ]
}
`;
```

### Step 2: Entity Validation & Enrichment

For each extracted artifact:

1. **Check if already exists**
   ```typescript
   const existing = await findArtifactByTitleAndCreator(title, creator, userId);
   ```

2. **If new, enrich metadata**
   - For books: Attempt to fetch ISBN, pages, publisher from Open Library API
   - For albums: Check Spotify/MusicBrainz for metadata
   - For films: Query TMDB/OMDB for details
   - If no API available, use user-provided/LLM-extracted data

3. **Create artifact record**
   ```typescript
   const artifact = await createArtifact({
     type: 'book',
     title: 'The Dispossessed',
     creator: 'Ursula K. Le Guin',
     year: 1974,
     discovered_via: conversationId,
     discovered_at: new Date(),
     metadata: enrichedMetadata
   });
   ```

4. **Link concepts**
   ```typescript
   for (const conceptName of ['anarchism', 'utopia']) {
     const concept = await findOrCreateConcept(conceptName, 'theme');
     await linkArtifactToConcept(artifact.id, concept.id);
   }
   ```

### Step 3: Connection Creation

#### User-Stated Connections

If user explicitly stated a connection during conversation:

```typescript
const connection = await createConnection({
  source_artifact_id: sourceId,
  target_artifact_id: targetId,
  relationship_type: 'explores_similar_themes',
  description: extractedDescription,
  connection_source: 'user_discovered',
  user_insight: extractedUserInsight,
  discovered_in_conversation_id: conversationId,
  strength: 0.8 // High confidence since user stated it
});
```

**Auto-accepted** - User explicitly made the connection

#### AI-Suggested Connections

If Bobbin identified a potential connection:

```typescript
const suggestion = await createConnection({
  source_artifact_id: sourceId,
  target_artifact_id: targetId,
  relationship_type: 'written_by_same_author',
  description: 'Both works by Ursula K. Le Guin',
  connection_source: 'ai_suggested',
  user_accepted: null, // Pending review
  discovered_in_conversation_id: conversationId,
  strength: confidence // From LLM
});
```

**Requires user review** - Shows up as pending suggestion

#### Factual Reference Connections

If there's a verifiable reference (e.g., liner notes, citation):

```typescript
const factualConnection = await createConnection({
  source_artifact_id: albumId,
  target_artifact_id: essayId,
  relationship_type: 'references',
  description: 'Explicitly referenced in album liner notes',
  connection_source: 'factual_reference',
  user_accepted: true, // Auto-accepted for factual refs
  strength: 1.0
});
```

**Auto-accepted** - Objective fact

## LLM Prompts

### Main Extraction Prompt

```typescript
export const ENTITY_EXTRACTION_PROMPT = `
You are analyzing a conversation to extract cultural artifacts, concepts, and connections.

Your task:
1. Identify all cultural artifacts mentioned (books, albums, films, essays, artworks, podcasts)
2. Extract creator names, years if mentioned
3. Identify key themes, concepts, movements discussed
4. Note any connections the user explicitly stated
5. Suggest additional connections you notice

Guidelines:
- Only extract artifacts explicitly mentioned or clearly referenced
- Confidence scores: 1.0 = certain, 0.8 = very likely, 0.5 = possible, <0.5 = uncertain
- Don't suggest connections unless there's clear thematic/factual link
- Preserve user's exact wording for insights
- Be conservative with suggestions - quality over quantity

Return structured JSON matching the ConversationAnalysis interface.
`;
```

### Connection Reasoning Prompt

For suggesting connections, use a separate detailed prompt:

```typescript
export const CONNECTION_SUGGESTION_PROMPT = `
Given these two cultural artifacts from a user's collection:

Artifact A: ${artifact1.title} by ${artifact1.creator} (${artifact1.type})
User notes: ${artifact1.user_notes}

Artifact B: ${artifact2.title} by ${artifact2.creator} (${artifact2.type})
User notes: ${artifact2.user_notes}

Analyze if there are meaningful connections between them.

Consider:
- Thematic similarities or contrasts
- Shared techniques or styles
- Historical/cultural context
- Direct references or influences
- Genre or movement connections

If you find a connection, provide:
{
  "has_connection": true,
  "relationship_type": "explores_similar_themes",
  "description": "Brief explanation",
  "confidence": 0.7,
  "reasoning": "Detailed analysis of why these connect"
}

If no meaningful connection exists, return:
{
  "has_connection": false,
  "reasoning": "Why these don't meaningfully connect"
}

Be selective - only suggest connections that would genuinely help the user understand their cultural interests.
`;
```

## Triggering Extraction

### Option 1: Manual Trigger

User explicitly requests:
- Clicks "Save & Extract" button at end of conversation
- Clicks "Find Connections" on an artifact detail page
- Uses "Analyze Conversation" action from feed

```typescript
// In chat page
const handleSaveAndExtract = async () => {
  // 1. Save conversation
  const conversation = await saveConversation(messages);

  // 2. Trigger extraction (async)
  await extractEntitiesFromConversation(conversation.id);

  // 3. Show success + navigate to review page
  router.push(`/app/review-suggestions?conversation=${conversation.id}`);
};
```

### Option 2: Automatic Background Extraction

Every N messages, automatically extract in background:

```typescript
// In chat message handler
const handleSendMessage = async (content: string) => {
  // ... send message logic

  // After every 10 messages, trigger extraction
  if (messages.length > 0 && messages.length % 10 === 0) {
    await extractEntitiesFromConversation(currentConversationId, {
      background: true // Don't block UI
    });
  }
};
```

### Option 3: On-Demand During Conversation

Bobbin proactively suggests during chat:

```
User: "I just finished reading The Dispossessed"
Bobbin: "Wonderful choice! Would you like me to add it to your collection and look for connections?"
User: "Yes"
→ Trigger immediate extraction for mentioned artifact
```

## Entity Deduplication

### Fuzzy Matching for Artifacts

Before creating new artifact, check for similar existing ones:

```typescript
async function findSimilarArtifacts(
  title: string,
  creator: string,
  type: ArtifactType
): Promise<Artifact[]> {
  // 1. Exact match
  const exact = await findArtifactByTitleAndCreator(title, creator);
  if (exact) return [exact];

  // 2. Fuzzy title match (using PostgreSQL similarity)
  const similar = await supabase
    .from('artifacts')
    .select('*')
    .eq('type', type)
    .ilike('title', `%${title}%`)
    .limit(5);

  // 3. LLM-based matching for ambiguous cases
  if (similar.length > 0) {
    const match = await llmConfirmMatch(title, creator, similar);
    return match ? [match] : [];
  }

  return [];
}
```

### Concept Normalization

Ensure concepts are consistent:

```typescript
// Normalize concept names
const normalizeConceptName = (name: string): string => {
  return name.toLowerCase()
    .trim()
    .replace(/\s+/g, ' '); // Normalize whitespace
};

// Find or create concept
async function findOrCreateConcept(
  name: string,
  type: ConceptType
): Promise<Concept> {
  const normalized = normalizeConceptName(name);

  const existing = await supabase
    .from('concepts')
    .select('*')
    .ilike('name', normalized)
    .single();

  if (existing.data) return existing.data;

  return await createConcept({ name: normalized, type });
}
```

## User Feedback Loop

### Accepting Suggestions

```typescript
const acceptConnection = async (connectionId: string) => {
  await supabase
    .from('connections')
    .update({ user_accepted: true })
    .eq('id', connectionId);

  // Update user preference model (for learning)
  await recordUserFeedback({
    connection_id: connectionId,
    action: 'accepted',
    relationship_type: connection.relationship_type
  });
};
```

### Rejecting Suggestions

```typescript
const rejectConnection = async (connectionId: string, reason?: string) => {
  await supabase
    .from('connections')
    .update({ user_accepted: false })
    .eq('id', connectionId);

  // Learn from rejection
  await recordUserFeedback({
    connection_id: connectionId,
    action: 'rejected',
    reason,
    relationship_type: connection.relationship_type
  });
};
```

### Learning from Feedback

Over time, adjust suggestion confidence based on user patterns:

```typescript
// Track which relationship types user prefers
interface UserPreferences {
  accepted_relationship_types: Map<RelationshipType, number>;
  rejected_relationship_types: Map<RelationshipType, number>;
  preferred_connection_sources: ConnectionSource[];
  min_acceptable_confidence: number;
}

// Adjust future suggestions
const adjustSuggestionConfidence = (
  baseConfidence: number,
  relationshipType: RelationshipType,
  userPrefs: UserPreferences
): number => {
  const acceptRate = getAcceptanceRate(relationshipType, userPrefs);
  return baseConfidence * acceptRate;
};
```

## API Endpoints

### Extract Entities from Conversation

```typescript
// POST /api/extract-entities
{
  "conversation_id": "uuid",
  "options": {
    "include_suggestions": true,
    "min_confidence": 0.7
  }
}

// Response:
{
  "artifacts_created": 3,
  "concepts_identified": 5,
  "connections_created": 2,
  "suggestions_pending": 4,
  "entities": [...],
  "suggestions": [...]
}
```

### Get Pending Suggestions

```typescript
// GET /api/suggestions/pending
{
  "suggestions": [
    {
      "id": "uuid",
      "source_artifact": {...},
      "target_artifact": {...},
      "relationship_type": "explores_similar_themes",
      "description": "...",
      "confidence": 0.8,
      "reasoning": "Both explore themes of..."
    }
  ]
}
```

### Accept/Reject Suggestion

```typescript
// POST /api/suggestions/:id/review
{
  "action": "accept" | "reject",
  "reason": "optional feedback"
}
```

## Performance Considerations

### Async Processing

Don't block UI while extracting:

```typescript
// Queue extraction job
await queueJob('extract-entities', {
  conversation_id: conversationId,
  user_id: userId
});

// Show optimistic UI
showToast('Analyzing conversation... Check back soon!');
```

### Batch Processing

Process multiple conversations together:

```typescript
// Nightly job: analyze all unprocessed conversations
const unprocessed = await getUnprocessedConversations();
for (const conv of unprocessed) {
  await extractEntities(conv.id);
}
```

### Caching

Cache LLM results to avoid re-processing:

```typescript
// Check if conversation already analyzed
const cached = await getCachedAnalysis(conversationId);
if (cached) return cached;

// Otherwise, analyze and cache
const analysis = await analyzeCon versation(messages);
await cacheAnalysis(conversationId, analysis);
return analysis;
```

## Next Steps

1. **Implement extraction API endpoint** (`/api/extract-entities`)
2. **Create entity extraction service** using Claude API
3. **Build suggestion review UI** in feed
4. **Add "Save & Extract" flow** to chat page
5. **Test with real conversations** and iterate on prompts
6. **Implement learning system** to improve suggestions over time
