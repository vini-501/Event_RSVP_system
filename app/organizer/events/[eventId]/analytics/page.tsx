'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Users, CheckCheck, Clock, AlertCircle } from 'lucide-react'

type AnalyticsData = {
  eventId: string
  eventName: string
  capacity: number
  totalRsvps: number
  confirmedRsvps: number
  waitlistedRsvps: number
  breakdown: { going: number; maybe: number; notGoing: number }
  totalAttendees: number
  availableSeats: number
  checkedIn: number
  checkInRate: string
}

export default function AnalyticsPage() {
  const params = useParams<{ eventId: string }>()
  const eventId = params?.eventId
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!eventId) {
        setError('Event not found')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/organizer/analytics/${eventId}`, {
          cache: 'no-store',
        })
        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(data?.error?.message || 'Failed to load analytics')
        }

        setAnalytics(data.data || null)
      } catch (err: any) {
        console.error('Failed to load analytics', err)
        setError(err?.message || 'Failed to load analytics')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [eventId])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">{error || 'Event not found'}</p>
      </div>
    )
  }

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
              <p className="text-muted-foreground">{analytics.eventName}</p>
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
                <p className="text-3xl font-bold">{analytics.breakdown.going}</p>
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
                <p className="text-3xl font-bold">{analytics.breakdown.maybe}</p>
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
                <p className="text-3xl font-bold">{analytics.checkedIn}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.checkInRate}%
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
                <p className="text-3xl font-bold">{analytics.waitlistedRsvps}</p>
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
                  <span className="text-sm font-bold">{analytics.totalAttendees} / {analytics.capacity}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width:
                        analytics.capacity > 0
                          ? `${(analytics.totalAttendees / analytics.capacity) * 100}%`
                          : '0%',
                    }}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {analytics.availableSeats} seats available
              </p>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
