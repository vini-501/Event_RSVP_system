import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api/middleware/auth'
import { requireRole } from '@/lib/api/middleware/rbac'
import { successResponse, errorResponse } from '@/lib/api/utils/formatters'
import { handleApiError } from '@/lib/api/utils/errors'

function monthBoundaries(date = new Date()) {
  const currentMonthStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
  const nextMonthStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1))
  const previousMonthStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1))

  return {
    currentMonthStart: currentMonthStart.toISOString(),
    nextMonthStart: nextMonthStart.toISOString(),
    previousMonthStart: previousMonthStart.toISOString(),
  }
}

function computePercentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    requireRole(auth, 'admin')

    const supabase = await createAdminClient()
    const { currentMonthStart, nextMonthStart, previousMonthStart } = monthBoundaries()

    const [
      usersCountRes,
      eventsCountRes,
      activeRsvpsCountRes,
      usersCurrentMonthRes,
      usersPreviousMonthRes,
      eventsCurrentMonthRes,
      eventsPreviousMonthRes,
      rsvpsCurrentMonthRes,
      rsvpsPreviousMonthRes,
      roleCountsRes,
      eventsPriceRes,
      activeRsvpsRevenueRes,
      monthlyRsvpsRevenueRes,
      recentProfilesRes,
      recentEventsRes,
      recentRsvpsRes,
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase
        .from('rsvps')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'going')
        .eq('is_waitlisted', false),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', currentMonthStart)
        .lt('created_at', nextMonthStart),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', previousMonthStart)
        .lt('created_at', currentMonthStart),
      supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', currentMonthStart)
        .lt('created_at', nextMonthStart),
      supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', previousMonthStart)
        .lt('created_at', currentMonthStart),
      supabase
        .from('rsvps')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'going')
        .eq('is_waitlisted', false)
        .gte('created_at', currentMonthStart)
        .lt('created_at', nextMonthStart),
      supabase
        .from('rsvps')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'going')
        .eq('is_waitlisted', false)
        .gte('created_at', previousMonthStart)
        .lt('created_at', currentMonthStart),
      supabase.from('profiles').select('role'),
      supabase.from('events').select('id, price'),
      supabase
        .from('rsvps')
        .select('event_id, plus_one_count')
        .eq('status', 'going')
        .eq('is_waitlisted', false),
      supabase
        .from('rsvps')
        .select('event_id, plus_one_count, created_at')
        .eq('status', 'going')
        .eq('is_waitlisted', false)
        .gte('created_at', previousMonthStart)
        .lt('created_at', nextMonthStart),
      supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('events')
        .select('id, name, organizer_id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('rsvps')
        .select('id, user_id, event_id, status, is_waitlisted, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    const errors = [
      usersCountRes.error,
      eventsCountRes.error,
      activeRsvpsCountRes.error,
      usersCurrentMonthRes.error,
      usersPreviousMonthRes.error,
      eventsCurrentMonthRes.error,
      eventsPreviousMonthRes.error,
      rsvpsCurrentMonthRes.error,
      rsvpsPreviousMonthRes.error,
      roleCountsRes.error,
      eventsPriceRes.error,
      activeRsvpsRevenueRes.error,
      monthlyRsvpsRevenueRes.error,
      recentProfilesRes.error,
      recentEventsRes.error,
      recentRsvpsRes.error,
    ].filter(Boolean)

    if (errors.length > 0) {
      throw errors[0]
    }

    const totalUsers = usersCountRes.count || 0
    const totalEvents = eventsCountRes.count || 0
    const activeRsvps = activeRsvpsCountRes.count || 0

    const userChange = computePercentChange(usersCurrentMonthRes.count || 0, usersPreviousMonthRes.count || 0)
    const eventChange = computePercentChange(eventsCurrentMonthRes.count || 0, eventsPreviousMonthRes.count || 0)
    const activeRsvpChange = computePercentChange(rsvpsCurrentMonthRes.count || 0, rsvpsPreviousMonthRes.count || 0)

    const priceMap = new Map<string, number>()
    for (const event of eventsPriceRes.data || []) {
      priceMap.set(event.id, Number(event.price || 0))
    }

    const totalRevenue = (activeRsvpsRevenueRes.data || []).reduce((sum: number, row: any) => {
      const price = priceMap.get(row.event_id) || 0
      const seats = 1 + Number(row.plus_one_count || 0)
      return sum + price * seats
    }, 0)

    let currentRevenue = 0
    let previousRevenue = 0
    for (const row of monthlyRsvpsRevenueRes.data || []) {
      const price = priceMap.get(row.event_id) || 0
      const seats = 1 + Number(row.plus_one_count || 0)
      const revenue = price * seats
      if (row.created_at >= currentMonthStart) {
        currentRevenue += revenue
      } else {
        previousRevenue += revenue
      }
    }
    const revenueChange = computePercentChange(currentRevenue, previousRevenue)

    const roleCounts = { attendee: 0, organizer: 0, admin: 0 }
    for (const profile of roleCountsRes.data || []) {
      if (profile.role === 'admin') roleCounts.admin += 1
      else if (profile.role === 'organizer') roleCounts.organizer += 1
      else roleCounts.attendee += 1
    }

    const roleDistribution = [
      {
        role: 'Attendees',
        count: roleCounts.attendee,
        percent: totalUsers > 0 ? Math.round((roleCounts.attendee / totalUsers) * 100) : 0,
        color: 'bg-primary',
      },
      {
        role: 'Organizers',
        count: roleCounts.organizer,
        percent: totalUsers > 0 ? Math.round((roleCounts.organizer / totalUsers) * 100) : 0,
        color: 'bg-emerald-500',
      },
      {
        role: 'Admins',
        count: roleCounts.admin,
        percent: totalUsers > 0 ? Math.round((roleCounts.admin / totalUsers) * 100) : 0,
        color: 'bg-amber-500',
      },
    ]

    const recentProfiles = recentProfilesRes.data || []
    const recentEvents = recentEventsRes.data || []
    const recentRsvps = recentRsvpsRes.data || []

    const actorIds = Array.from(
      new Set([
        ...recentEvents.map((e: any) => e.organizer_id).filter(Boolean),
        ...recentRsvps.map((r: any) => r.user_id).filter(Boolean),
      ]),
    )

    const actorProfilesMap = new Map<string, { email: string; role: string }>()
    if (actorIds.length > 0) {
      const { data: actors, error: actorsError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .in('id', actorIds)
      if (actorsError) throw actorsError
      for (const actor of actors || []) {
        actorProfilesMap.set(actor.id, {
          email: actor.email || '',
          role: actor.role || 'attendee',
        })
      }
    }

    const recentActivity = [
      ...recentProfiles.map((profile: any) => ({
        action: 'New user registered',
        user: profile.email || 'Unknown user',
        role: profile.role || 'attendee',
        createdAt: profile.created_at,
      })),
      ...recentEvents.map((event: any) => ({
        action: event.status === 'published' ? 'Event published' : 'Event created',
        user: actorProfilesMap.get(event.organizer_id)?.email || 'Unknown organizer',
        role: actorProfilesMap.get(event.organizer_id)?.role || 'organizer',
        createdAt: event.created_at,
      })),
      ...recentRsvps.map((rsvp: any) => ({
        action: rsvp.is_waitlisted ? 'RSVP waitlisted' : 'RSVP submitted',
        user: actorProfilesMap.get(rsvp.user_id)?.email || 'Unknown attendee',
        role: actorProfilesMap.get(rsvp.user_id)?.role || 'attendee',
        createdAt: rsvp.created_at,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    return successResponse(
      {
        stats: {
          totalUsers,
          totalEvents,
          activeRsvps,
          revenue: totalRevenue,
          change: {
            totalUsers: userChange,
            totalEvents: eventChange,
            activeRsvps: activeRsvpChange,
            revenue: revenueChange,
          },
        },
        roleDistribution,
        recentActivity,
      },
      'Admin dashboard metrics retrieved successfully',
    )
  } catch (error) {
    const { status, body } = handleApiError(error)
    return errorResponse(
      body.error.code,
      body.error.message,
      status,
      body.error.details
    )
  }
}
