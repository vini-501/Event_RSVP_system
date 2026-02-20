import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const authError = requestUrl.searchParams.get('error')
  const authErrorDescription = requestUrl.searchParams.get('error_description')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get user role after OAuth login and redirect accordingly
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const role = profile?.role || 'attendee'
        if (role === 'admin') return NextResponse.redirect(`${origin}/admin/dashboard`)
        if (role === 'organizer') return NextResponse.redirect(`${origin}/organizer/dashboard`)
      }
      return NextResponse.redirect(`${origin}/events`)
    }

    const message = encodeURIComponent(error.message)
    return NextResponse.redirect(`${origin}/login?error=oauth_exchange_failed&error_description=${message}`)
  }

  if (authError || authErrorDescription) {
    const message = encodeURIComponent(authErrorDescription || authError || 'OAuth sign-in failed')
    return NextResponse.redirect(`${origin}/login?error=oauth_provider_error&error_description=${message}`)
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
