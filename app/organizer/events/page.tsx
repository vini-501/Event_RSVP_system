'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Calendar, Users, Search, Plus, MapPin, ArrowUpRight, Loader2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function OrganizerEventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.id) return

      try {
        // Fetch all events created by this organizer
        // Note: The API currently returns all published events or filtered events
        // Ideally we'd have a specific endpoint for organizer events or filter by organizer_id
        // For now, we'll fetch from /api/events and filter client-side if needed, 
        // or rely on the API to return relevant events if we update it.
        // Let's assume we need to filter by current user's ID match on organizer_id
        // But /api/events GET doesn't strictly filter by organizer unless we add a param.
        // Let's rely on the fact that for now we might fetch all and filter in UI 
        // or add a query param if backend supports it.
        // Actually, let's look at the backend service... getEvents filters by 'published' status by default.
        // We probably need a way to see Drafting events too.
        // Since we can't easily change the backend right this second without reading it again,
        // let's try fetching and see what we get.
        // Wait, I recall `getEvents` filters by `status='published'`. 
        // We need a way to get *my* events regardless of status.
        // Let's try fetching with a high limit.
        const response = await fetch('/api/events?limit=100')
        if (!response.ok) throw new Error('Failed to fetch events')
        
        const data = await response.json()
        const allEvents = data.data?.events || []
        
        // Filter for events where creator is current user
        // The API returns profiles!organizer_id embedded. 
        // We can check event.organizer_id === user.id
        const myEvents = allEvents.filter((e: any) => e.organizer_id === user.id)
        
        setEvents(myEvents)
      } catch (err) {
        console.error('Failed to load events', err)
        setError('Failed to load your events')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [user?.id])

  const filteredEvents = events.filter((event) =>
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

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p>Loading your events...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4 border-destructive/30 hover:bg-destructive/20"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 py-16 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">No events found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
              {searchTerm 
                ? "We couldn't find any events matching your search." 
                : "Get started by creating your first event to share with the community."}
            </p>
            <Link href="/organizer/create-event">
              <Button variant={searchTerm ? "outline" : "default"} className="rounded-xl">
                {searchTerm ? "Clear Search" : "Create Event"}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="group overflow-hidden rounded-2xl border-border/60 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                <div className="aspect-video w-full bg-muted relative overflow-hidden">
                  {event.image_url ? (
                    <img 
                      src={event.image_url} 
                      alt={event.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center">
                      <Calendar className="h-10 w-10 text-primary/40" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge className={
                      event.status === 'published' ? 'bg-green-500/90 hover:bg-green-500' :
                      event.status === 'draft' ? 'bg-amber-500/90 hover:bg-amber-500' :
                      event.status === 'live' ? 'bg-blue-500/90 hover:bg-blue-500' :
                      'bg-slate-500/90'
                    }>
                      {event.status}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-5">
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {event.name}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground gap-1.5 mb-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {new Date(event.start_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-muted-foreground/40">•</span>
                        <span>
                          {new Date(event.start_date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{event.location || 'TBD'}</span>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/40">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{event.capacity || 0}</span>
                        <span className="text-muted-foreground font-normal text-xs">cap</span>
                      </div>
                      <Link href={`/organizer/events/${event.id}/analytics`}>
                        <Button size="sm" variant="ghost" className="h-8 px-3 text-xs gap-1 hover:text-primary hover:bg-primary/5">
                          Manage
                          <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
