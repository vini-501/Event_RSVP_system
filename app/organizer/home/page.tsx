'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Plus,
  Calendar,
  QrCode,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ArrowRight,
  Rocket,
  Users,
  TrendingUp,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { AnimatedText } from '@/components/animated-text'
import { OrganizerHeaderBg } from '@/components/organizer-header-bg'

type OrgEvent = {
  id: string
  name: string
  start_date: string
  status: string
  rsvp_count?: number
  city?: string | null
  state?: string | null
}

const quickActions = [
  {
    icon: Plus,
    label: 'Create Event',
    desc: 'Launch something new',
    href: '/organizer/create-event',
    bg: 'bg-primary',
    text: 'text-primary-foreground',
    shadow: 'shadow-primary/30',
    isPrimary: true,
  },
  {
    icon: Calendar,
    label: 'My Events',
    desc: 'Manage your lineup',
    href: ROUTES.ORGANIZER_EVENTS,
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    shadow: '',
    isPrimary: false,
  },
  {
    icon: QrCode,
    label: 'Check-In Hub',
    desc: 'Scan attendee tickets',
    href: ROUTES.ORGANIZER_CHECK_IN,
    bg: 'bg-sky-500/10',
    text: 'text-sky-600',
    shadow: '',
    isPrimary: false,
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    desc: 'See what\'s working',
    href: ROUTES.ORGANIZER_DASHBOARD,
    bg: 'bg-violet-500/10',
    text: 'text-violet-600',
    shadow: '',
    isPrimary: false,
  },
]

const statusStyle: Record<string, string> = {
  published: 'bg-primary/10 text-primary',
  live: 'bg-emerald-500/10 text-emerald-600',
  draft: 'bg-muted text-muted-foreground',
  finished: 'bg-muted text-muted-foreground',
  cancelled: 'bg-red-500/10 text-red-600',
}

function EventCarousel({ events, isLoading }: { events: OrgEvent[]; isLoading: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 min-w-[220px] rounded-2xl bg-muted/50 animate-pulse sm:min-w-[260px]" />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed">
        <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground mb-4">You haven't created any events yet.</p>
        <Link href="/organizer/create-event">
          <Button size="sm" className="rounded-xl gap-2">
            <Plus className="h-4 w-4" /> Create your first event
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll('left')}
        className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border/60 bg-background p-1.5 shadow-md transition-colors hover:bg-muted lg:inline-flex"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 pl-1 pr-2 lg:px-8"
        style={{ scrollbarWidth: 'none' }}
      >
        {events.map((event) => (
          <Link key={event.id} href={ROUTES.ORGANIZER_EVENT_ANALYTICS(event.id)} className="shrink-0 snap-start">
            <Card className="group w-[220px] cursor-pointer transition-all duration-300 hover:border-primary/30 hover:shadow-lg sm:w-[260px]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyle[event.status] || statusStyle.draft}`}>
                    {event.status}
                  </span>
                  {event.rsvp_count !== undefined && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {event.rsvp_count}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-sm leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {event.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(event.start_date).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <button
        onClick={() => scroll('right')}
        className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border/60 bg-background p-1.5 shadow-md transition-colors hover:bg-muted lg:inline-flex"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

function useTimeOfDay() {
  const [greeting, setGreeting] = useState('Welcome')

  useEffect(() => {
    try {
      const timeString = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour12: false })
      const hourStr = timeString.split(' ')[1].split(':')[0]
      const hour = parseInt(hourStr, 10) % 24
      
      if (hour < 12) setGreeting('Good morning')
      else if (hour < 17) setGreeting('Good afternoon')
      else setGreeting('Good evening')
    } catch (e) {
      const hour = new Date().getHours()
      if (hour < 12) setGreeting('Good morning')
      else if (hour < 17) setGreeting('Good afternoon')
      else setGreeting('Good evening')
    }
  }, [])

  return greeting
}

export default function OrganizerHomePage() {
  const { user } = useAuth()
  const greeting = useTimeOfDay()
  const firstName = user?.name?.split(' ')[0] || 'Organizer'
  const [events, setEvents] = useState<OrgEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ totalEvents: 0, totalRsvps: 0, upcomingEvents: 0 })

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const [evRes, dashRes] = await Promise.all([
          fetch('/api/organizer/events?limit=6', { cache: 'no-store' }),
          fetch('/api/organizer/dashboard', { cache: 'no-store' }),
        ])
        if (evRes.ok) {
          const d = await evRes.json()
          setEvents(d?.data?.events || [])
        }
        if (dashRes.ok) {
          const d = await dashRes.json()
          const s = d?.data?.stats
          if (s) setStats({ totalEvents: s.totalEvents ?? 0, totalRsvps: s.totalRsvps ?? 0, upcomingEvents: s.upcomingEvents ?? 0 })
        }
      } catch { /* silent */ } finally {
        setIsLoading(false)
      }
    }
    void fetch_()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/50">
          <OrganizerHeaderBg />

          <div className="relative z-10 mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600">Organizer Studio</span>
            </div>
            <AnimatedText 
              text={`${greeting}, ${firstName}`}
              className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-3"
            />
            <p className="text-muted-foreground text-base max-w-md">
              Build unforgettable events, engage your audience, and track every detail.
            </p>
          </div>
        </div>

        {/* Stat Strip */}
        <section className="pt-2">
          <div className="flex flex-wrap gap-6">
            {[
              { icon: Calendar, label: 'Total Events', value: isLoading ? '—' : stats.totalEvents },
              { icon: Users, label: 'Total RSVPs', value: isLoading ? '—' : stats.totalRsvps },
              { icon: TrendingUp, label: 'Upcoming', value: isLoading ? '—' : stats.upcomingEvents },
            ].map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="rounded-xl bg-muted/60 p-2.5 shadow-sm">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.href} href={action.href}>
                  <Card className={`group cursor-pointer hover:shadow-lg transition-all duration-300 h-full border-border/60 ${action.isPrimary ? 'bg-primary shadow-lg shadow-primary/20 border-primary' : ''}`}>
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${action.isPrimary ? 'bg-white/20' : action.bg}`}>
                        <Icon className={`h-5 w-5 ${action.isPrimary ? 'text-primary-foreground' : action.text}`} />
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${action.isPrimary ? 'text-primary-foreground' : 'group-hover:text-primary transition-colors'}`}>
                          {action.label}
                        </p>
                        <p className={`text-xs mt-0.5 ${action.isPrimary ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {action.desc}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Recent Events */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Your Recent Events
            </h2>
            <Link href={ROUTES.ORGANIZER_EVENTS}>
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1 rounded-xl">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <EventCarousel events={events} isLoading={isLoading} />
        </section>
      </div>
    </div>
  )
}
