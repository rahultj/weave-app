# Knowledge Graph Schema Documentation

## Overview

The Weave knowledge graph enables users to discover and map connections between cultural artifacts (books, albums, films, essays, etc.). The system tracks both universal/factual connections and personal discoveries.

## Core Entities

### 1. Artifacts

Cultural objects that users engage with and explore.

**Types:**
- `book` - Novels, non-fiction, poetry collections, etc.
- `album` - Music albums, EPs, singles
- `film` - Movies, documentaries, short films
- `essay` - Long-form writing, think pieces
- `artwork` - Paintings, sculptures, installations
- `podcast` - Podcast episodes or series
- `article` - News articles, blog posts
- `other` - Any other cultural artifact

**Status Values:**
- `want_to_explore` - User discovered it but hasn't engaged yet
- `exploring` - Currently engaging with the artifact
- `explored` - Finished engaging, integrated into knowledge
- `archived` - Saved for later but not active

**Metadata Examples** (stored in flexible JSONB):
```json
// Book
{
  "isbn": "978-0-441-00731-6",
  "pages": 400,
  "publisher": "Harper Voyager",
  "genre": ["science fiction", "anarchism"]
}

// Album
{
  "spotify_id": "...",
  "label": "Columbia Records",
  "runtime_minutes": 42,
  "genre": ["experimental", "flamenco", "reggaeton"]
}

// Film
{
  "imdb_id": "tt1234567",
  "runtime_minutes": 120,
  "director": "...",
  "language": "Spanish"
}

// Essay
{
  "publication": "The New Yorker",
  "word_count": 5000,
  "url": "https://..."
}
```

### 2. Concepts

Themes, movements, theories, and techniques that connect artifacts.

**Types:**
- `theme` - Recurring ideas (e.g., "alienation", "identity", "colonialism")
- `movement` - Cultural/artistic movements (e.g., "surrealism", "punk", "Afrofuturism")
- `theory` - Academic or philosophical frameworks (e.g., "Carrier Bag Theory of Fiction")
- `technique` - Artistic methods (e.g., "montage", "sampling", "unreliable narrator")
- `style` - Aesthetic approaches (e.g., "minimalism", "baroque")
- `genre` - Classification categories (e.g., "science fiction", "essay film")
- `other` - Other conceptual connections

**Classification:**
- `is_user_created: false` - Universal concepts (e.g., "postmodernism")
- `is_user_created: true` - Personal concepts (e.g., "works that make me feel hopeful")

### 3. Connections

Relationships between artifacts explaining how they relate.

**Relationship Types:**

#### Influence & Lineage
- `influenced_by` - A directly influenced B (e.g., Rosalía influenced by flamenco tradition)
- `responds_to` - A is in dialogue with B (e.g., essay responding to another essay)
- `builds_on` - A extends ideas from B

#### Direct References
- `references` - A explicitly mentions B (e.g., album samples a song, essay cites a book)
- `adapts` - A is an adaptation of B (e.g., film based on novel)
- `samples` - A uses material from B (music sampling)
- `quotes` - A quotes text/dialogue from B

#### Thematic Connections
- `explores_similar_themes` - Share common themes or ideas
- `contrasts_with` - Explores opposing perspectives on same topic
- `complements` - Work together to provide fuller understanding

#### Structural/Formal
- `uses_similar_technique` - Share artistic methods
- `similar_style` - Share aesthetic approaches
- `same_genre` - Belong to same category

#### Personal Connections
- `reminds_me_of` - Personal associative connection
- `pairs_well_with` - User finds them complementary
- `discovered_through` - One led to discovering the other

**Connection Source:**
- `user_discovered` - User manually identified this connection
- `ai_suggested` - Bobbin suggested based on conversation/analysis
- `factual_reference` - Objectively verifiable (e.g., explicit citation, sample credit)

**User Acceptance:**
- `null` - Pending review (AI suggested, user hasn't responded)
- `true` - User accepted the connection
- `false` - User rejected the connection

### 4. Conversations

Chat sessions where discoveries happen.

**Structure:**
```json
{
  "id": "uuid",
  "title": "Exploring Rosalía's MOTOMAMI",
  "summary": "Discussed Rosalía's album, discovered connection to Carrier Bag Theory...",
  "messages": [
    {
      "id": "msg_1",
      "sender": "user",
      "content": "I love the new Rosalía album...",
      "timestamp": "2024-01-15T10:30:00Z",
      "media": null
    },
    {
      "id": "msg_2",
      "sender": "bobbin",
      "content": "MOTOMAMI is fascinating! Did you know...",
      "timestamp": "2024-01-15T10:30:15Z",
      "media": null
    }
  ],
  "mentioned_artifact_ids": ["uuid1", "uuid2"],
  "discovered_connection_ids": ["uuid3"],
  "key_concepts": ["experimental music", "cultural identity", "genre-blending"]
}
```

## Connection Discovery Flow

### 1. User Chats with Bobbin

```
User: "I just finished reading The Dispossessed by Ursula K. Le Guin"
Bobbin: "That's a powerful exploration of anarchist utopia! What resonated with you?"
User: "The way it challenges capitalist structures felt similar to what Rosalía does with music industry conventions"
```

### 2. Entity Extraction

During or after conversation, system extracts:
- **Artifacts mentioned**: "The Dispossessed" (book), "MOTOMAMI" (album - from context)
- **Concepts identified**: "anarchism", "challenging conventions", "industry critique"
- **Potential connections**: Le Guin's book ↔ Rosalía's album (thematic)

### 3. Connection Suggestion

Bobbin suggests:
```json
{
  "source": "The Dispossessed",
  "target": "MOTOMAMI",
  "relationship_type": "explores_similar_themes",
  "description": "Both challenge established power structures in their respective domains",
  "connection_source": "user_discovered",
  "user_insight": "The way it challenges capitalist structures felt similar..."
}
```

User can:
- **Accept**: Connection added to graph
- **Reject**: Connection discarded
- **Refine**: Edit the description or relationship type

### 4. Enrichment & Exploration

When user saves an artifact, Bobbin can:
- **Enrich metadata**: Fetch additional info (publication year, creator bio, etc.)
- **Suggest related concepts**: "The Dispossessed also explores: 'dual narrative structure', 'thought experiments'"
- **Discover factual connections**: "Did you know Le Guin also wrote the essay 'The Carrier Bag Theory of Fiction'?"

## Example Knowledge Graph

```
[Album] MOTOMAMI by Rosalía (2022)
  |
  ├─ [references] → [Essay] "Carrier Bag Theory of Fiction" by Ursula K. Le Guin
  |                    |
  |                    └─ [written_by] → [Author] Ursula K. Le Guin
  |                                         |
  |                                         └─ [also_wrote] → [Book] The Dispossessed
  |
  ├─ [explores_similar_themes] → [Book] The Dispossessed
  |                                 └─ [Concepts] anarchism, challenging conventions
  |
  └─ [uses_technique] → [Concept] "genre-blending"
                          └─ [also_seen_in] → [Film] Everything Everywhere All at Once
```

## Data Flow Examples

### Scenario 1: User Discovers Connection While Chatting

1. User mentions both artifacts in conversation
2. System extracts entities and adds them as `artifacts` (if not existing)
3. User explicitly states connection
4. System creates `connection` with `connection_source: 'user_discovered'`
5. System links concepts to both artifacts via `artifact_concepts`

### Scenario 2: Bobbin Suggests Connection

1. User discusses new artifact
2. Bobbin analyzes against existing knowledge graph
3. Bobbin suggests connection: "This reminds me of [other artifact] in your collection"
4. System creates `connection` with `user_accepted: null`, `connection_source: 'ai_suggested'`
5. User accepts → `user_accepted: true`
6. User rejects → `user_accepted: false` (hidden from graph view)

### Scenario 3: Factual Reference Discovery

1. User shares link to album
2. System fetches metadata (via API or user input)
3. User mentions: "She references that essay in the album notes"
4. Bobbin verifies and creates connection with `connection_source: 'factual_reference'`
5. Connection displayed with high confidence

## UI Implications

### Feed View (v1)

Simple list/card view showing:
- Recently added artifacts
- Pending connection suggestions (AI-suggested, awaiting review)
- Recently explored connections

### Artifact Detail View

When user taps an artifact:
- Core metadata (title, creator, year, user notes)
- Connected artifacts (grouped by relationship type)
- Related concepts
- Conversations where it was discussed

### Connection Review

For AI-suggested connections:
- Show both artifacts
- Explain the connection
- Actions: Accept / Reject / Edit

### Graph View (Future v2+)

Visual network graph showing:
- Nodes: Artifacts (sized by number of connections)
- Edges: Connections (labeled with relationship type)
- Clusters: Groups of related artifacts
- Filter by: concept, time period, connection strength

## Query Patterns

### Find all artifacts connected to a concept
```sql
SELECT a.*
FROM artifacts a
JOIN artifact_concepts ac ON a.id = ac.artifact_id
JOIN concepts c ON ac.concept_id = c.id
WHERE c.name = 'anarchism'
  AND a.user_id = $1;
```

### Get connection graph for an artifact
```sql
SELECT
  a1.title as source_title,
  c.relationship_type,
  a2.title as target_title,
  c.description,
  c.connection_source
FROM connections c
JOIN artifacts a1 ON c.source_artifact_id = a1.id
JOIN artifacts a2 ON c.target_artifact_id = a2.id
WHERE (c.source_artifact_id = $1 OR c.target_artifact_id = $1)
  AND c.user_id = $2
  AND (c.user_accepted = true OR c.user_accepted IS NULL);
```

### Find pending connection suggestions
```sql
SELECT
  c.*,
  a1.title as source_title,
  a2.title as target_title
FROM connections c
JOIN artifacts a1 ON c.source_artifact_id = a1.id
JOIN artifacts a2 ON c.target_artifact_id = a2.id
WHERE c.user_id = $1
  AND c.connection_source = 'ai_suggested'
  AND c.user_accepted IS NULL
ORDER BY c.created_at DESC;
```

## Migration Strategy

### Phase 1: Schema Setup (Current)
- Run migration 003 to create all tables
- Migrate existing scraps to artifacts/conversations
- Set up RLS policies

### Phase 2: Code Integration
- Create TypeScript types
- Build entity extraction system
- Update chat API to save to conversations table
- Create artifact/connection CRUD operations

### Phase 3: Connection Discovery
- Implement AI suggestion system
- Build connection review UI
- Add concept tagging

### Phase 4: Enhanced Discovery
- Graph visualization
- Advanced search/filtering
- Connection strength learning
- Export/sharing features
