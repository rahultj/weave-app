import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createRouteClient } from '@/lib/supabase/route'
import type { Artifact } from '@/lib/types/knowledge-graph'

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

export interface DetectedPattern {
  id: string
  pattern: string
  description: string
  artifact_ids: string[]
  artifact_titles: string[]
  confidence: number
  pattern_type: 'thematic' | 'stylistic' | 'temporal' | 'creator' | 'medium' | 'personal'
  explored?: boolean
}

// Helper to create stable hash from pattern content
function createPatternHash(pattern: string, titles: string[]): string {
  const content = pattern.toLowerCase() + titles.sort().join(',').toLowerCase()
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `pattern-${Math.abs(hash).toString(36)}`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      )
    }

    // Check if force refresh is requested
    const body = await request.json().catch(() => ({}))
    const forceRefresh = body.forceRefresh === true

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
        cached: false,
        message: 'Need at least 3 artifacts to detect patterns'
      })
    }

    // Check cache validity
    const { data: cacheMeta } = await supabase
      .from('pattern_cache_meta')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const cacheIsValid = cacheMeta && 
      cacheMeta.artifact_count_at_compute === artifacts.length &&
      !forceRefresh

    // If cache is valid, return cached patterns
    if (cacheIsValid) {
      const { data: cachedPatterns } = await supabase
        .from('cached_patterns')
        .select('*')
        .eq('user_id', user.id)
        .order('confidence', { ascending: false })

      if (cachedPatterns && cachedPatterns.length > 0) {
        const patterns: DetectedPattern[] = cachedPatterns.map(p => ({
          id: p.id,
          pattern: p.pattern,
          description: p.description || p.pattern,
          artifact_ids: p.artifact_ids || [],
          artifact_titles: p.artifact_titles || [],
          confidence: parseFloat(p.confidence),
          pattern_type: p.pattern_type,
          explored: p.explored
        }))

        return NextResponse.json({
          success: true,
          patterns,
          cached: true,
          artifact_count: artifacts.length
        })
      }
    }

    // Cache miss or invalid - generate new patterns with Claude
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

    const anthropic = getAnthropicClient()
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
      const jsonMatch = aiText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedPatterns = JSON.parse(jsonMatch[0])
      }
    } catch (parseError) {
      console.error('Error parsing patterns JSON:', parseError)
      return NextResponse.json({
        success: true,
        patterns: [],
        cached: false,
        message: 'Could not parse pattern analysis'
      })
    }

    // Internal type for patterns with hash
    interface PatternWithHash extends DetectedPattern {
      pattern_hash: string
    }

    // Map artifact titles to IDs and create final pattern objects
    const patterns: PatternWithHash[] = parsedPatterns.patterns
      .filter((p: any) => p.confidence >= 0.6 && p.artifact_titles?.length >= 2)
      .map((p: any) => {
        const matchedArtifacts = artifacts.filter((a: Artifact) =>
          p.artifact_titles.some((title: string) =>
            a.title.toLowerCase().includes(title.toLowerCase()) ||
            title.toLowerCase().includes(a.title.toLowerCase())
          )
        )

        const artifactTitles = matchedArtifacts.map((a: Artifact) => a.title)
        const artifactIds = matchedArtifacts.map((a: Artifact) => a.id)
        const hash = createPatternHash(p.pattern, artifactTitles)

        return {
          id: hash,
          pattern: p.pattern,
          description: p.description || p.pattern,
          artifact_ids: artifactIds,
          artifact_titles: artifactTitles,
          confidence: p.confidence,
          pattern_type: p.pattern_type || 'thematic',
          pattern_hash: hash
        }
      })
      .filter((p: PatternWithHash) => p.artifact_ids.length >= 2)

    // Clear old cached patterns for this user
    await supabase
      .from('cached_patterns')
      .delete()
      .eq('user_id', user.id)

    // Insert new patterns into cache
    if (patterns.length > 0) {
      const patternsToInsert = patterns.map(p => ({
        user_id: user.id,
        pattern: p.pattern,
        description: p.description,
        artifact_ids: p.artifact_ids,
        artifact_titles: p.artifact_titles,
        confidence: p.confidence,
        pattern_type: p.pattern_type,
        pattern_hash: p.pattern_hash,
        explored: false
      }))

      await supabase
        .from('cached_patterns')
        .insert(patternsToInsert)
    }

    // Update cache metadata
    await supabase
      .from('pattern_cache_meta')
      .upsert({
        user_id: user.id,
        last_computed_at: new Date().toISOString(),
        artifact_count_at_compute: artifacts.length
      })

    // Fetch the inserted patterns to get their UUIDs
    const { data: insertedPatterns } = await supabase
      .from('cached_patterns')
      .select('*')
      .eq('user_id', user.id)
      .order('confidence', { ascending: false })

    const finalPatterns: DetectedPattern[] = (insertedPatterns || []).map(p => ({
      id: p.id,
      pattern: p.pattern,
      description: p.description || p.pattern,
      artifact_ids: p.artifact_ids || [],
      artifact_titles: p.artifact_titles || [],
      confidence: parseFloat(p.confidence),
      pattern_type: p.pattern_type,
      explored: p.explored
    }))

    return NextResponse.json({
      success: true,
      patterns: finalPatterns,
      cached: false,
      artifact_count: artifacts.length
    })

  } catch (error) {
    console.error('Error detecting patterns:', error)
    
    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    if (errorMessage.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'AI service not configured. Please contact support.', success: false },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to detect patterns. Please try again.', success: false },
      { status: 500 }
    )
  }
}
