import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client for auth callback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

// Use the Service Role key on the server for exchanging the PKCE auth code.
// Falls back to anon key for local dev where service key may be unavailable.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/today'

  if (code) {
    // Simply forward the user back to the app with the code so that
    // supabase-js (running in the browser) can finish exchanging it.

    const redirectUrl = `${origin}?code=${code}&next=${encodeURIComponent(next)}`
    return NextResponse.redirect(redirectUrl)
  }

  // No code parameter - invalid callback
  return NextResponse.redirect(`${origin}/?error=invalid_callback`)
} 