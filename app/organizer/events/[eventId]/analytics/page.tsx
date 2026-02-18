'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { AnalyticsDashboard } from '@/components/organizer/analytics-dashboard'
import { mockEvents, mockRsvps, mockWaitlist } from '@/lib/mock-data'
import { ArrowLeft, Users, CheckCheck, Clock, AlertCircle } from 'lucide-react'

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const paramsData = Array.isArray(params) ? params[0] : params
  const event = mockEvents.find((e) => e.id === paramsData?.eventId)
  const eventRsvps = mockRsvps.filter((r) => r.eventId === paramsData?.eventId)
  const confirmedRsvps = eventRsvps.filter((r) => !r.isWaitlisted)
  const waitlistedRsvps = eventRsvps.filter((r) => r.isWaitlisted)

  if (!event) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    )
  }

  const goingCount = confirmedRsvps.filter((r) => r.status === 'going').length
  const maybeCount = confirmedRsvps.filter((r) => r.status === 'maybe').length
  const notGoingCount = confirmedRsvps.filter((r) => r.status === 'not_going').length
  const checkedInCount = confirmedRsvps.filter((r) => r.checkInStatus === 'checked_in').length
  const totalAttendees = confirmedRsvps
    .filter((r) => r.status === 'going')
    .reduce((sum, r) => sum + 1 + r.plusOneCount, 0)
  const availableSeats = Math.max(0, event.capacity - totalAttendees)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/organizer/events">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Event Analytics</h1>
              <p className="text-muted-foreground">{event.name}</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  Confirmed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{goingCount}</p>
                <p className="text-xs text-muted-foreground mt-1">attendees going</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Maybe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{maybeCount}</p>
                <p className="text-xs text-muted-foreground mt-1">undecided</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCheck className="h-4 w-4 text-amber-600" />
                  Checked In
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{checkedInCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {confirmedRsvps.length > 0
                    ? ((checkedInCount / confirmedRsvps.length) * 100).toFixed(0)
                    : '0'}
                  %
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Waitlist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{waitlistedRsvps.length}</p>
                <p className="text-xs text-muted-foreground mt-1">waiting for space</p>
              </CardContent>
            </Card>
          </div>

          {/* Capacity Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Capacity Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Capacity Used</span>
                  <span className="text-sm font-bold">{totalAttendees} / {event.capacity}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(totalAttendees / event.capacity) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {availableSeats} seats available
              </p>
            </CardContent>
          </Card>

          <AnalyticsDashboard rsvps={confirmedRsvps} />
      </div>
    </div>
  )
}
