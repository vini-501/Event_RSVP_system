'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Calendar, MapPin, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants'

type RsvpDetails = {
  id: string
  status: 'going' | 'maybe' | 'not_going'
  approval_status?: 'pending' | 'approved' | 'rejected'
  plus_one_count?: number
  created_at: string
  events?: {
    id: string
    name: string
    location: string
    start_date: string
  }
}

export default function RSVPDetailPage() {
  const params = useParams<{ rsvpId: string }>()
  const rsvpId = params?.rsvpId

  const [rsvp, setRsvp] = useState<RsvpDetails | null>(null)
  const [ticketId, setTicketId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!rsvpId) return
      try {
        setIsLoading(true)
        const [rsvpRes, ticketRes] = await Promise.all([
          fetch(`/api/rsvps/${rsvpId}`, { cache: 'no-store' }),
          fetch('/api/tickets', { cache: 'no-store' }),
        ])

        if (!rsvpRes.ok) {
          const err = await rsvpRes.json().catch(() => ({}))
          throw new Error(err?.error?.message || 'RSVP not found')
        }

        const rsvpData = await rsvpRes.json()
        const row = rsvpData?.data || null

        const ticketData = ticketRes.ok ? await ticketRes.json().catch(() => ({})) : {}
        const tickets: any[] = ticketData?.data?.tickets || []
        const currentTicket = tickets.find((t) => t.rsvp_id === rsvpId)

        setRsvp(row)
        setTicketId(currentTicket?.id || null)
      } catch (err: any) {
        setError(err?.message || 'Failed to load RSVP')
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [rsvpId])

  if (isLoading) {
    return <div className="mx-auto max-w-3xl py-8 text-muted-foreground">Loading RSVP...</div>
  }

  if (error || !rsvp) {
    return (
      <div className="mx-auto max-w-3xl py-8">
        <Link href={ROUTES.MY_RSVPS}>
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to My RSVPs
          </Button>
        </Link>
        <Card className="p-6 text-sm text-muted-foreground">{error || 'RSVP not found'}</Card>
      </div>
    )
  }

  const approval = rsvp.approval_status || 'approved'
  const canViewTicket = approval === 'approved' && rsvp.status === 'going' && !!ticketId

  return (
    <div className="mx-auto max-w-3xl py-8 space-y-6">
      <Link href={ROUTES.MY_RSVPS}>
        <Button variant="ghost" size="sm" className="mb-2 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to My RSVPs
        </Button>
      </Link>

      <Card className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">{rsvp.events?.name || 'Event RSVP'}</h1>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Status: <span className="capitalize text-foreground">{rsvp.status.replace('_', ' ')}</span></p>
          <p>Approval: <span className="capitalize text-foreground">{approval}</span></p>
          {rsvp.events?.start_date && (
            <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />{new Date(rsvp.events.start_date).toLocaleString()}</p>
          )}
          {rsvp.events?.location && (
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{rsvp.events.location}</p>
          )}
        </div>
      </Card>

      {canViewTicket ? (
        <Card className="p-6 space-y-4 border-primary/40">
          <div className="flex items-center gap-2 text-primary">
            <Ticket className="h-5 w-5" />
            <p className="font-semibold">Ticket Approved</p>
          </div>
          <p className="text-sm text-muted-foreground">Your RSVP is approved. Ticket ID: <span className="font-mono text-foreground">{ticketId}</span></p>
          <Link href="/my-tickets">
            <Button className="gap-2">View My Ticket</Button>
          </Link>
        </Card>
      ) : (
        <Card className="p-6 text-sm text-muted-foreground">
          {approval === 'pending'
            ? 'This RSVP is pending admin approval. Your ticket will appear after approval.'
            : approval === 'rejected'
              ? 'This RSVP was rejected by admin. You can update your RSVP from the event page and resubmit.'
              : 'No ticket is available for this RSVP yet.'}
        </Card>
      )}
    </div>
  )
}
