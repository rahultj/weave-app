import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getEnv } from '@/lib/env'
import type { Artifact } from '@/lib/types/knowledge-graph'

const anthropic = new Anthropic({
  apiKey: getEnv().ANTHROPIC_API_KEY
})

export interface DetectedPattern {
  id: string
  pattern: string
  description: string
  artifact_ids: string[]
  artifact_titles: string[]
  confidence: number
  pattern_type: 'thematic' | 'stylistic' | 'temporal' | 'creator' | 'medium' | 'personal'
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      )
    }

    // Fetch user's artifacts
    const { data: artifacts, error: artifactsError } = await supabase
      .from('artifacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (artifactsError) {
      throw artifactsError
    }

    // Need at least 3 artifacts to detect meaningful patterns
    if (!artifacts || artifacts.length < 3) {
      return NextResponse.json({
        success: true,
        patterns: [],
        message: 'Need at least 3 artifacts to detect patterns'
      })
    }

    // Prepare artifact summaries for Claude
    const artifactSummaries = artifacts.map((a: Artifact) => ({
      id: a.id,
      title: a.title,
      creator: a.creator,
      type: a.type,
      year: a.year,
      medium: a.medium,
      user_notes: a.user_notes
    }))

    const prompt = `You are analyzing a user's cultural collection to detect meaningful patterns in their taste. 

Here are the artifacts in their collection:

${JSON.stringify(artifactSummaries, null, 2)}

Analyze these artifacts and identify 1-3 meaningful patterns that connect them. Focus on:
- Thematic connections (similar themes, ideas, or subjects)
- Stylistic similarities (artistic approach, tone, mood)
- Temporal patterns (era, movement, time period)
- Creator patterns (same creator, collaborative relationships)
- Personal patterns (based on the user's notes/reflections)

For each pattern you identify:
1. Write a compelling, concise statement about the pattern (like "You're drawn to works that challenge conventions while honoring tradition")
2. List which artifacts (by their exact titles) exemplify this pattern
3. Rate your confidence (0.0 to 1.0)
4. Classify the pattern type

Respond ONLY with valid JSON in this exact format:
{
  "patterns": [
    {
      "pattern": "Brief, insightful statement about the pattern",
      "description": "Slightly longer explanation of why these works connect",
      "artifact_titles": ["Title 1", "Title 2", "Title 3"],
      "confidence": 0.85,
      "pattern_type": "thematic"
    }
  ]
}

Important:
- Only include patterns with confidence >= 0.6
- Each pattern should connect at least 2 artifacts
- Make patterns feel insightful and personal, not generic
- Use the exact artifact titles from the input
- pattern_type must be one of: thematic, stylistic, temporal, creator, medium, personal`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    // Parse Claude's response
    let aiText = ''
    if (Array.isArray(response.content) && response.content.length > 0) {
      const firstBlock = response.content[0]
      if ('text' in firstBlock && typeof firstBlock.text === 'string') {
        aiText = firstBlock.text
      }
    }

    // Extract JSON from response
    let parsedPatterns: any = { patterns: [] }
    try {
      // Try to find JSON in the response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedPatterns = JSON.parse(jsonMatch[0])
      }
    } catch (parseError) {
      console.error('Error parsing patterns JSON:', parseError)
      return NextResponse.json({
        success: true,
        patterns: [],
        message: 'Could not parse pattern analysis'
      })
    }

    // Helper to create stable ID from pattern content
    const createStableId = (pattern: string, titles: string[]) => {
      // Create a simple hash from pattern text and artifact titles
      const content = pattern.toLowerCase() + titles.sort().join(',').toLowerCase()
      let hash = 0
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
      }
      return `pattern-${Math.abs(hash).toString(36)}`
    }

    // Map artifact titles to IDs and create final pattern objects
    const patterns: DetectedPattern[] = parsedPatterns.patterns
      .filter((p: any) => p.confidence >= 0.6 && p.artifact_titles?.length >= 2)
      .map((p: any) => {
        const matchedArtifacts = artifacts.filter((a: Artifact) =>
          p.artifact_titles.some((title: string) =>
            a.title.toLowerCase().includes(title.toLowerCase()) ||
            title.toLowerCase().includes(a.title.toLowerCase())
          )
        )

        const artifactTitles = matchedArtifacts.map((a: Artifact) => a.title)

        return {
          id: createStableId(p.pattern, artifactTitles),
          pattern: p.pattern,
          description: p.description || p.pattern,
          artifact_ids: matchedArtifacts.map((a: Artifact) => a.id),
          artifact_titles: artifactTitles,
          confidence: p.confidence,
          pattern_type: p.pattern_type || 'thematic'
        }
      })
      .filter((p: DetectedPattern) => p.artifact_ids.length >= 2) // Ensure we have matched artifacts

    return NextResponse.json({
      success: true,
      patterns,
      artifact_count: artifacts.length
    })

  } catch (error) {
    console.error('Error detecting patterns:', error)
    return NextResponse.json(
      { error: 'Failed to detect patterns', success: false },
      { status: 500 }
    )
  }
}

