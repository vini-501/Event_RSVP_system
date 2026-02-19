'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { AttendeeList } from '@/components/organizer/attendee-list'
import { mockEvents, mockRsvps, mockUsers } from '@/lib/mock-data'
import { ArrowLeft, Download, Search } from 'lucide-react'

export default function AttendeesPage() {
  const params = useParams<{ eventId: string }>()
  const eventId = params?.eventId

  const event = mockEvents.find((e) => e.id === eventId)
  const eventRsvps = mockRsvps.filter((r) => r.eventId === eventId)
  const confirmedRsvps = eventRsvps.filter((r) => !r.isWaitlisted)
  const waitlistedRsvps = eventRsvps.filter((r) => r.isWaitlisted)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'going' | 'maybe' | 'not_going'>('all')
  const [checkInFilter, setCheckInFilter] = useState<'all' | 'checked_in' | 'not_checked_in'>('all')
  const [showWaitlist, setShowWaitlist] = useState(false)

  const attendees = (showWaitlist ? waitlistedRsvps : confirmedRsvps).map((rsvp) => {
    const user = mockUsers.find((u) => u.id === rsvp.userId)
    return { ...rsvp, user }
  })

  const filteredAttendees = useMemo(() => {
    return attendees.filter((attendee) => {
      const matchesSearch =
        !searchQuery ||
        attendee.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.user?.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || attendee.status === statusFilter
      const matchesCheckIn =
        checkInFilter === 'all' || attendee.checkInStatus === checkInFilter

      return matchesSearch && matchesStatus && matchesCheckIn
    })
  }, [attendees, searchQuery, statusFilter, checkInFilter])

  const handleExportCSV = () => {
    const rows = [
      ['Name', 'Email', 'Status', 'Plus Ones', 'Check-in Status', 'Dietary Preferences'],
      ...filteredAttendees.map((a) => [
        a.user?.name || '',
        a.user?.email || '',
        a.status,
        a.plusOneCount.toString(),
        a.checkInStatus,
        a.dietaryPreferences || '',
      ]),
    ]

    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendees-${event?.id}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    )
  }

  const allAttendees = confirmedRsvps.map((rsvp) => {
    const user = mockUsers.find((u) => u.id === rsvp.userId)
    return { ...rsvp, user }
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/organizer/events">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Attendees</h1>
              <p className="text-muted-foreground">{event.name}</p>
            </div>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Guest List</CardTitle>
              <CardDescription>
                {confirmedRsvps.length} confirmed guests
                {waitlistedRsvps.length > 0 && ` + ${waitlistedRsvps.length} waitlisted`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filters */}
              <div className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-3">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Search Attendees</label>
                    <div className="relative mt-2">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="w-full md:w-40">
                    <label className="text-sm font-medium">RSVP Status</label>
                    <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="going">Going</SelectItem>
                        <SelectItem value="maybe">Maybe</SelectItem>
                        <SelectItem value="not_going">Not Going</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full md:w-40">
                    <label className="text-sm font-medium">Check-in Status</label>
                    <Select value={checkInFilter} onValueChange={(value: any) => setCheckInFilter(value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="checked_in">Checked In</SelectItem>
                        <SelectItem value="not_checked_in">Not Checked In</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant={showWaitlist ? 'default' : 'outline'}
                    onClick={() => setShowWaitlist(!showWaitlist)}
                    className="w-full md:w-auto"
                  >
                    {showWaitlist ? 'Waitlist' : 'Confirmed'}
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Showing {filteredAttendees.length} of {attendees.length} attendees
                </p>
              </div>

              {/* Attendee List */}
              <AttendeeList rsvps={filteredAttendees} />
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
