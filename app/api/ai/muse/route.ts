import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'

interface ChatMessage {
  text: string
  isUser: boolean
}

// Rate limiting store (in production, use Redis or database)
// const rateLimitStore = new Map<string, { count: number; lastReset: number }>()

// const REQUESTS_PER_HOUR = 20 // Increased for better UX
// const HOUR_IN_MS = 60 * 60 * 1000

/* function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const userLimit = rateLimitStore.get(userId) || { count: 0, lastReset: now }
  
  // Reset if an hour has passed
  if (now - userLimit.lastReset >= HOUR_IN_MS) {
    userLimit.count = 0
    userLimit.lastReset = now
  }
  
  if (userLimit.count >= REQUESTS_PER_HOUR) {
    return { allowed: false, remaining: 0 }
  }
  
  userLimit.count++
  rateLimitStore.set(userId, userLimit)
  
  return { allowed: true, remaining: REQUESTS_PER_HOUR - userLimit.count }
} */

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check rate limit
    /* const rateLimit = checkRateLimit(user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Hourly AI request limit reached (${REQUESTS_PER_HOUR} requests/hour)` }, 
        { status: 429 }
      )
    } */

    // Parse request body
    const { content, context, type = 'quick', conversationHistory = [] }: {
      content: string
      context?: string  
      type?: 'quick' | 'chat'
      conversationHistory?: ChatMessage[]
    } = await request.json()
    
    if (!content || content.length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Limit content length to prevent excessive usage
    const maxContentLength = type === 'chat' ? 1000 : 500
    const truncatedContent = content.length > maxContentLength 
      ? content.substring(0, maxContentLength) + '...'
      : content

    // Initialize Gemini 2.5 Flash (latest model)
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    // Use Gemini 2.5 Flash - the latest and best model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: type === 'chat' ? 300 : 150,
      },
    })

    let prompt = ''
    let result

    if (type === 'quick') {
      // Quick Muse - for word suggestions and quick help
      prompt = `You are Muse, a helpful writing assistant for journaling. The user needs a quick suggestion or help with a specific word/phrase.

${context ? `Context: ${context}` : ''}

User request: ${truncatedContent}

Provide a brief, helpful response (1-2 sentences max). Be concise and actionable.`

      result = await model.generateContent(prompt)
    } else if (type === 'chat') {
      // Full conversational AI with history
      const systemMessage = `You are Muse, a thoughtful and empathetic journaling companion. You help people reflect on their thoughts, feelings, and experiences through meaningful conversation.

${context ? `Here is the user's journal entry for today (treat this as private context, do not reveal verbatim unless asked):\n\n"""\n${context}\n"""\n` : ''}
Your role:
- Ask thoughtful questions that encourage deeper reflection
- Provide gentle insights and perspectives
- Help users explore their emotions and thoughts
- Suggest journaling prompts when appropriate
- Be warm, supportive, and non-judgmental
- Keep responses conversational and under 2-3 sentences unless the user asks for more detail

Remember: You're here to facilitate self-discovery and reflection, not to provide therapy or medical advice.`

      // Create chat session with history including system message
      const chatHistory = [
        {
          role: 'user' as const,
          parts: [{ text: systemMessage }]
        },
        {
          role: 'model' as const,
          parts: [{ text: 'I understand. I\'m here to be your thoughtful journaling companion, ready to listen and help you explore your thoughts and feelings through gentle conversation.' }]
        },
        ...conversationHistory.map((msg: ChatMessage) => ({
          role: msg.isUser ? 'user' as const : 'model' as const,
          parts: [{ text: msg.text }]
        }))
      ]

      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          temperature: 0.8,
          topP: 0.9,
          maxOutputTokens: 300,
        },
      })

      result = await chat.sendMessage(truncatedContent)
    } else {
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
    }

    const response = result.response.text()

    return NextResponse.json({
      response,
      requestsRemaining: 999, // No limit for now
      timestamp: new Date().toISOString(),
      type,
    })

  } catch (error) {
    console.error('Muse AI error:', error)
    
    // Handle specific Google AI errors
    if (error instanceof Error) {
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'AI service quota exceeded. Please try again later.' }, 
          { status: 429 }
        )
      }
      if (error.message.includes('safety')) {
        return NextResponse.json(
          { error: 'Content was blocked for safety reasons. Please rephrase your message.' }, 
          { status: 400 }
        )
      }
    }
    
    // Don't expose internal errors to client
    return NextResponse.json(
      { error: 'AI service temporarily unavailable' }, 
      { status: 500 }
    )
  }
} 