'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  ArrowLeft,
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  Users,
  RefreshCw,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'

interface CheckInStats {
  totalTickets: number
  checkedIn: number
  notCheckedIn: number
  checkInRate: string
}

interface TicketWithUser {
  id: string
  rsvp_id: string
  user_id: string
  event_id: string
  qr_code: string | null
  check_in_status: string
  check_in_time: string | null
  profiles?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
}

export default function CheckInPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = use(params)
  const { user } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [qrInput, setQrInput] = useState('')
  const [manualTicketId, setManualTicketId] = useState('')
  const [stats, setStats] = useState<CheckInStats | null>(null)
  const [tickets, setTickets] = useState<TicketWithUser[]>([])
  const [eventName, setEventName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchData = useCallback(async () => {
    if (!eventId) return

    try {
      // Fetch event details
      const eventRes = await fetch(`/api/events/${eventId}`)
      if (eventRes.ok) {
        const eventData = await eventRes.json()
        setEventName(eventData.data?.name || 'Event')
      }

      // Fetch tickets for this event
      const ticketRes = await fetch(`/api/tickets?eventId=${eventId}`)
      if (ticketRes.ok) {
        const ticketData = await ticketRes.json()
        const allTickets: TicketWithUser[] = ticketData.data?.tickets || []
        setTickets(allTickets)

        const checkedIn = allTickets.filter(
          (t) => t.check_in_status === 'checked_in'
        ).length
        setStats({
          totalTickets: allTickets.length,
          checkedIn,
          notCheckedIn: allTickets.length - checkedIn,
          checkInRate:
            allTickets.length > 0
              ? ((checkedIn / allTickets.length) * 100).toFixed(1)
              : '0',
        })
      }
    } catch (err) {
      console.error('Failed to fetch check-in data', err)
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  // Initial load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 15 seconds for real-time attendance
  useEffect(() => {
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleQRCodeScan = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!qrInput.trim()) {
      setError('Please enter or scan a QR code')
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/tickets/check-in-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: qrInput, eventId }),
      })

      const data = await response.json()

      if (!response.ok || !data.data?.success) {
        setError(data.data?.error || data.error?.message || 'Check-in failed')
        return
      }

      setSuccess(data.data?.message || 'Successfully checked in!')
      setQrInput('')

      // Refresh data for real-time update
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleManualCheckIn = async (ticketId: string) => {
    setError(null)
    setSuccess(null)
    setIsProcessing(true)

    try {
      const response = await fetch(`/api/tickets/${ticketId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkInTimestamp: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error?.message || 'Check-in failed')
        return
      }

      setSuccess('Attendee checked in successfully!')
      setManualTicketId('')

      // Refresh data for real-time update
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in')
    } finally {
      setIsProcessing(false)
    }
  }

  const checkedInTickets = tickets.filter(
    (t) => t.check_in_status === 'checked_in'
  )
  const pendingTickets = tickets.filter(
    (t) => t.check_in_status !== 'checked_in'
  )

  const filterTickets = (list: TicketWithUser[]) =>
    list.filter((t) => {
      if (!searchQuery) return true
      const name =
        `${t.profiles?.first_name || ''} ${t.profiles?.last_name || ''}`.toLowerCase()
      const email = (t.profiles?.email || '').toLowerCase()
      return (
        name.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase())
      )
    })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading check-in data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-2">
          <Link href={`/organizer/events`}>
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Check-In Management
              </h1>
              <p className="text-muted-foreground">{eventName}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="gap-2 rounded-xl"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Real-Time Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <p className="text-sm">Total Tickets</p>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {stats.totalTickets}
              </p>
            </Card>
            <Card className="p-4 bg-emerald-50/50 border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm">Checked In</p>
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                {stats.checkedIn}
              </p>
            </Card>
            <Card className="p-4 bg-amber-50/50 border-amber-200">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <Clock className="h-4 w-4" />
                <p className="text-sm">Remaining</p>
              </div>
              <p className="text-3xl font-bold text-amber-600">
                {stats.notCheckedIn}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <UserCheck className="h-4 w-4" />
                <p className="text-sm">Check-In Rate</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-primary">
                  {stats.checkInRate}%
                </p>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${stats.checkInRate}%` }}
                />
              </div>
            </Card>
          </div>
        )}

        {/* QR Scanner + Manual Check-in */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* QR Code Scanner */}
          <Card className="p-6 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  QR Code Scanner
                </h2>
                <p className="text-xs text-muted-foreground">
                  Scan or paste a ticket QR code
                </p>
              </div>
            </div>
            <form onSubmit={handleQRCodeScan} className="flex gap-2">
              <Input
                placeholder="Scan QR code here..."
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="flex-1 rounded-xl"
                autoFocus
                disabled={isProcessing}
              />
              <Button
                type="submit"
                className="gap-2 rounded-xl shadow-md shadow-primary/25"
                disabled={isProcessing}
              >
                <QrCode className="h-4 w-4" />
                {isProcessing ? 'Checking...' : 'Check In'}
              </Button>
            </form>
          </Card>

          {/* Manual Check-in by Ticket ID */}
          <Card className="p-6 border-muted">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-muted p-2.5">
                <UserCheck className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Manual Check-In
                </h2>
                <p className="text-xs text-muted-foreground">
                  Enter a ticket ID or check in from the list below
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ticket ID..."
                value={manualTicketId}
                onChange={(e) => setManualTicketId(e.target.value)}
                className="flex-1 rounded-xl"
                disabled={isProcessing}
              />
              <Button
                variant="outline"
                className="gap-2 rounded-xl"
                disabled={isProcessing || !manualTicketId.trim()}
                onClick={() => handleManualCheckIn(manualTicketId)}
              >
                <UserCheck className="h-4 w-4" />
                Check In
              </Button>
            </div>
          </Card>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-2">
            <span className="font-medium">✕</span> {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-200 p-4 text-sm text-emerald-600 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {success}
          </div>
        )}

        {/* Attendee Lists */}
        <Card className="overflow-hidden">
          <Tabs defaultValue="pending" className="w-full">
            <div className="border-b border-border/60 px-4 pt-2">
              <TabsList className="grid w-full max-w-sm grid-cols-2 bg-transparent">
                <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-xl">
                  <Clock className="h-4 w-4" />
                  Pending ({pendingTickets.length})
                </TabsTrigger>
                <TabsTrigger value="checked" className="gap-2 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600 rounded-xl">
                  <CheckCircle2 className="h-4 w-4" />
                  Checked In ({checkedInTickets.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border/40">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>

            <TabsContent value="pending" className="mt-0">
              {filterTickets(pendingTickets).length > 0 ? (
                <div className="divide-y divide-border/40">
                  {filterTickets(pendingTickets).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {(
                            ticket.profiles?.first_name?.[0] || '?'
                          ).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {ticket.profiles?.first_name}{' '}
                            {ticket.profiles?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ticket.profiles?.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="gap-2 rounded-xl shadow-md shadow-primary/25"
                        disabled={isProcessing}
                        onClick={() => handleManualCheckIn(ticket.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Check In
                      </Button>
                    </div>
                  ))}
                </div>
              ) : pendingTickets.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
                  <h3 className="mb-2 text-lg font-semibold">
                    All Checked In!
                  </h3>
                  <p className="text-muted-foreground">
                    Everyone has completed check-in
                  </p>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No attendees match your search
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="checked" className="mt-0">
              {filterTickets(checkedInTickets).length > 0 ? (
                <div className="divide-y divide-border/40">
                  {filterTickets(checkedInTickets).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between px-4 py-3 bg-emerald-50/30"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {ticket.profiles?.first_name}{' '}
                            {ticket.profiles?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ticket.profiles?.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {ticket.check_in_time && (
                          <p className="text-xs text-muted-foreground">
                            {format(
                              new Date(ticket.check_in_time),
                              'h:mm a'
                            )}
                          </p>
                        )}
                        <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                          Checked In
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : checkedInTickets.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No attendees checked in yet
                  </p>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No attendees match your search
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
