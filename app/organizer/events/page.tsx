'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MOCK_EVENTS } from '@/lib/mock-data'
import { Calendar, Users, Search, Plus, MapPin, ArrowUpRight } from 'lucide-react'

// Deterministic pseudo-random number from a string (avoids hydration mismatch)
function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash % 1000) / 1000
}

export default function OrganizerEventsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEvents = MOCK_EVENTS.filter((event) =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Your Events</h1>
            <p className="text-muted-foreground mt-1">Manage and monitor your events</p>
          </div>
          <Link href="/organizer/create-event">
            <Button className="gap-2 rounded-xl shadow-md shadow-primary/25">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        {/* Event Cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => {
            const rsvpCount = Math.floor(seededRandom(event.id) * event.capacity * 0.8)
            const fillPercent = Math.round((event.currentAttendees / event.capacity) * 100)
            return (
              <Card key={event.id} className="group hover:shadow-md transition-all duration-200 overflow-hidden">
                {/* Color bar at top */}
                <div className="h-1 bg-gradient-to-r from-primary to-primary/40" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                        {event.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-1 mt-1">
                        {event.description}
                      </CardDescription>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        event.status === 'published'
                          ? 'bg-primary/10 text-primary'
                          : event.status === 'live'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : event.status === 'draft'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-red-500/10 text-red-600'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Date</p>
                      <p className="font-medium flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Capacity</p>
                      <p className="font-medium mt-0.5">{event.capacity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">RSVPs</p>
                      <p className="font-medium flex items-center gap-1 mt-0.5">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        {rsvpCount}
                      </p>
                    </div>
                  </div>

                  {/* Fill bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.city}, {event.state}
                      </p>
                      <p className="text-xs font-medium">{fillPercent}% filled</p>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Link href={`/organizer/events/${event.id}/manage`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full rounded-lg text-xs">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/organizer/events/${event.id}/attendees`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full rounded-lg text-xs">
                        Attendees
                      </Button>
                    </Link>
                    <Link href={`/organizer/events/${event.id}/analytics`}>
                      <Button variant="ghost" size="sm" className="rounded-lg text-xs gap-1">
                        <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredEvents.length === 0 && (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-muted-foreground mb-4">No events found</p>
              <Link href="/organizer/create-event">
                <Button className="rounded-xl">Create Your First Event</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
