'use client'

import { useMemo, use } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RSVPForm } from '@/components/rsvp/rsvp-form'
import { EventDetailsSection } from '@/components/events/event-details-section'
import { mockEvents } from '@/lib/mock-data'
import { ROUTES } from '@/lib/constants'

export default function RSVPPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = use(params)
  const router = useRouter()

  const event = useMemo(
    () => mockEvents.find((e) => e.id === eventId),
    [eventId]
  )

  if (!event) {
    notFound()
  }

  const isFull = event.currentAttendees >= event.capacity

  const handleRSVPSuccess = () => {
    // In a real app, this would be a successful submission
    // For now, redirect back to event details
    setTimeout(() => {
      router.push(ROUTES.EVENT_DETAILS(event.id))
    }, 2000)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link href={ROUTES.EVENT_DETAILS(event.id)}>
        <Button variant="ghost" size="sm" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Event
        </Button>
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left: Event Summary */}
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Event Summary
          </h1>
          <p className="mb-6 text-muted-foreground">
            Review event details before confirming your RSVP
          </p>

          {/* Event Image Placeholder */}
          <div className="mb-6 aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20" />

          {/* Event Details */}
          <EventDetailsSection event={event} />
        </div>

        {/* Right: RSVP Form */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          {isFull && (
            <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-500/5 p-4">
              <p className="text-sm font-medium text-yellow-900">
                This event is at full capacity. You can still express interest by
                selecting "Interested" in the form below.
              </p>
            </div>
          )}
          <RSVPForm event={event} onSuccess={handleRSVPSuccess} />
        </div>
      </div>
    </div>
  )
}
