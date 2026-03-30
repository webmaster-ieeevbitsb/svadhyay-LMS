import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // If "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error.message)
      return NextResponse.redirect(`${origin}${next}/?error=${encodeURIComponent(error.message)}`)
    }

    // Success - direct server-side redirect to dashboard
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Fallback error
  return NextResponse.redirect(`${origin}/?error=auth-callback-failed`)
}
