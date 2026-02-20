'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, MapPin, Tag, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { ROUTES } from '@/lib/constants'

type EventDetails = {
  id: string
  name: string
  description: string
  category: string
  location: string
  capacity: number
  start_date: string
  end_date: string
  price?: number
  status: string
}

type Rsvp = {
  id: string
  status: 'going' | 'maybe' | 'not_going'
  approval_status?: 'pending' | 'approved' | 'rejected'
}

export default function EventDetailsPage() {
  const params = useParams<{ eventId: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const eventId = params?.eventId

  const [event, setEvent] = useState<EventDetails | null>(null)
  const [rsvp, setRsvp] = useState<Rsvp | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingRsvp, setIsSavingRsvp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rsvpMessage, setRsvpMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) return

      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/events/${eventId}`, { cache: 'no-store' })
        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(data?.error?.message || 'Event not found')
        }

        setEvent(data.data || null)
      } catch (err: any) {
        setError(err?.message || 'Failed to load event')
      } finally {
        setIsLoading(false)
      }
    }

    loadEvent()
  }, [eventId])

  useEffect(() => {
    const loadMyRsvp = async () => {
      if (!eventId || !user?.id) {
        setRsvp(null)
        return
      }

      try {
        const response = await fetch(`/api/rsvps?eventId=${eventId}`, { cache: 'no-store' })
        if (!response.ok) return
        const data = await response.json().catch(() => ({}))
        const mine = data?.data?.rsvps?.[0]
        if (mine) {
          setRsvp({ id: mine.id, status: mine.status, approval_status: mine.approval_status })
        } else {
          setRsvp(null)
        }
      } catch {
        setRsvp(null)
      }
    }

    loadMyRsvp()
  }, [eventId, user?.id])

  const submitRsvp = async (status: 'going' | 'maybe' | 'not_going') => {
    if (!eventId) return
    if (!user?.id) {
      router.push(`/login?next=${encodeURIComponent(`/events/${eventId}`)}`)
      return
    }

    try {
      setIsSavingRsvp(true)
      setRsvpMessage(null)

      if (rsvp?.id) {
        const response = await fetch(`/api/rsvps/${rsvp.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data?.error?.message || 'Failed to update RSVP')
        const updated = data?.data
        setRsvp((prev) =>
          prev
            ? {
                ...prev,
                status: updated?.status || status,
                approval_status: updated?.approval_status || 'pending',
              }
            : prev
        )
        setRsvpMessage('Your RSVP was updated and is pending admin approval.')
        return
      }

      const response = await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, status, plusOneCount: 0 }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error?.message || 'Failed to submit RSVP')
      const created = data?.data?.rsvp
      setRsvp({ id: created.id, status: created.status, approval_status: created.approval_status || 'pending' })
      setRsvpMessage('Your RSVP was submitted and is pending admin approval.')
    } catch (err: any) {
      setRsvpMessage(err?.message || 'Failed to save RSVP')
    } finally {
      setIsSavingRsvp(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Loading event...</p>
      </div>
    )
  }

  if (!event || error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">{error || 'Event not found'}</p>
        <Link href={ROUTES.EVENTS}>
          <Button variant="outline" className="mt-4">Back to Events</Button>
        </Link>
      </div>
    )
  }

  const statusLabel =
    rsvp?.status === 'going'
      ? 'Going'
      : rsvp?.status === 'maybe'
        ? 'Maybe'
        : rsvp?.status === 'not_going'
          ? 'Not Going'
          : 'Not Responded'
  const approvalLabel =
    rsvp?.approval_status === 'approved'
      ? 'Approved'
      : rsvp?.approval_status === 'rejected'
        ? 'Rejected'
        : rsvp?.approval_status === 'pending'
          ? 'Pending Approval'
          : null

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={ROUTES.EVENTS}>
        <Button variant="ghost" size="sm" className="mb-6 gap-2 rounded-xl">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h1 className="text-3xl font-bold text-foreground">{event.name}</h1>
            <Badge>{event.category}</Badge>
          </div>
          <p className="text-muted-foreground">{event.description}</p>
        </div>

        <Card className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-primary mt-1" />
            <div>
              <p className="text-sm font-medium">Date & Time</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(event.start_date), 'MMM dd, yyyy h:mm a')} to{' '}
                {format(new Date(event.end_date), 'MMM dd, yyyy h:mm a')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-primary mt-1" />
            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-sm text-muted-foreground">{event.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="h-4 w-4 text-primary mt-1" />
            <div>
              <p className="text-sm font-medium">Capacity</p>
              <p className="text-sm text-muted-foreground">{event.capacity} attendees</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Tag className="h-4 w-4 text-primary mt-1" />
            <div>
              <p className="text-sm font-medium">Price</p>
              <p className="text-sm text-muted-foreground">
                {event.price && event.price > 0 ? `$${event.price}` : 'Free'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-medium mb-3">Your RSVP</p>
          <p className="text-sm text-muted-foreground mb-4">Current: {statusLabel}</p>
          {approvalLabel && (
            <p className="text-sm text-muted-foreground mb-4">Approval: {approvalLabel}</p>
          )}
          <div className="grid gap-2 sm:grid-cols-3">
            <Button
              variant={rsvp?.status === 'going' ? 'default' : 'outline'}
              disabled={isSavingRsvp}
              onClick={() => submitRsvp('going')}
            >
              Going
            </Button>
            <Button
              variant={rsvp?.status === 'maybe' ? 'default' : 'outline'}
              disabled={isSavingRsvp}
              onClick={() => submitRsvp('maybe')}
            >
              Maybe
            </Button>
            <Button
              variant={rsvp?.status === 'not_going' ? 'default' : 'outline'}
              disabled={isSavingRsvp}
              onClick={() => submitRsvp('not_going')}
            >
              Not Going
            </Button>
          </div>
          {rsvpMessage && <p className="text-sm text-muted-foreground mt-3">{rsvpMessage}</p>}
        </Card>
      </div>
    </div>
  )
}
