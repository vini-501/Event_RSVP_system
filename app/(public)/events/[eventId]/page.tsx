'use client'

import { useMemo, use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EventDetailsSection } from '@/components/events/event-details-section'
import { CountdownTimer } from '@/components/events/countdown-timer'
import { EventCard } from '@/components/events/event-card'
import { mockEvents } from '@/lib/mock-data'
import { ROUTES } from '@/lib/constants'

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = use(params)

  const event = useMemo(
    () => mockEvents.find((e) => e.id === eventId),
    [eventId]
  )

  if (!event) {
    notFound()
  }

  // Find related events (same category, excluding current event)
  const relatedEvents = useMemo(
    () =>
      mockEvents
        .filter(
          (e) =>
            e.category === event.category &&
            e.id !== event.id &&
            (e.status === 'published' || e.status === 'live')
        )
        .slice(0, 3),
    [event.category, event.id]
  )

  const isFull = event.currentAttendees >= event.capacity

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link href={ROUTES.EVENTS}>
        <Button variant="ghost" size="sm" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Event Image Placeholder */}
          <div className="mb-6 aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20" />

          {/* Event Details */}
          <EventDetailsSection event={event} />

          {/* Related Events */}
          {relatedEvents.length > 0 && (
            <div className="mt-12">
              <h3 className="mb-6 text-2xl font-bold text-foreground">
                Similar Events
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {relatedEvents.map((relatedEvent) => (
                  <EventCard
                    key={relatedEvent.id}
                    event={relatedEvent}
                    variant="compact"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Event Status */}
            <Card className="p-4">
              <div className="mb-3 flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="font-medium text-foreground">
                  {event.status === 'live' ? 'Event is Live' : 'Event Published'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Registration is open
              </p>
            </Card>

            {/* Countdown */}
            {event.startDate > new Date() && (
              <Card className="p-4">
                <p className="mb-3 text-sm font-medium text-foreground">
                  Event starts in
                </p>
                <CountdownTimer targetDate={event.startDate} />
              </Card>
            )}

            {/* Capacity Warning */}
            {isFull && (
              <Card className="border-yellow-200 bg-yellow-500/5 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">Event is Full</p>
                    <p className="text-sm text-yellow-800">
                      This event has reached its maximum capacity.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Info */}
            <Card className="p-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  CAPACITY
                </p>
                <p className="text-lg font-bold text-foreground">
                  {event.capacity} attendees
                </p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs font-medium text-muted-foreground">
                  CURRENTLY ATTENDING
                </p>
                <p className="text-lg font-bold text-foreground">
                  {event.currentAttendees} going
                </p>
              </div>
            </Card>

            {/* RSVP Button */}
            <Link href={ROUTES.EVENT_RSVP(event.id)} className="block">
              <Button
                size="lg"
                className="w-full"
                disabled={isFull}
              >
                {isFull ? 'Event is Full' : 'RSVP Now'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
