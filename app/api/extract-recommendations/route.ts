import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getEnv } from '@/lib/env'

const anthropic = new Anthropic({
  apiKey: getEnv().ANTHROPIC_API_KEY
})

interface Message {
  role: string
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body

    // Get the authenticated user
    const supabase = createRouteHandlerClient({ cookies })
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

    // Build conversation transcript
    const transcript = messages.map((msg: Message) => {
      const speaker = msg.role === 'user' ? 'Human' : 'Bobbin'
      return `${speaker}: ${msg.content}`
    }).join('\n\n')

    const prompt = `Extract all cultural work recommendations from this conversation.

Look for:
- Books, albums, films, essays, artworks, podcasts mentioned as recommendations
- Works suggested for the user to explore
- Do NOT include works the user already knows or has in their collection

For each recommendation found, extract:
- title: The name of the work
- creator: Author, artist, director, etc.
- type: book, album, film, essay, artwork, podcast, article, other
- reason: Why it was recommended (1 sentence max)

Conversation:
${transcript}

Return ONLY valid JSON in this exact format:
{
  "recommendations": [
    {
      "title": "The Left Hand of Darkness",
      "creator": "Ursula K. Le Guin",
      "type": "book",
      "reason": "Explores themes of gender and society through sci-fi"
    }
  ]
}

If no recommendations are found, return: {"recommendations": []}`

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

    // Parse response
    let recommendations: any[] = []
    try {
      const firstBlock = response.content[0]
      if ('text' in firstBlock && typeof firstBlock.text === 'string') {
        let jsonText = firstBlock.text.trim()
        if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
        }
        const parsed = JSON.parse(jsonText)
        recommendations = parsed.recommendations || []
      }
    } catch (parseError) {
      console.error('Error parsing recommendations:', parseError)
    }

    return NextResponse.json({
      success: true,
      recommendations
    })

  } catch (error) {
    console.error('Error extracting recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to extract recommendations', success: false },
      { status: 500 }
    )
  }
}
