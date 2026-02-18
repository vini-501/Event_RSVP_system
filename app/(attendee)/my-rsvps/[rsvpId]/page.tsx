'use client'

import { useMemo, use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TicketQRCode } from '@/components/rsvp/ticket-qr-code'
import { mockRSVPs } from '@/lib/mock-data'
import { ROUTES } from '@/lib/constants'

export default function RSVPDetailPage({
  params,
}: {
  params: Promise<{ rsvpId: string }>
}) {
  const { rsvpId } = use(params)

  const rsvp = useMemo(
    () =>
      mockRSVPs.find((r) => r.id === rsvpId),
    [rsvpId]
  )

  if (!rsvp || !rsvp.event) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      {/* Back Button */}
      <Link href={ROUTES.MY_RSVPS}>
        <Button variant="ghost" size="sm" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to My RSVPs
        </Button>
      </Link>

      {/* Ticket */}
      <TicketQRCode rsvp={rsvp} event={rsvp.event} />
    </div>
  )
}
