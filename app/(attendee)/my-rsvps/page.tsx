'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Calendar, MapPin, ArrowRight, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CountdownTimer } from '@/components/events/countdown-timer'
import { ROUTES, RSVP_STATUSES, DATE_FORMAT } from '@/lib/constants'
import type { RSVPStatus } from '@/lib/types'

type UserRsvp = {
  id: string
  status: RSVPStatus
  approval_status?: 'pending' | 'approved' | 'rejected'
  event_id: string
  created_at: string
  events?: {
    id: string
    name: string
    location: string
    start_date: string
  }
}

export default function MyRSVPsPage() {
  const [filterStatus, setFilterStatus] = useState<RSVPStatus | 'all'>('all')
  const [rsvps, setRsvps] = useState<UserRsvp[]>([])
  const [ticketByRsvp, setTicketByRsvp] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const [rsvpRes, ticketRes] = await Promise.all([
          fetch('/api/rsvps', { cache: 'no-store' }),
          fetch('/api/tickets', { cache: 'no-store' }),
        ])

        const rsvpData = rsvpRes.ok ? await rsvpRes.json().catch(() => ({})) : {}
        const ticketData = ticketRes.ok ? await ticketRes.json().catch(() => ({})) : {}

        const rows: UserRsvp[] = rsvpData?.data?.rsvps || []
        const tickets: any[] = ticketData?.data?.tickets || []
        const ticketMap = tickets.reduce((acc: Record<string, string>, t: any) => {
          if (t.rsvp_id) acc[t.rsvp_id] = t.id
          return acc
        }, {})

        setRsvps(rows)
        setTicketByRsvp(ticketMap)
      } catch (error) {
        console.error('Failed to load my RSVPs', error)
        setRsvps([])
        setTicketByRsvp({})
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [])

  const filteredRSVPs = useMemo(() => {
    let filtered = [...rsvps]

    if (filterStatus !== 'all') {
      filtered = filtered.filter((rsvp) => rsvp.status === filterStatus)
    }

    filtered.sort(
      (a, b) =>
        new Date(a.events?.start_date || a.created_at).getTime() -
        new Date(b.events?.start_date || b.created_at).getTime()
    )

    return filtered
  }, [filterStatus, rsvps])

  const upcomingCount = filteredRSVPs.filter(
    (rsvp) => new Date(rsvp.events?.start_date || rsvp.created_at) > new Date()
  ).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">My RSVPs</h1>
        <p className="text-muted-foreground">
          Your RSVP requests and approval status
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total RSVPs</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {filteredRSVPs.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Upcoming Events</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {upcomingCount}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Going</p>
          <p className="mt-1 text-2xl font-bold text-primary">
            {filteredRSVPs.filter((r) => r.status === 'going').length}
          </p>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Select
          value={filterStatus}
          onValueChange={(value) => setFilterStatus(value as RSVPStatus | 'all')}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All RSVPs</SelectItem>
            {RSVP_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* RSVPs List */}
      {isLoading ? (
        <Card className="p-8 text-center text-muted-foreground">Loading RSVPs...</Card>
      ) : filteredRSVPs.length > 0 ? (
        <div className="space-y-4">
          {filteredRSVPs.map((rsvp) => {
            const event = rsvp.events
            if (!event) return null

            const isUpcoming = new Date(event.start_date) > new Date()
            const statusInfo = RSVP_STATUSES.find(
              (s) => s.value === rsvp.status
            )
            const approval = rsvp.approval_status || 'approved'
            const canViewTicket =
              approval === 'approved' &&
              rsvp.status === 'going' &&
              !!ticketByRsvp[rsvp.id]

            return (
              <Card key={rsvp.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {event.name}
                      </h3>
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: `${statusInfo?.color}20`,
                          color: statusInfo?.color?.replace('bg-', ''),
                        }}
                      >
                        {statusInfo?.label}
                      </Badge>
                      <Badge
                        className={
                          approval === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : approval === 'rejected'
                              ? 'bg-red-500/10 text-red-600'
                              : 'bg-amber-500/10 text-amber-700'
                        }
                      >
                        {approval === 'pending' ? 'Pending Approval' : approval}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(event.start_date), DATE_FORMAT)} at{' '}
                        {format(new Date(event.start_date), 'h:mm a')}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    </div>

                    {isUpcoming && (
                      <div className="mt-3">
                        <CountdownTimer targetDate={new Date(event.start_date)} />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 sm:flex-col sm:items-end">
                    {canViewTicket ? (
                      <Link href={ROUTES.MY_RSVP_DETAIL(rsvp.id)}>
                        <Button size="sm" className="gap-2 w-full">
                          View Ticket
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button size="sm" className="w-full" variant="outline" disabled>
                        {approval === 'pending'
                          ? 'Pending Approval'
                          : approval === 'rejected'
                            ? 'Rejected'
                            : 'Ticket Not Available'}
                      </Button>
                    )}
                    <Link href={ROUTES.EVENT_DETAILS(event.id)} className="w-full">
                      <Button size="sm" variant="outline" className="w-full">
                        Manage RSVP
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No RSVPs yet
          </h3>
          <p className="mb-6 text-muted-foreground">
            Start discovering events and register for ones you're interested in!
          </p>
          <Link href={ROUTES.EVENTS}>
            <Button>Browse Events</Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
