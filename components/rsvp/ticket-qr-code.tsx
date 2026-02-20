'use client'

import { QrCode, Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Rsvp, Event } from '@/lib/types'
import { format } from 'date-fns'

interface TicketQRCodeProps {
  rsvp: Rsvp
  event: Event
}

export function TicketQRCode({ rsvp, event }: TicketQRCodeProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // In a real app, this would download the ticket as PDF
    console.log('Downloading ticket...')
  }

  return (
    <div className="space-y-6">
      {/* Ticket Card */}
      <Card className="overflow-hidden border-2 border-primary">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Event Ticket</h2>
            <Badge variant="outline">{rsvp.status}</Badge>
          </div>

          {/* Event Info */}
          <div className="mb-8 space-y-2">
            <p className="text-sm text-muted-foreground">Event</p>
            <p className="text-xl font-bold text-foreground">{event.name}</p>
          </div>

          {/* Attendee Info */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Attendee Name</p>
              <p className="font-semibold text-foreground">{rsvp.user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="break-all font-semibold text-foreground">{rsvp.user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Number of Guests</p>
              <p className="font-semibold text-foreground">{rsvp.plusOneCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-in Status</p>
              <Badge
                variant={
                  rsvp.checkInStatus === 'checked_in'
                    ? 'default'
                    : 'secondary'
                }
              >
                {rsvp.checkInStatus === 'checked_in'
                  ? `Checked in at ${
                      rsvp.checkInTime
                        ? format(rsvp.checkInTime, 'h:mm a')
                        : ''
                    }`
                  : 'Not checked in'}
              </Badge>
            </div>
          </div>

          {/* Dietary Preferences */}
          {rsvp.dietaryPreferences && (
            <div className="mb-8 rounded-lg bg-card p-3">
              <p className="text-sm text-muted-foreground">
                Dietary Preferences
              </p>
              <p className="font-semibold text-foreground">
                {rsvp.dietaryPreferences}
              </p>
            </div>
          )}

          {/* QR Code Placeholder */}
          <div className="mb-6 flex flex-col items-center justify-center rounded-lg bg-white p-6">
            <QrCode className="h-32 w-32 text-muted-foreground" />
            <p className="mt-2 text-xs text-muted-foreground">
              Scan at check-in
            </p>
          </div>

          {/* Ticket Number */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Ticket ID</p>
            <p className="font-mono font-semibold text-foreground">
              {rsvp.id}
            </p>
          </div>
        </div>
      </Card>

      {/* Event Details Summary */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Event Details
        </h3>
        <div className="space-y-3">
          <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">Date</span>
            <span className="font-medium text-foreground">
              {format(event.startDate, 'EEEE, MMMM d, yyyy')}
            </span>
          </div>
          <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">Time</span>
            <span className="font-medium text-foreground">
              {format(event.startDate, 'h:mm a')}
            </span>
          </div>
          <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">Location</span>
            <span className="font-medium text-foreground sm:text-right">
              {event.location}
            </span>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 print:hidden">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 flex-1"
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4" />
          Print Ticket
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 flex-1"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </div>
  )
}
