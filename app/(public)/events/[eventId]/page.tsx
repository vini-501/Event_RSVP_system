'use client'

import { useMemo, use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, Calendar, MapPin, Tag, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EventDetailsSection } from '@/components/events/event-details-section'
import { CountdownTimer } from '@/components/events/countdown-timer'
import { SeatAvailability } from '@/components/events/seat-availability'
import { EventCard } from '@/components/events/event-card'
import { mockEvents } from '@/lib/mock-data'
import { ROUTES, DATE_FORMAT } from '@/lib/constants'

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
  const isUpcoming = event.startDate > new Date()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link href={ROUTES.EVENTS}>
        <Button variant="ghost" size="sm" className="mb-6 gap-2 rounded-xl">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Event Image / Hero */}
          <div className="mb-6 aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Calendar className="h-16 w-16 text-primary/15" />
            </div>
            <div className="absolute bottom-4 left-4 flex gap-2">
              <Badge className="rounded-full bg-primary/90 text-primary-foreground">
                {event.category}
              </Badge>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                event.status === 'live'
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-card/90 text-foreground backdrop-blur-sm'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  event.status === 'live' ? 'bg-white animate-pulse' : 'bg-emerald-500'
                }`} />
                {event.status === 'live' ? 'Live Now' : 'Open'}
              </span>
            </div>
          </div>

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
            {/* Countdown Timer */}
            {isUpcoming && (
              <Card className="p-5 border-border/60">
                <CountdownTimer targetDate={event.startDate} label="Event starts in" />
              </Card>
            )}

            {/* Seat Availability */}
            <Card className="p-5 border-border/60">
              <SeatAvailability
                current={event.currentAttendees}
                total={event.capacity}
              />
            </Card>

            {/* Event Quick Info */}
            <Card className="p-5 space-y-4 border-border/60">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date & Time</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {format(event.startDate, DATE_FORMAT)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(event.startDate, 'h:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {event.location}
                  </p>
                </div>
              </div>
              {event.price && (
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Tag className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</p>
                    <p className="text-lg font-bold text-primary mt-0.5">
                      ${event.price}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Capacity Warning */}
            {isFull && (
              <Card className="border-amber-500/30 bg-amber-500/5 p-5">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Event is Full</p>
                    <p className="text-sm text-amber-800 mt-1">
                      This event has reached maximum capacity. You may still join the waitlist.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* RSVP Button */}
            <Link href={ROUTES.EVENT_RSVP(event.id)} className="block">
              <Button
                size="lg"
                className="w-full rounded-xl shadow-md shadow-primary/25"
                disabled={isFull}
              >
                {isFull ? 'Join Waitlist' : 'RSVP Now'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
