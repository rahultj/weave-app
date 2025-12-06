import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createRouteClient } from '@/lib/supabase/route'
import { saveChatHistory } from '@/lib/chat-history'
import { getUserArtifacts } from '@/lib/knowledge-graph'
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
    const { message, scrap, chatHistory, image } = body

    // Get the authenticated user
    const supabase = await createRouteClient()
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

    // Fetch user's collection for context (only in discovery mode)
    let userCollectionContext = ''
    if (isDiscoveryMode) {
      try {
        const artifacts = await getUserArtifacts(user.id, supabase)
        if (artifacts && artifacts.length > 0) {
          const collectionSummary = artifacts
            .slice(0, 20) // Limit to most recent 20 to avoid token limits
            .map(a => {
              const parts = [a.title]
              if (a.creator) parts.push(`by ${a.creator}`)
              if (a.year) parts.push(`(${a.year})`)
              parts.push(`[${a.type}]`)
              if (a.user_notes) parts.push(`- Note: "${a.user_notes}"`)
              return `- ${parts.join(' ')}`
            })
            .join('\n')
          
          userCollectionContext = `\n\nUSER'S CULTURAL COLLECTION:
The user has saved ${artifacts.length} cultural works in their collection. Here are their most recent entries:

${collectionSummary}

Use this context to:
- Understand their taste and preferences
- Make personalized recommendations based on what they've already explored
- Draw connections between works they're asking about and works in their collection
- Reference their previous interests when relevant
- If they ask "would I like X?", compare it to their collection and give an informed opinion

IMPORTANT: You have access to this information - use it! Don't say you don't have access to their preferences.`
        }
      } catch (error) {
        console.error('Error fetching user artifacts for context:', error)
        // Continue without context if fetch fails
      }
    }

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
- Use the user's collection context to give personalized recommendations

When responding:
- Keep explanations concise and engaging (2-3 short paragraphs max)
- Use simple, accessible language
- Focus on what makes the work interesting or significant
- Mention key themes, style, or notable aspects
- If relevant, suggest 1-2 related works they might enjoy based on their collection
- Reference works from their collection when making comparisons or recommendations
- Be conversational and warm, like a knowledgeable friend

${userCollectionContext}

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
    // Image analysis gets more tokens to describe visual content
    const maxTokens = image ? 800 : isPatternExploration ? 800 : isDiscoveryMode ? 500 : 300

    // Build message content - text only or with image
    let messageContent: Anthropic.MessageParam['content']
    
    if (image) {
      // Extract base64 data and media type from data URL
      const matches = image.match(/^data:(.+);base64,(.+)$/)
      if (!matches) {
        return NextResponse.json(
          { error: 'Invalid image format', success: false },
          { status: 400 }
        )
      }
      
      const mediaType = matches[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
      const base64Data = matches[2]
      
      // Image analysis prompt
      const imagePrompt = `You are Bobbin, a knowledgeable cultural companion. The user has shared an image with you.

ANALYZE THE IMAGE:
- If it's a book page or text: Identify the work if possible, discuss its themes, style, and significance
- If it's artwork: Describe the style, movement, possible artist, and cultural context
- If it's a film still: Identify the film if recognizable, discuss its visual style and significance
- If it's an album cover: Identify the album/artist, discuss the visual design and its relation to the music
- If it's something else cultural: Provide relevant cultural context and insights

YOUR RESPONSE SHOULD:
1. Identify what you're seeing (be specific about the work if you recognize it)
2. Provide interesting cultural context or background
3. Ask a thoughtful follow-up question to engage the user

${message !== 'What can you tell me about this image?' ? `The user also said: "${message}"` : ''}

Be conversational and insightful, like a knowledgeable friend at a museum or bookstore.`

      messageContent = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: base64Data
          }
        },
        {
          type: 'text',
          text: imagePrompt
        }
      ]
    } else {
      messageContent = prompt
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: messageContent
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