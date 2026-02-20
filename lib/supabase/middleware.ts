import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ATTENDEE_ROUTE_PREFIXES = [
  '/my-rsvps',
  '/my-tickets',
  '/notifications',
  '/profile',
]

function getRoleHome(role: string): string {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'organizer') return '/organizer/dashboard'
  return '/events'
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session — this keeps the user logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith('/admin')
  const isOrganizerRoute = pathname.startsWith('/organizer')
  const isAttendeeRoute = ATTENDEE_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  )
  const isProtectedRoute = isAdminRoute || isOrganizerRoute || isAttendeeRoute

  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isProtectedRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'attendee'
    const isAuthorized =
      (isAdminRoute && role === 'admin') ||
      (isOrganizerRoute && (role === 'organizer' || role === 'admin')) ||
      (isAttendeeRoute && role === 'attendee')

    if (!isAuthorized) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = getRoleHome(role)
      redirectUrl.search = ''
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}
