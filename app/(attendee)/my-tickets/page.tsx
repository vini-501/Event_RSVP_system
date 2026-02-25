'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { QrCode, Calendar, CheckCircle2, Clock, Download, ArrowRight, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth-context'
import { ROUTES } from '@/lib/constants'
import { useToast } from '@/hooks/use-toast'

type TicketRecord = {
  id: string
  rsvp_id?: string
  qr_code?: string
  created_at?: string
  check_in_status?: string
  checkInStatus?: string
  check_in_time?: string | null
  checkInTime?: string | null
  events?: {
    name?: string
    start_date?: string
    location?: string
  }
}

export default function MyTicketsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tickets, setTickets] = useState<TicketRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isQrOpen, setIsQrOpen] = useState(false)
  const [isQrLoading, setIsQrLoading] = useState(false)
  const [downloadingTicketId, setDownloadingTicketId] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null)
  const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null)

  const fetchTickets = useCallback(async () => {
    if (!user?.id) {
      setTickets([])
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/tickets', { cache: 'no-store' })

      if (!response.ok) throw new Error('Failed to fetch tickets')

      const data = await response.json()
      setTickets(data.data?.tickets || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void fetchTickets()
  }, [fetchTickets])

  // Keep attendee ticket list in sync shortly after admin approval.
  useEffect(() => {
    if (!user?.id) return

    const interval = setInterval(() => {
      void fetchTickets()
    }, 10000)

    return () => clearInterval(interval)
  }, [fetchTickets, user?.id])

  const checkedInTickets = tickets.filter(
    (t) => (t.check_in_status ?? t.checkInStatus) === 'checked_in'
  )
  const notCheckedInTickets = tickets.filter(
    (t) => (t.check_in_status ?? t.checkInStatus) === 'not_checked_in'
  )

  const handleDownloadTicket = async (ticket: TicketRecord) => {
    const status = ticket.check_in_status ?? ticket.checkInStatus ?? 'not_checked_in'
    const checkInTime = ticket.check_in_time ?? ticket.checkInTime
    const eventName = ticket.events?.name || 'Event Ticket'
    const eventDate = ticket.events?.start_date
      ? format(new Date(ticket.events.start_date), 'MMM d, yyyy h:mm a')
      : 'Date not available'
    const eventLocation = ticket.events?.location || 'Location not available'

    try {
      setDownloadingTicketId(ticket.id)

      let qrPayload = ticket.qr_code || ''
      if (!qrPayload) {
        const qrResponse = await fetch(`/api/tickets/${ticket.id}/qr-code`, { cache: 'no-store' })
        const qrData = await qrResponse.json().catch(() => ({}))
        if (!qrResponse.ok) {
          throw new Error(qrData?.error?.message || 'Failed to load QR data')
        }
        qrPayload = qrData?.data?.qrCode || ''
      }

      if (!qrPayload) throw new Error('QR data unavailable for this ticket')

      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrPayload)}`
      const qrImageResponse = await fetch(qrImageUrl)
      if (!qrImageResponse.ok) throw new Error('Failed to generate QR image')

      const qrImageBlob = await qrImageResponse.blob()
      const qrBitmap = await createImageBitmap(qrImageBlob)

      const canvas = document.createElement('canvas')
      canvas.width = 1400
      canvas.height = 900
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas rendering not available')

      ctx.fillStyle = '#f4f7fb'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#0f172a'
      ctx.fillRect(60, 60, canvas.width - 120, canvas.height - 120)

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(80, 80, 820, 740)

      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(920, 80, 400, 740)

      ctx.fillStyle = '#111827'
      ctx.font = 'bold 56px sans-serif'
      ctx.fillText('EVENT TICKET', 130, 170)

      ctx.fillStyle = '#334155'
      ctx.font = '28px sans-serif'
      ctx.fillText(eventName, 130, 230)

      ctx.font = '22px sans-serif'
      ctx.fillStyle = '#475569'
      ctx.fillText(`Date: ${eventDate}`, 130, 290)
      ctx.fillText(`Location: ${eventLocation}`, 130, 330)

      ctx.fillStyle = '#111827'
      ctx.font = 'bold 24px sans-serif'
      ctx.fillText('Ticket Details', 130, 410)

      ctx.fillStyle = '#475569'
      ctx.font = '22px sans-serif'
      ctx.fillText(`Ticket ID: ${ticket.id}`, 130, 460)
      ctx.fillText(`RSVP ID: ${ticket.rsvp_id || 'N/A'}`, 130, 500)
      ctx.fillText(`Status: ${status.replace('_', ' ')}`, 130, 540)
      ctx.fillText(`Check-in: ${checkInTime ? format(new Date(checkInTime), 'MMM d, yyyy h:mm a') : 'Not checked in'}`, 130, 580)
      ctx.fillText(`Issued: ${ticket.created_at ? format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a') : format(new Date(), 'MMM d, yyyy h:mm a')}`, 130, 620)

      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 22px sans-serif'
      ctx.fillText('Scan At Entry', 1020, 140)

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(980, 170, 280, 280)
      ctx.drawImage(qrBitmap, 990, 180, 260, 260)

      ctx.fillStyle = '#334155'
      ctx.font = '20px sans-serif'
      ctx.fillText('Keep this ticket ready', 980, 500)
      ctx.fillText('for quick check-in.', 980, 530)

      const pngBlob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to export ticket image'))
        }, 'image/png')
      })

      const downloadUrl = URL.createObjectURL(pngBlob)
      const anchor = document.createElement('a')
      anchor.href = downloadUrl
      anchor.download = `ticket-${ticket.id.slice(0, 8)}.png`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      toast({
        title: 'Download failed',
        description: err instanceof Error ? err.message : 'Could not generate ticket image.',
        variant: 'destructive',
      })
    } finally {
      setDownloadingTicketId(null)
    }
  }

  const handleViewQRCode = async (ticket: TicketRecord) => {
    try {
      setIsQrLoading(true)
      setSelectedTicket(ticket)
      setSelectedQrCode(null)
      setIsQrOpen(true)

      const response = await fetch(`/api/tickets/${ticket.id}/qr-code`, { cache: 'no-store' })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Failed to load QR code')
      }

      setSelectedQrCode(data?.data?.qrCode || ticket.qr_code || null)
    } catch (err) {
      setSelectedQrCode(null)
      toast({
        title: 'Failed to load QR code',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsQrLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">My Tickets</h1>
          <p className="text-muted-foreground">Loading your tickets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">My Tickets</h1>
        </div>
        <Card className="p-6 text-center border-red-200 bg-red-50">
          <p className="text-red-600">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">My Tickets</h1>
        <p className="text-muted-foreground">
          View and manage your event tickets and QR codes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Tickets</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {tickets.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Checked In</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {checkedInTickets.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Not Used</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {notCheckedInTickets.length}
          </p>
        </Card>
      </div>

      {/* Tickets Tabs */}
      {tickets.length > 0 ? (
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:w-fit">
            <TabsTrigger value="upcoming">Active ({notCheckedInTickets.length})</TabsTrigger>
            <TabsTrigger value="used">Used ({checkedInTickets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {notCheckedInTickets.length > 0 ? (
              notCheckedInTickets.map(ticket => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onViewQR={() => void handleViewQRCode(ticket)}
                  onDownload={() => void handleDownloadTicket(ticket)}
                  isDownloading={downloadingTicketId === ticket.id}
                />
              ))
            ) : (
              <Card className="p-12 text-center">
                <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No active tickets</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="used" className="space-y-4">
            {checkedInTickets.length > 0 ? (
              checkedInTickets.map(ticket => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  isUsed
                  onViewQR={() => void handleViewQRCode(ticket)}
                  onDownload={() => void handleDownloadTicket(ticket)}
                  isDownloading={downloadingTicketId === ticket.id}
                />
              ))
            ) : (
              <Card className="p-12 text-center">
                <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No used tickets yet</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="p-12 text-center">
          <QrCode className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No Tickets Yet
          </h3>
          <p className="mb-6 text-muted-foreground">
            When you RSVP to events, your tickets will appear here
          </p>
          <Link href={ROUTES.EVENTS}>
            <Button>Browse Events</Button>
          </Link>
        </Card>
      )}

      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Ticket QR Code</DialogTitle>
            <DialogDescription>
              Use this code at check-in for ticket {selectedTicket?.id?.slice(0, 12)}...
            </DialogDescription>
          </DialogHeader>
          {isQrLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading QR code...</div>
          ) : selectedQrCode ? (
            <div className="space-y-4">
              <div className="flex justify-center rounded-md border bg-muted/20 p-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(selectedQrCode)}`}
                  alt="Ticket QR Code"
                  width={280}
                  height={280}
                  className="aspect-square h-auto w-full max-w-[280px] rounded-md bg-white p-2"
                />
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">QR code unavailable</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TicketCard({
  ticket,
  isUsed = false,
  onViewQR,
  onDownload,
  isDownloading = false,
}: {
  ticket: TicketRecord
  isUsed?: boolean
  onViewQR: () => void
  onDownload: () => void
  isDownloading?: boolean
}) {
  const checkInTime = ticket.check_in_time ?? ticket.checkInTime
  const detailsHref = ticket.rsvp_id ? ROUTES.MY_RSVP_DETAIL(ticket.rsvp_id) : null

  return (
    <Card className={`overflow-hidden transition-all ${isUsed ? 'opacity-75' : 'hover:shadow-lg'}`}>
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Ticket Info */}
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Event Ticket
            </h3>
            {isUsed && <Badge className="bg-green-100 text-green-800">Used</Badge>}
            {!isUsed && <Badge className="bg-blue-100 text-blue-800">Active</Badge>}
          </div>

          <div className="space-y-2 text-sm">
            {ticket.events?.name && (
              <div className="text-sm font-medium text-foreground">{ticket.events.name}</div>
            )}
            {ticket.events?.start_date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {format(new Date(ticket.events.start_date), 'MMM d, yyyy h:mm a')}
              </div>
            )}
            {ticket.events?.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {ticket.events.location}
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Ticket ID: {ticket.id?.slice(0, 12)}...
            </div>
            {checkInTime && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                Checked in: {format(new Date(checkInTime), 'MMM d, yyyy h:mm a')}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row">
          {!isUsed && (
            <>
              <Button size="sm" variant="outline" onClick={onViewQR} className="gap-2">
                <QrCode className="h-4 w-4" />
                QR Code
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onDownload}
                className="gap-2"
                loading={isDownloading}
                loadingText="Preparing..."
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </>
          )}
          {detailsHref ? (
            <Link href={detailsHref}>
              <Button size="sm" variant="outline">
                Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="outline" disabled>
              Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
