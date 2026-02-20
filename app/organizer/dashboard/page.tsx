'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants'
import {
  Calendar,
  Plus,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Download,
  TicketCheck,
  Eye,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

type DashboardData = {
  stats: {
    totalEvents: number
    totalRsvps: number
    upcomingEvents: number
    totalAttendees: number
    goingCount: number
    growthPercent: number
    topMonth: string
    changes: {
      totalEvents: number
      totalRsvps: number
      upcomingEvents: number
      totalAttendees: number
    }
  }
  chartBars: number[]
  topEvents: Array<{
    id: string
    name: string
    city: string | null
    state: string | null
    capacity: number
    currentAttendees: number
    rsvpCount: number
  }>
  recentEvents: Array<{
    id: string
    name: string
    city: string | null
    state: string | null
    startDate: string
    status: string
    rsvpCount: number
  }>
}

export default function OrganizerDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/organizer/dashboard', { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to fetch organizer dashboard')
        const payload = await response.json()
        setData(payload?.data || null)
      } catch (error) {
        console.error('Failed to fetch organizer dashboard', error)
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchDashboard()
    const timer = setInterval(() => void fetchDashboard(), 30000)
    return () => clearInterval(timer)
  }, [])

  const stats = data?.stats
  const chartBars = data?.chartBars || []
  const topEvents = data?.topEvents || []
  const recentEvents = data?.recentEvents || []

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const statCards = useMemo(
    () => [
      {
        label: 'Total Events',
        value: stats?.totalEvents ?? 0,
        change: stats?.changes.totalEvents ?? 0,
        icon: Calendar,
      },
      {
        label: 'Total RSVPs',
        value: stats?.totalRsvps ?? 0,
        change: stats?.changes.totalRsvps ?? 0,
        icon: TicketCheck,
      },
      {
        label: 'Upcoming Events',
        value: stats?.upcomingEvents ?? 0,
        change: stats?.changes.upcomingEvents ?? 0,
        icon: Eye,
      },
      {
        label: 'Total Attendees',
        value: (stats?.totalAttendees ?? 0).toLocaleString(),
        change: stats?.changes.totalAttendees ?? 0,
        icon: Users,
      },
    ],
    [stats],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{dateStr}</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {user?.name || 'Organizer'}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 rounded-xl">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Link href="/organizer/create-event">
              <Button className="gap-2 rounded-xl shadow-md shadow-primary/25">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            const isPositive = stat.change >= 0
            return (
              <Card key={stat.label} className="relative overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold tracking-tight">{isLoading ? '...' : stat.value}</p>
                      <div className="flex items-center gap-1">
                        <span
                          className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                            isPositive ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {isPositive ? '+' : ''}
                          {stat.change}%
                        </span>
                        <span className="text-xs text-muted-foreground">vs last month</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-primary/10 p-2.5">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">RSVP Breakdown</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                See details
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-40 pt-4">
                {(chartBars.length > 0 ? chartBars : new Array(24).fill(0)).map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-primary/20 hover:bg-primary/40 transition-colors relative group"
                    style={{ height: `${height}%` }}
                  >
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-t-sm bg-primary/60"
                      style={{ height: `${Math.round(height * 0.6)}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border/60">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Total RSVP Summary
                  </p>
                  <div className="flex items-baseline gap-3 mt-1">
                    <p className="text-sm text-muted-foreground">Total RSVPs</p>
                    <p className="font-bold">{stats?.totalRsvps ?? 0}</p>
                  </div>
                  <div className="flex items-baseline gap-3 mt-0.5">
                    <p className="text-sm text-muted-foreground">Confirmed</p>
                    <p className="font-bold">{stats?.goingCount ?? 0}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary/40" />
                    Month-over-Month Change
                  </p>
                  <div className="flex items-baseline gap-3 mt-1">
                    <p className="text-sm text-muted-foreground">% Growth</p>
                    <p className={`font-bold ${(stats?.growthPercent || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {(stats?.growthPercent || 0) >= 0 ? '+' : ''}
                      {stats?.growthPercent ?? 0}%
                    </p>
                  </div>
                  <div className="flex items-baseline gap-3 mt-0.5">
                    <p className="text-sm text-muted-foreground">Top Month</p>
                    <p className="font-bold">{stats?.topMonth || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Event Summary</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                See details
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.totalEvents ?? 0}</p>
              <p className="text-sm text-muted-foreground mb-4">Total Events</p>

              <div className="space-y-3">
                {topEvents.map((event) => {
                  const fillPercent = event.capacity > 0 ? Math.round((event.currentAttendees / event.capacity) * 100) : 0
                  return (
                    <Link
                      key={event.id}
                      href={ROUTES.ORGANIZER_EVENT_ANALYTICS(event.id)}
                      className="block group"
                    >
                      <div className="rounded-xl border border-border/60 p-3 hover:shadow-sm transition-all">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-medium group-hover:text-primary transition-colors truncate mr-2">
                            {event.name}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {event.rsvpCount} RSVPs
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {event.city || 'Unknown'}{event.state ? `, ${event.state}` : ''}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">
                            {fillPercent}%
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
                {!isLoading && topEvents.length === 0 && (
                  <p className="text-sm text-muted-foreground">No events available yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Events</CardTitle>
            <Link href="/organizer/create-event">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                <Plus className="h-4 w-4" />
                Create event
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Event</th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Date</th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Location</th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">RSVPs</th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground pb-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.map((event) => (
                    <tr key={event.id} className="border-b border-border/40 last:border-0">
                      <td className="py-3 pr-4">
                        <p className="text-sm font-medium">{event.name}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-sm text-muted-foreground">{event.city || 'Unknown'}{event.state ? `, ${event.state}` : ''}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-sm font-medium">{event.rsvpCount}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            event.status === 'published'
                              ? 'bg-primary/10 text-primary'
                              : event.status === 'live'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : event.status === 'draft'
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-red-500/10 text-red-600'
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link href={ROUTES.ORGANIZER_EVENT_ANALYTICS(event.id)}>
                          <Button variant="ghost" size="sm" className="text-xs rounded-lg">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && recentEvents.length === 0 && (
                    <tr>
                      <td className="py-4 text-sm text-muted-foreground" colSpan={6}>No events found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
