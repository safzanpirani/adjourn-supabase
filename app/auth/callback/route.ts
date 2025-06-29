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
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        flowType: 'pkce'
      }
    })

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/?error=auth_failed`)
      }

      // Set the session in cookies for the browser
      const response = NextResponse.redirect(`${origin}${next}`)
      
      // Set auth cookies
      if (data.session) {
        response.cookies.set('sb-access-token', data.session.access_token, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: data.session.expires_in
        })
        
        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
      }

      return response
    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(`${origin}/?error=auth_failed`)
    }
  }

  // No code parameter - invalid callback
  return NextResponse.redirect(`${origin}/?error=invalid_callback`)
} 