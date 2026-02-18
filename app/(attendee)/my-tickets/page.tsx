'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { QrCode, Calendar, MapPin, CheckCircle2, Clock, Download, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import { ROUTES } from '@/lib/constants'

export default function MyTicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user?.id) return

      try {
        const response = await fetch('/api/tickets', {
          headers: { Authorization: `Bearer ${user.id}` },
        })

        if (!response.ok) throw new Error('Failed to fetch tickets')

        const data = await response.json()
        setTickets(data.data?.tickets || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tickets')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTickets()
  }, [user?.id])

  const checkedInTickets = tickets.filter(t => t.checkInStatus === 'checked_in')
  const notCheckedInTickets = tickets.filter(t => t.checkInStatus === 'not_checked_in')

  const handleDownloadTicket = (ticketId: string) => {
    // In a real app, this would generate a PDF
    console.log('[v0] Downloading ticket:', ticketId)
  }

  const handleViewQRCode = (ticketId: string) => {
    // In a real app, open a modal or navigate to view QR code
    console.log('[v0] Viewing QR code for ticket:', ticketId)
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
          <TabsList>
            <TabsTrigger value="upcoming">Active ({notCheckedInTickets.length})</TabsTrigger>
            <TabsTrigger value="used">Used ({checkedInTickets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {notCheckedInTickets.length > 0 ? (
              notCheckedInTickets.map(ticket => (
                <TicketCard 
                  key={ticket.id} 
                  ticket={ticket}
                  onViewQR={() => handleViewQRCode(ticket.id)}
                  onDownload={() => handleDownloadTicket(ticket.id)}
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
                  onViewQR={() => handleViewQRCode(ticket.id)}
                  onDownload={() => handleDownloadTicket(ticket.id)}
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
    </div>
  )
}

function TicketCard({ 
  ticket, 
  isUsed = false, 
  onViewQR, 
  onDownload 
}: { 
  ticket: any
  isUsed?: boolean
  onViewQR: () => void
  onDownload: () => void
}) {
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
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Ticket ID: {ticket.id?.slice(0, 12)}...
            </div>
            {ticket.checkInTime && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                Checked in: {format(new Date(ticket.checkInTime), 'MMM d, yyyy h:mm a')}
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
              <Button size="sm" variant="outline" onClick={onDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </>
          )}
          <Button size="sm" variant="outline">
            Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
