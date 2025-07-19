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
    const supabase = createRouteHandlerClient({ cookies })
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

    // Build clear artifact-focused context
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

    // Build conversation history for Claude
    const conversationHistory = chatHistory.map((msg: { sender: string; content: string }) => {
      return `${msg.sender === 'user' ? 'Human' : 'Assistant'}: ${msg.content}\n\n`
    }).join('')

    const prompt = `You are Bobbin, a friendly and helpful AI companion. You help users understand their saved cultural discoveries in a clear, simple way.

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

    // Send the prompt to Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 300,
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
    const updatedMessages = [
      ...chatHistory,
      { id: Date.now().toString(), content: message, sender: 'user', timestamp: new Date() },
      { id: (Date.now() + 1).toString(), content: aiText, sender: 'ai', timestamp: new Date() }
    ]
    
    try {
      await saveChatHistory(scrap.id, user.id, updatedMessages)
    } catch (error) {
      console.error('Error saving chat history in API:', error)
      // Don't fail the request if saving history fails
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