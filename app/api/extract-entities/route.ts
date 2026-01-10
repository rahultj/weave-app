import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createRouteClient } from '@/lib/supabase/route'
import type {
  ConversationMessage,
  ArtifactType,
  ConceptType,
  RelationshipType,
  ConversationAnalysis
} from '@/lib/types/knowledge-graph'

// Initialize Anthropic client lazily to provide better error messages
function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set')
  }
  if (!apiKey.startsWith('sk-ant-')) {
    throw new Error('ANTHROPIC_API_KEY does not appear to be a valid Anthropic API key')
  }
  return new Anthropic({ apiKey })
}

interface ExtractionRequest {
  messages: ConversationMessage[]
  conversationId?: string
  options?: {
    include_suggestions?: boolean
    min_confidence?: number
  }
}

interface ExtractedArtifact {
  title: string
  type: ArtifactType
  creator?: string
  year?: number
  medium?: string
  context: string
  confidence: number
}

interface ExtractedConcept {
  name: string
  type: ConceptType
  context: string
}

interface ExtractedConnection {
  source: string
  target: string
  relationship_type: RelationshipType
  description: string
  user_insight?: string
  confidence: number
  connection_source: 'user_discovered' | 'ai_suggested'
}

interface LLMExtractionResponse {
  artifacts: ExtractedArtifact[]
  concepts: ExtractedConcept[]
  user_stated_connections: ExtractedConnection[]
  suggested_connections: ExtractedConnection[]
}

export async function POST(request: NextRequest) {
  try {
    const body: ExtractionRequest = await request.json()
    const { messages, conversationId, options = {} } = body

    // Get the authenticated user
    const supabase = await createRouteClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      )
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided', success: false },
        { status: 400 }
      )
    }

    // Build conversation transcript for Claude
    const conversationTranscript = messages.map((msg) => {
      const speaker = msg.sender === 'user' ? 'Human' : 'Bobbin'
      return `${speaker}: ${msg.content}`
    }).join('\n\n')

    // Create extraction prompt
    const extractionPrompt = `Extract cultural artifacts from this conversation and write a KEY INSIGHT for each.

CRITICAL RULE FOR "context" FIELD:
The "context" field must contain the CORE IDEA or ESSENCE of what makes this work meaningful.
It must NEVER be a meta-description of the conversation.

FORBIDDEN PATTERNS (never write these):
- "Discussion about..." ❌
- "User asked about..." ❌
- "Conversation about..." ❌
- "Detailed discussion of..." ❌
- "Mentioned in conversation..." ❌
- Any sentence that describes THAT something was discussed

REQUIRED PATTERN:
Write what the work IS ABOUT or what makes it SIGNIFICANT.
Summarize the actual content/idea, not the fact that it was discussed.

EXAMPLES:

If conversation is about "The Carrier Bag Theory of Fiction":
❌ WRONG: "Discussion about The Carrier Bag Theory of Fiction by Ursula K. Le Guin"
✅ RIGHT: "Proposes stories as containers holding diverse experiences, rejecting the hero's weapon as narrative model"

If conversation is about "MOTOMAMI":
❌ WRONG: "User discussed this album"
✅ RIGHT: "Deconstructs flamenco and reggaeton traditions while exploring feminine identity and power"

If conversation is about "The Dispossessed":
❌ WRONG: "Detailed conversation about this novel"
✅ RIGHT: "Contrasts anarchist utopia with capitalist society, questioning whether true freedom requires sacrifice"

TASK:
1. Find cultural artifacts (books, albums, films, essays, artworks, podcasts)
2. For each, write a "context" that captures the SUBSTANCE - the core idea, theme, or significance
3. Keep context under 120 characters
4. artifact types: book, album, film, essay, artwork, podcast, article, other

Conversation:
${conversationTranscript}

Return ONLY valid JSON:
{
  "artifacts": [
    {
      "title": "Title Here",
      "type": "essay",
      "creator": "Creator Name",
      "year": 1986,
      "medium": "Essay",
      "context": "THE CORE IDEA - what this work argues, explores, or means (NOT 'discussion about X')",
      "confidence": 0.95
    }
  ],
  "concepts": [
    {
      "name": "concept name",
      "type": "theme",
      "context": "Brief explanation of the concept"
    }
  ],
  "user_stated_connections": [],
  "suggested_connections": []
}`

    // Call Claude API for entity extraction
    const anthropic = getAnthropicClient()
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: extractionPrompt
        }
      ]
    })

    // Extract JSON from response
    let extractedData: LLMExtractionResponse
    try {
      const firstBlock = response.content[0]
      if ('text' in firstBlock && typeof firstBlock.text === 'string') {
        // Remove markdown code blocks if present
        let jsonText = firstBlock.text.trim()
        if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
        }
        extractedData = JSON.parse(jsonText)
      } else {
        throw new Error('Invalid response format from Claude')
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError)
      console.error('Raw response:', response.content[0])
      return NextResponse.json(
        { error: 'Failed to parse extraction results', success: false },
        { status: 500 }
      )
    }

    // Apply confidence threshold if specified
    const minConfidence = options.min_confidence || 0.5
    const filteredArtifacts = extractedData.artifacts.filter(a => a.confidence >= minConfidence)
    const filteredUserConnections = extractedData.user_stated_connections.filter(c => c.confidence >= minConfidence)

    // Apply suggestions filter
    const filteredSuggestions = options.include_suggestions !== false
      ? extractedData.suggested_connections.filter(c => c.confidence >= minConfidence)
      : []

    // Return structured results
    return NextResponse.json({
      success: true,
      conversation_id: conversationId,
      extraction: {
        artifacts: filteredArtifacts,
        concepts: extractedData.concepts || [],
        user_stated_connections: filteredUserConnections,
        suggested_connections: filteredSuggestions
      },
      summary: {
        artifacts_found: filteredArtifacts.length,
        concepts_found: extractedData.concepts?.length || 0,
        user_connections: filteredUserConnections.length,
        suggested_connections: filteredSuggestions.length
      }
    })

  } catch (error) {
    console.error('Error in extract-entities API:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    if (errorMessage.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'AI service not configured. Please contact support.', success: false },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      {
        error: 'Failed to extract entities from conversation',
        success: false,
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
