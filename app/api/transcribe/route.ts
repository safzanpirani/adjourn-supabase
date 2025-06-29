import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

// Initialize Groq client with timeout configuration
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 60000, // 60 second timeout
  maxRetries: 2, // Retry on transient failures
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Check file size (25MB limit for free tier)
    const maxSize = 25 * 1024 * 1024 // 25MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 25MB limit' },
        { status: 400 }
      )
    }

    // Check file type
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/mpga', 'audio/m4a', 'audio/ogg', 'audio/webm', 'audio/flac']
    
    // Extract base MIME type (remove codec specifications like ;codecs=opus)
    const baseMimeType = file.type.split(';')[0]
    
    console.log(`File type validation: "${file.type}" → "${baseMimeType}"`)
    
    if (!allowedTypes.includes(baseMimeType)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Supported: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm' },
        { status: 400 }
      )
    }

    // Convert File to buffer for Groq API
    const buffer = await file.arrayBuffer()
    const audioBuffer = Buffer.from(buffer)

    // Create transcription using Groq's Whisper
    const transcription = await groq.audio.transcriptions.create({
      file: new File([audioBuffer], file.name, { type: file.type }),
      model: 'whisper-large-v3', // Fast and cost-effective model
      language: 'en', // Specify English for better accuracy and latency
      temperature: 0.0, // Use default temperature for consistency
      response_format: 'json'
    })

    return NextResponse.json({
      text: transcription.text,
      success: true
    })

  } catch (error) {
    console.error('Groq transcription error:', error)
    
    if (error instanceof Error) {
      // Handle specific Groq API errors
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid API key configuration' },
          { status: 500 }
        )
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to transcribe audio. Please try again.' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
} 