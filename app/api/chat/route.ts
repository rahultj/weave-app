import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { saveChatHistory } from '@/lib/chat-history'
import { getEnv } from '@/lib/env'

const anthropic = new Anthropic({
  apiKey: getEnv().ANTHROPIC_API_KEY
})

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 10 // 10 requests per minute per user
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000 // Clean up every 5 minutes

// Rate limiting storage: Map<userId, { requests: timestamp[], lastCleanup: timestamp }>
interface RateLimitData {
  requests: number[]
  lastCleanup: number
}

const rateLimitStore = new Map<string, RateLimitData>()

// Cleanup old rate limit entries
function cleanupRateLimitStore() {
  const now = Date.now()
  const cutoffTime = now - RATE_LIMIT_WINDOW_MS
  
  for (const [userId, data] of rateLimitStore.entries()) {
    // Remove old requests
    data.requests = data.requests.filter(timestamp => timestamp > cutoffTime)
    
    // Remove users with no recent requests
    if (data.requests.length === 0) {
      rateLimitStore.delete(userId)
    } else {
      // Update last cleanup time
      data.lastCleanup = now
    }
  }
}

// Check if user is rate limited
function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const cutoffTime = now - RATE_LIMIT_WINDOW_MS
  
  // Get or create user data
  let userData = rateLimitStore.get(userId)
  if (!userData) {
    userData = { requests: [], lastCleanup: now }
    rateLimitStore.set(userId, userData)
  }
  
  // Clean up old requests for this user
  userData.requests = userData.requests.filter(timestamp => timestamp > cutoffTime)
  
  // Check if user has exceeded rate limit
  if (userData.requests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true
  }
  
  // Add current request
  userData.requests.push(now)
  
  // Periodic cleanup (every 5 minutes)
  if (now - userData.lastCleanup > CLEANUP_INTERVAL_MS) {
    cleanupRateLimitStore()
  }
  
  return false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, scrap, chatHistory } = body

    // Get the authenticated user
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      )
    }

    // Rate limiting check
    if (isRateLimited(user.id)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please wait a moment before sending another message.',
          success: false,
          rateLimitExceeded: true
        },
        { status: 429 }
      )
    }

    // Detect conversation mode
    const isPatternExploration = scrap.title === 'Pattern Exploration'
    const isDiscoveryMode = (scrap.id === 'general-chat' || scrap.title === 'General Conversation') && !isPatternExploration

    // Build conversation history for Claude
    const conversationHistory = chatHistory.map((msg: { sender: string; content: string }) => {
      return `${msg.sender === 'user' ? 'Human' : 'Assistant'}: ${msg.content}\n\n`
    }).join('')

    let prompt: string

    if (isPatternExploration) {
      // PATTERN EXPLORATION MODE: Help user dive deeper into a pattern they've discovered
      prompt = `You are Bobbin, a cultural companion helping a user explore a pattern they've discovered in their cultural taste.

The user has identified a pattern across multiple works in their collection and wants to understand it better.

YOUR MISSION:
1. VALIDATE the pattern - explain WHY these works connect (don't just congratulate them)
2. GO DEEPER - reveal the cultural/historical/thematic roots of this pattern
3. RECOMMEND 3-5 specific works they should explore next that fit this pattern
4. SPARK CURIOSITY - pose a thought-provoking question about what this pattern reveals about them

STRUCTURE YOUR RESPONSE LIKE THIS:

**Start with insight** (1 paragraph): Explain the deeper meaning of this pattern. What cultural movement, philosophy, or artistic tradition does it connect to? Why do these works resonate together?

**Recommendations** (3-5 works): Suggest specific books, albums, films, essays, or artworks that would extend this pattern. For each:
- Name the work and creator
- One sentence on WHY it fits this pattern
- Make recommendations diverse (different mediums if possible)

**Rabbit hole question** (1 sentence): End with a provocative question that invites them to go deeper. Something like "Have you noticed whether you're drawn more to works that [specific observation]?"

TONE:
- Be a knowledgeable guide, not a cheerleader
- Assume intellectual curiosity - don't dumb things down
- Be specific - name names, cite movements, reference ideas
- Create genuine "aha" moments

${conversationHistory ? `Previous conversation:\n${conversationHistory}` : ''}

H: ${message}

A:`
    } else if (isDiscoveryMode) {
      // DISCOVERY MODE: Help user discover and learn about cultural works
      prompt = `You are Bobbin, a friendly cultural AI companion and encyclopedia. You help users discover and understand cultural works like books, albums, films, essays, artworks, and podcasts.

Your role:
- Answer questions about cultural artifacts (artists, books, albums, films, essays, etc.)
- Provide helpful context and background information
- Suggest connections between different works when relevant
- Help users understand WHY they might be interested in something
- Be enthusiastic and curious about culture

When responding:
- Keep explanations concise and engaging (2-3 short paragraphs max)
- Use simple, accessible language
- Focus on what makes the work interesting or significant
- Mention key themes, style, or notable aspects
- If relevant, suggest 1-2 related works they might enjoy
- Be conversational and warm, like a knowledgeable friend

IMPORTANT - Handling works you don't know:
- Your knowledge has a cutoff date, so you may not know about very recent releases (2024 onwards)
- If someone mentions a work you're not familiar with, DON'T apologize repeatedly or ask for clarification
- Instead, say something like: "I haven't caught up with that one yet! But I'm curious - what drew you to it? What stood out to you?"
- Pivot to asking about THEIR experience: what themes resonated, what it reminded them of, how it made them feel
- You can still engage meaningfully by discussing the creator's previous work, the genre, or themes they mention
- This turns an unknown work into an opportunity for personal reflection
- If they share details, engage with those details enthusiastically

Example responses for unknown works:
- "That one's new to me! I'd love to hear what captivated you about it. What themes or moments stood out?"
- "I haven't encountered that yet, but [Creator]'s earlier work like [Known Work] was fascinating. How does this compare?"
- "Sounds intriguing! Tell me more - what made you want to explore it?"

${conversationHistory ? `Previous conversation:\n${conversationHistory}` : ''}

H: ${message}

A:`
    } else {
      // REFLECTION MODE: Deep dive into a specific saved artifact
      const buildArtifactContext = (scrap: {
        id: string
        title?: string | null
        observations?: string | null
        creator?: string | null
        medium?: string | null
        tags?: string[] | null
        type: string
        image_url?: string | null
        created_at?: string | null
      }) => {
        return `CULTURAL ARTIFACT:
- Title: ${scrap.title || 'Untitled'}
- Creator: ${scrap.creator || 'Unknown'}
- Medium: ${scrap.medium || 'Unspecified'}
${scrap.image_url ? '- Visual artifact included' : ''}

USER'S PERSONAL REFLECTIONS:
${scrap.observations || 'No personal observations provided'}

INSTRUCTIONS:
- Focus responses on the CULTURAL ARTIFACT information above
- The artifact (title, creator, medium) is the subject of discussion
- Only reference user reflections if directly relevant to their question
- Never attribute the user's thoughts to the original creator
- Provide insights about the cultural work itself`
      }

      const artifactContext = buildArtifactContext(scrap)

      prompt = `You are Bobbin, a friendly and helpful AI companion. You help users understand their saved cultural discoveries in a clear, simple way.

When responding:
- Keep explanations short and direct (1-2 short paragraphs max)
- Use simple, everyday language
- Focus on the most interesting or relevant point first
- If suggesting related content, limit to 1-2 specific recommendations
- Avoid abstract or overly academic language
- Reference specific details from the cultural artifact when relevant (title, creator, medium, etc.)

${artifactContext}

When they ask questions like "what is this about?", "tell me more about this", or "who created this?", focus on the cultural artifact information and provide insights about the work itself.

${conversationHistory ? `Previous conversation:\n${conversationHistory}` : ''}

H: ${message}

A:`
    }

    // Send the prompt to Claude
    // Pattern exploration gets the most tokens for rich recommendations
    // Discovery mode gets medium tokens for encyclopedic info
    // Reflection mode gets fewer tokens for focused responses
    const maxTokens = isPatternExploration ? 800 : isDiscoveryMode ? 500 : 300

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
    
    // Safely extract the AI text from the response
    let aiText = '';
    if (Array.isArray(response.content) && response.content.length > 0) {
      const firstBlock = response.content[0];
      if ('text' in firstBlock && typeof firstBlock.text === 'string') {
        aiText = firstBlock.text;
      } else {
        aiText = 'I apologize, but I encountered an error processing your request.';
      }
    } else {
      aiText = 'I apologize, but I encountered an error processing your request.';
    }

    // Save the updated chat history to the database
    // Skip saving for general conversations (non-UUID scrap IDs)
    const updatedMessages = [
      ...chatHistory,
      { id: Date.now().toString(), content: message, sender: 'user', timestamp: new Date() },
      { id: (Date.now() + 1).toString(), content: aiText, sender: 'ai', timestamp: new Date() }
    ]

    // Only save chat history if this is tied to a real scrap (valid UUID)
    if (scrap.id && scrap.id !== 'general-chat') {
      try {
        await saveChatHistory(scrap.id, user.id, updatedMessages)
      } catch (error) {
        console.error('Error saving chat history in API:', error)
        // Don't fail the request if saving history fails
      }
    }

    // Return the AI response
    return NextResponse.json({ 
      response: aiText,
      success: true 
    })

  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request', success: false },
      { status: 500 }
    )
  }
}