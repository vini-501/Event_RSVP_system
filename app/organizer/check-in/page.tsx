'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  QrCode,
  Users,
  CheckCircle2,
  Clock,
  RefreshCw,
  Calendar,
  ArrowRight,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'

type OrganizerEvent = {
  id: string
  name: string
  start_date?: string
  location?: string
  status?: string
}

type EventCheckInStats = {
  total: number
  checkedIn: number
  going: number
}

type EventRow = OrganizerEvent & EventCheckInStats

export default function OrganizerCheckInHubPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<EventRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    if (!user?.id) {
      setRows([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const eventsRes = await fetch('/api/organizer/events', { cache: 'no-store' })
      if (!eventsRes.ok) throw new Error('Failed to load organizer events')

      const eventsData = await eventsRes.json()
      const events: OrganizerEvent[] = eventsData?.data?.events || []

      const statsList = await Promise.all(
        events.map(async (event) => {
          try {
            const res = await fetch(`/api/organizer/events/${event.id}/rsvps`, { cache: 'no-store' })
            if (!res.ok) throw new Error('Failed to load event RSVP stats')
            const data = await res.json()
            const stats = data?.data
            return {
              ...event,
              total: Number(stats?.total || 0),
              checkedIn: Number(stats?.checkedIn || 0),
              going: Number(stats?.breakdown?.going || 0),
            } as EventRow
          } catch {
            return {
              ...event,
              total: 0,
              checkedIn: 0,
              going: 0,
            } as EventRow
          }
        }),
      )

      setRows(statsList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load check-in hub')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [user?.id])

  const summary = useMemo(() => {
    const events = rows.length
    const totalGoing = rows.reduce((sum, r) => sum + r.going, 0)
    const checkedIn = rows.reduce((sum, r) => sum + r.checkedIn, 0)
    const pending = Math.max(0, totalGoing - checkedIn)
    const rate = totalGoing > 0 ? ((checkedIn / totalGoing) * 100).toFixed(1) : '0.0'
    return { events, totalGoing, checkedIn, pending, rate }
  }, [rows])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Check-In Hub</h1>
            <p className="text-muted-foreground mt-1">
              Scan QR tickets and track attendance across all events you host.
            </p>
          </div>
          <Button variant="outline" onClick={() => void loadData()} className="gap-2 rounded-xl">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Hosted Events</p>
            <p className="mt-1 text-2xl font-bold">{summary.events}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Confirmed Attendees</p>
            <p className="mt-1 text-2xl font-bold">{summary.totalGoing}</p>
          </Card>
          <Card className="p-4 border-emerald-200 bg-emerald-50/40">
            <p className="text-sm text-emerald-700">Checked In</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{summary.checkedIn}</p>
          </Card>
          <Card className="p-4 border-amber-200 bg-amber-50/40">
            <p className="text-sm text-amber-700">Pending Check-In</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{summary.pending}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Overall Rate</p>
            <p className="mt-1 text-2xl font-bold">{summary.rate}%</p>
          </Card>
        </div>

        {isLoading ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">Loading check-in hub...</Card>
        ) : error ? (
          <Card className="p-6 text-center text-sm text-destructive border-destructive/20 bg-destructive/10">
            {error}
          </Card>
        ) : rows.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No hosted events yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create an event to start scanning tickets and tracking attendees.
            </p>
            <Link href="/organizer/create-event" className="mt-4 inline-block">
              <Button>Create Event</Button>
            </Link>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Event</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Confirmed</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Checked In</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pending</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rate</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row) => {
                    const pending = Math.max(0, row.going - row.checkedIn)
                    const rate = row.going > 0 ? ((row.checkedIn / row.going) * 100).toFixed(1) : '0.0'
                    return (
                      <tr key={row.id} className="hover:bg-muted/20">
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{row.name}</p>
                            <p className="text-xs text-muted-foreground">{row.location || 'Location TBD'}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">
                          {row.start_date ? format(new Date(row.start_date), 'MMM d, yyyy h:mm a') : 'TBD'}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 text-sm font-medium">
                            <Users className="h-4 w-4 text-primary" />
                            {row.going}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" />
                            {row.checkedIn}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
                            <Clock className="h-4 w-4" />
                            {pending}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant="outline">{rate}%</Badge>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/organizer/events/${row.id}/check-in`}>
                              <Button size="sm" className="gap-2">
                                <QrCode className="h-4 w-4" />
                                Scanner
                              </Button>
                            </Link>
                            <Link href={`/organizer/events/${row.id}/attendees`}>
                              <Button size="sm" variant="outline" className="gap-2">
                                Attendees
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

