import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; lastReset: number }>()

const REQUESTS_PER_HOUR = 10
const HOUR_IN_MS = 60 * 60 * 1000

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
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
}

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
    const rateLimit = checkRateLimit(user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Hourly AI request limit reached (10 requests/hour)' }, 
        { status: 429 }
      )
    }

    // Parse request body
    const { content, context } = await request.json()
    
    if (!content || content.length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Limit content length to prevent excessive usage
    const maxContentLength = 2000
    const truncatedContent = content.length > maxContentLength 
      ? content.substring(0, maxContentLength) + '...'
      : content

    // Initialize Gemini 2.0 Flash
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const prompt = `You are Muse, a thoughtful journaling companion. Based on this journal entry, provide a brief, empathetic response that encourages reflection or offers gentle insight.

${context ? `Context: ${context}` : ''}

Entry: ${truncatedContent}

Response (keep under 100 words, be warm and encouraging):`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // Cache the response to prevent duplicate requests
    // TODO: Store in database once backend is ready

    return NextResponse.json({
      response,
      requestsRemaining: rateLimit.remaining,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Muse AI error:', error)
    
    // Don't expose internal errors to client
    return NextResponse.json(
      { error: 'AI service temporarily unavailable' }, 
      { status: 500 }
    )
  }
} 