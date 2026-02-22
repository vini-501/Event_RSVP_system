'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Ticket,
  User,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'

type Event = {
  id: string
  name: string
  start_date: string
  location: string
  category: string
  status: string
}

const quickActions = [
  {
    icon: Search,
    label: 'Discover Events',
    desc: 'Find something exciting',
    href: ROUTES.EVENTS,
    gradient: 'from-violet-500/20 to-purple-500/10',
    iconColor: 'text-violet-500',
  },
  {
    icon: Calendar,
    label: 'My RSVPs',
    desc: 'Track your registrations',
    href: ROUTES.MY_RSVPS,
    gradient: 'from-emerald-500/20 to-teal-500/10',
    iconColor: 'text-emerald-500',
  },
  {
    icon: Ticket,
    label: 'My Tickets',
    desc: 'View & share your tickets',
    href: '/my-tickets',
    gradient: 'from-sky-500/20 to-blue-500/10',
    iconColor: 'text-sky-500',
  },
  {
    icon: User,
    label: 'My Profile',
    desc: 'Manage your account',
    href: ROUTES.PROFILE,
    gradient: 'from-rose-500/20 to-pink-500/10',
    iconColor: 'text-rose-500',
  },
]

function useGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function EventCarousel({ events, isLoading }: { events: Event[]; isLoading: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="min-w-[260px] h-36 rounded-2xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed">
        <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No upcoming events right now — check back soon!</p>
        <Link href={ROUTES.EVENTS} className="mt-4 inline-block">
          <Button size="sm" variant="outline" className="rounded-xl">Browse all events</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll('left')}
        className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background shadow-md border border-border/60 p-1.5 hover:bg-muted transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide px-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {events.map((event) => (
          <Link key={event.id} href={ROUTES.EVENT_DETAILS(event.id)} className="shrink-0">
            <Card className="min-w-[260px] max-w-[260px] group hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer">
              <CardContent className="p-5">
                <Badge className="mb-3 text-xs capitalize bg-primary/10 text-primary border-0">
                  {event.category || 'event'}
                </Badge>
                <p className="font-semibold text-sm leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {event.name}
                </p>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {new Date(event.start_date).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <button
        onClick={() => scroll('right')}
        className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background shadow-md border border-border/60 p-1.5 hover:bg-muted transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function AttendeeHomePage() {
  const { user } = useAuth()
  const greeting = useGreeting()
  const firstName = user?.name?.split(' ')[0] || 'there'
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events?limit=6&status=published', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        setEvents(data?.data?.events || [])
      } catch { /* silent */ } finally {
        setIsLoading(false)
      }
    }
    void fetchEvents()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-16 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 lg:px-8">
          {/* Greeting */}
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">{greeting}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-3">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              {firstName}!
            </span>{' '}
            👋
          </h1>
          <p className="text-muted-foreground text-base max-w-md">
            Discover events, track your RSVPs, and make the most of every experience.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 space-y-12">
        {/* Quick Action Cards */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.href} href={action.href}>
                  <Card className={`group cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-300 h-full bg-gradient-to-br ${action.gradient} border-border/60`}>
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-background/80 flex items-center justify-center shadow-sm`}>
                        <Icon className={`h-5 w-5 ${action.iconColor}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors">{action.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Upcoming Events */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Upcoming Events
            </h2>
            <Link href={ROUTES.EVENTS}>
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1 rounded-xl">
                Browse all <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <EventCarousel events={events} isLoading={isLoading} />
        </section>
      </div>
    </div>
  )
}
