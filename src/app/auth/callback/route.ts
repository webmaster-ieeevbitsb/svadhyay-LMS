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
      return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error.message)}`)
    }

    // After successful session exchange, verify registry and domain
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user?.email) {
      const email = user.email.toLowerCase()
      
      // 1. Registry Check (Primary Authority)
      const { data: participant } = await supabase
        .from('participants')
        .select('email')
        .eq('email', email)
        .single()

      if (!participant) {
        // 2. Fallback Domain Check for localized error messaging
        await supabase.auth.signOut()
        
        if (!email.endsWith('@vbithyd.ac.in')) {
          return NextResponse.redirect(`${origin}/?error=invalid_domain`)
        } else {
          return NextResponse.redirect(`${origin}/?error=unauthorized_institutional`)
        }
      }
    }

    // Success - direct server-side redirect to dashboard
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Fallback error
  return NextResponse.redirect(`${origin}/?error=auth-callback-failed`)
}
