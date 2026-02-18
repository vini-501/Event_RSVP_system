'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, QrCode, Search, CheckCircle2, Clock, Users, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { mockEvents, mockTickets, mockRsvps, mockUsers } from '@/lib/mock-data'

interface CheckInStats {
  totalTickets: number
  checkedIn: number
  notCheckedIn: number
  checkInRate: string
}

export default function CheckInPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const paramsData = Array.isArray(params) ? params[0] : params
  const eventId = paramsData?.eventId
  
  const event = mockEvents.find(e => e.id === eventId)
  const [searchQuery, setSearchQuery] = useState('')
  const [qrInput, setQrInput] = useState('')
  const [stats, setStats] = useState<CheckInStats | null>(null)
  const [checkedInList, setCheckedInList] = useState<any[]>([])
  const [notCheckedInList, setNotCheckedInList] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) return

    // Calculate stats
    const eventTickets = mockTickets.filter(t => t.eventId === eventId)
    const checkedInTickets = eventTickets.filter(t => t.checkInStatus === 'checked_in')
    const notCheckedInTickets = eventTickets.filter(t => t.checkInStatus === 'not_checked_in')

    setStats({
      totalTickets: eventTickets.length,
      checkedIn: checkedInTickets.length,
      notCheckedIn: notCheckedInTickets.length,
      checkInRate: eventTickets.length > 0 ? ((checkedInTickets.length / eventTickets.length) * 100).toFixed(1) : '0',
    })

    // Get attendee details for checked in and not checked in
    const checkedInWithDetails = checkedInTickets.map(ticket => {
      const rsvp = mockRsvps.find(r => r.id === ticket.rsvpId)
      const user = mockUsers.find(u => u.id === ticket.userId)
      return { ticket, rsvp, user }
    })

    const notCheckedInWithDetails = notCheckedInTickets.map(ticket => {
      const rsvp = mockRsvps.find(r => r.id === ticket.rsvpId)
      const user = mockUsers.find(u => u.id === ticket.userId)
      return { ticket, rsvp, user }
    })

    setCheckedInList(checkedInWithDetails)
    setNotCheckedInList(notCheckedInWithDetails)
  }, [eventId])

  const handleQRCodeScan = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!qrInput.trim()) {
      setError('Please enter a QR code')
      return
    }

    try {
      // Simulate QR code check-in
      const response = await fetch('/api/tickets/check-in-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: qrInput, eventId }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.data?.error || 'Check-in failed')
        return
      }

      const data = await response.json()
      const ticket = data.data?.ticket
      const user = mockUsers.find(u => u.id === ticket.userId)

      setSuccess(`✓ ${user?.name} checked in successfully!`)
      setQrInput('')

      // Update lists
      setNotCheckedInList(list => list.filter(item => item.ticket.id !== ticket.id))
      setCheckedInList(list => [...list, { ticket, user }])

      if (stats) {
        setStats({
          ...stats,
          checkedIn: stats.checkedIn + 1,
          notCheckedIn: stats.notCheckedIn - 1,
          checkInRate: ((stats.checkedIn + 1) / stats.totalTickets * 100).toFixed(1),
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in')
    }
  }

  const filteredNotCheckedIn = notCheckedInList.filter(item => {
    const matchesSearch = !searchQuery || 
      item.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const filteredCheckedIn = checkedInList.filter(item => {
    const matchesSearch = !searchQuery || 
      item.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  if (!event) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
          {/* Header */}
          <div className="mb-8">
            <Link href={`/organizer/events/${eventId}`}>
              <Button variant="ghost" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">{event.name}</h1>
            <p className="text-muted-foreground">Check-In Management</p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stats.totalTickets}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Checked In</p>
                <p className="mt-1 text-2xl font-bold text-green-600">{stats.checkedIn}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">{stats.notCheckedIn}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Check-In Rate</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">{stats.checkInRate}%</p>
              </Card>
            </div>
          )}

          {/* QR Scanner */}
          <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <QrCode className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-foreground">QR Code Scanner</h2>
            </div>
            <form onSubmit={handleQRCodeScan} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Scan QR code here..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button type="submit" className="gap-2">
                  <QrCode className="h-4 w-4" />
                  Check In
                </Button>
              </div>
            </form>

            {/* Status Messages */}
            {error && (
              <div className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 rounded-lg bg-green-100 p-3 text-sm text-green-800">
                {success}
              </div>
            )}
          </Card>

          {/* Attendee Lists */}
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pending ({notCheckedInList.length})
              </TabsTrigger>
              <TabsTrigger value="checked" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Checked In ({checkedInList.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {notCheckedInList.length > 0 && (
                <div className="mb-4">
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="gap-2"
                  />
                </div>
              )}

              {filteredNotCheckedIn.length > 0 ? (
                <div className="space-y-3">
                  {filteredNotCheckedIn.map(item => (
                    <AttendeeCheckInCard
                      key={item.ticket.id}
                      ticket={item.ticket}
                      user={item.user}
                      rsvp={item.rsvp}
                      isCheckedIn={false}
                    />
                  ))}
                </div>
              ) : notCheckedInList.length === 0 ? (
                <Card className="p-12 text-center">
                  <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    All Checked In!
                  </h3>
                  <p className="text-muted-foreground">
                    Everyone has completed check-in
                  </p>
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No attendees match your search</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="checked" className="space-y-4">
              {checkedInList.length > 0 && (
                <div className="mb-4">
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}

              {filteredCheckedIn.length > 0 ? (
                <div className="space-y-3">
                  {filteredCheckedIn.map(item => (
                    <AttendeeCheckInCard
                      key={item.ticket.id}
                      ticket={item.ticket}
                      user={item.user}
                      rsvp={item.rsvp}
                      isCheckedIn={true}
                    />
                  ))}
                </div>
              ) : checkedInList.length === 0 ? (
                <Card className="p-12 text-center">
                  <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No attendees checked in yet</p>
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No attendees match your search</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
      </div>
    </div>
  )
}

function AttendeeCheckInCard({
  ticket,
  user,
  rsvp,
  isCheckedIn,
}: {
  ticket: any
  user: any
  rsvp: any
  isCheckedIn: boolean
}) {
  return (
    <Card className={`overflow-hidden transition-all ${isCheckedIn ? 'bg-green-50 border-green-200' : ''}`}>
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 flex-1">
          {isCheckedIn && (
            <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
          )}
          <div>
            <h3 className="font-semibold text-foreground">{user?.name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {rsvp?.plusOneCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                +{rsvp.plusOneCount} guest{rsvp.plusOneCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isCheckedIn && ticket.checkInTime && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Checked in</p>
              <p className="text-sm font-medium text-foreground">
                {format(new Date(ticket.checkInTime), 'h:mm a')}
              </p>
            </div>
          )}
          <Badge className={isCheckedIn ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
            {isCheckedIn ? 'Checked In' : 'Pending'}
          </Badge>
        </div>
      </div>
    </Card>
  )
}
