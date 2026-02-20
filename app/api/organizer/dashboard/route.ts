import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/utils/formatters'
import { handleApiError } from '@/lib/api/utils/errors'
import { requireAuth } from '@/lib/api/middleware/auth'
import { requireRole } from '@/lib/api/middleware/rbac'

function monthRange(date = new Date()) {
  const current = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1))
  const prev = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1))
  return {
    currentMonthStart: current.toISOString(),
    nextMonthStart: next.toISOString(),
    prevMonthStart: prev.toISOString(),
  }
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    requireRole(auth, 'organizer')
    const supabase = await createClient()

    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, name, city, state, start_date, status, capacity, created_at')
      .eq('organizer_id', auth.userId)
      .order('created_at', { ascending: false })
    if (eventsError) throw eventsError

    const eventRows = events || []
    const eventIds = eventRows.map((e: any) => e.id)

    let rsvpRows: any[] = []
    if (eventIds.length > 0) {
      const { data, error } = await supabase
        .from('rsvps')
        .select('event_id, user_id, status, is_waitlisted, plus_one_count, created_at')
        .in('event_id', eventIds)
      if (error) throw error
      rsvpRows = data || []
    }

    const nowIso = new Date().toISOString()
    const { currentMonthStart, nextMonthStart, prevMonthStart } = monthRange()

    const totalEvents = eventRows.length
    const totalRsvps = rsvpRows.length
    const upcomingEvents = eventRows.filter(
      (e: any) => e.start_date >= nowIso && e.status !== 'cancelled',
    ).length
    const confirmed = rsvpRows.filter((r: any) => !r.is_waitlisted)
    const goingConfirmed = confirmed.filter((r: any) => r.status === 'going')
    const totalAttendees = goingConfirmed.reduce(
      (sum: number, r: any) => sum + 1 + Number(r.plus_one_count || 0),
      0,
    )
    const goingCount = goingConfirmed.length

    const eventsCurrent = eventRows.filter(
      (e: any) => e.created_at >= currentMonthStart && e.created_at < nextMonthStart,
    ).length
    const eventsPrev = eventRows.filter(
      (e: any) => e.created_at >= prevMonthStart && e.created_at < currentMonthStart,
    ).length

    const rsvpsCurrent = rsvpRows.filter(
      (r: any) => r.created_at >= currentMonthStart && r.created_at < nextMonthStart,
    ).length
    const rsvpsPrev = rsvpRows.filter(
      (r: any) => r.created_at >= prevMonthStart && r.created_at < currentMonthStart,
    ).length

    const attendeeCurrent = goingConfirmed
      .filter((r: any) => r.created_at >= currentMonthStart && r.created_at < nextMonthStart)
      .reduce((sum: number, r: any) => sum + 1 + Number(r.plus_one_count || 0), 0)
    const attendeePrev = goingConfirmed
      .filter((r: any) => r.created_at >= prevMonthStart && r.created_at < currentMonthStart)
      .reduce((sum: number, r: any) => sum + 1 + Number(r.plus_one_count || 0), 0)

    const upcomingCurrent = eventRows.filter(
      (e: any) =>
        e.start_date >= currentMonthStart &&
        e.start_date < nextMonthStart &&
        e.status !== 'cancelled',
    ).length
    const upcomingPrev = eventRows.filter(
      (e: any) =>
        e.start_date >= prevMonthStart &&
        e.start_date < currentMonthStart &&
        e.status !== 'cancelled',
    ).length

    const rsvpByEvent = new Map<string, number>()
    for (const r of rsvpRows) {
      rsvpByEvent.set(r.event_id, (rsvpByEvent.get(r.event_id) || 0) + 1)
    }

    const attendeeByEvent = new Map<string, number>()
    for (const r of goingConfirmed) {
      attendeeByEvent.set(
        r.event_id,
        (attendeeByEvent.get(r.event_id) || 0) + 1 + Number(r.plus_one_count || 0),
      )
    }

    const topEvents = [...eventRows]
      .sort((a: any, b: any) => (rsvpByEvent.get(b.id) || 0) - (rsvpByEvent.get(a.id) || 0))
      .slice(0, 3)
      .map((e: any) => ({
        id: e.id,
        name: e.name,
        city: e.city,
        state: e.state,
        capacity: e.capacity || 0,
        currentAttendees: attendeeByEvent.get(e.id) || 0,
        rsvpCount: rsvpByEvent.get(e.id) || 0,
      }))

    const recentEvents = eventRows.map((e: any) => ({
      id: e.id,
      name: e.name,
      city: e.city,
      state: e.state,
      startDate: e.start_date,
      status: e.status,
      rsvpCount: rsvpByEvent.get(e.id) || 0,
    }))

    const monthlyRaw = new Array<number>(24).fill(0)
    const monthNames = new Array<string>(24)
    const now = new Date()
    const monthStartMs: number[] = []
    for (let i = 0; i < 24; i += 1) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (23 - i), 1))
      monthStartMs.push(d.getTime())
      monthNames[i] = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' })
    }

    for (const r of rsvpRows) {
      const created = new Date(r.created_at).getTime()
      for (let i = 0; i < 24; i += 1) {
        const start = monthStartMs[i]
        const end = i < 23 ? monthStartMs[i + 1] : Number.MAX_SAFE_INTEGER
        if (created >= start && created < end) {
          monthlyRaw[i] += 1
          break
        }
      }
    }

    const maxMonth = Math.max(...monthlyRaw, 0)
    const chartBars = monthlyRaw.map((v) => (maxMonth > 0 ? Math.round((v / maxMonth) * 100) : 0))
    const topMonthIndex = monthlyRaw.findIndex((v) => v === maxMonth)
    const topMonth = topMonthIndex >= 0 ? monthNames[topMonthIndex] : 'N/A'
    const growthPercent = percentChange(monthlyRaw[23] || 0, monthlyRaw[22] || 0)

    return successResponse(
      {
        stats: {
          totalEvents,
          totalRsvps,
          upcomingEvents,
          totalAttendees,
          goingCount,
          growthPercent,
          topMonth,
          changes: {
            totalEvents: percentChange(eventsCurrent, eventsPrev),
            totalRsvps: percentChange(rsvpsCurrent, rsvpsPrev),
            upcomingEvents: percentChange(upcomingCurrent, upcomingPrev),
            totalAttendees: percentChange(attendeeCurrent, attendeePrev),
          },
        },
        chartBars,
        topEvents,
        recentEvents,
      },
      'Organizer dashboard metrics retrieved successfully',
    )
  } catch (error) {
    const { status, body } = handleApiError(error)
    return errorResponse(
      body.error.code,
      body.error.message,
      status,
      body.error.details,
    )
  }
}
