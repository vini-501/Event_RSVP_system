'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Shield,
  Users,
  Calendar,
  Activity,
  Rocket,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  LayoutDashboard,
  CheckSquare,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { AnimatedText } from '@/components/animated-text'
import { AdminHeaderBg } from '@/components/admin-header-bg'

const quickActions = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    desc: 'Full analytics overview',
    href: ROUTES.ADMIN_DASHBOARD,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Users,
    label: 'Manage Users',
    desc: 'View all accounts',
    href: ROUTES.ADMIN_USERS,
    color: 'text-violet-600',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Calendar,
    label: 'Events',
    desc: 'Oversee all events',
    href: ROUTES.ADMIN_EVENTS,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Rocket,
    label: 'Role Requests',
    desc: 'Approve organizers',
    href: '/admin/role-requests',
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
  },
  {
    icon: CheckSquare,
    label: 'RSVP Approvals',
    desc: 'Review pending RSVPs',
    href: ROUTES.ADMIN_RSVPS,
    color: 'text-sky-600',
    bg: 'bg-sky-500/10',
  },
]

function useTimeOfDay() {
  const [greeting, setGreeting] = useState('Welcome')

  useEffect(() => {
    try {
      const now = new Date()
      const d = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
      const hour = d.getHours()
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

function QuickActionsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })
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
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.href} href={action.href} className="shrink-0 snap-start">
              <Card className="group w-[180px] cursor-pointer border-border/60 transition-all duration-300 hover:border-primary/20 hover:shadow-md">
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.bg}`}>
                    <Icon className={`h-5 w-5 ${action.color}`} />
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
      <button
        onClick={() => scroll('right')}
        className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border/60 bg-background p-1.5 shadow-md transition-colors hover:bg-muted lg:inline-flex"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

type Metrics = {
  totalUsers: number
  totalEvents: number
  activeRsvps: number
}

type RoleRequest = { id: string }

export default function AdminHomePage() {
  const { user } = useAuth()
  const greeting = useTimeOfDay()
  const firstName = user?.name?.split(' ')[0] || 'Admin'
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [pendingRoleRequests, setPendingRoleRequests] = useState<RoleRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, roleRes] = await Promise.all([
          fetch('/api/admin/dashboard', { cache: 'no-store' }),
          fetch('/api/role-requests?status=pending', { cache: 'no-store' }),
        ])
        if (dashRes.ok) {
          const d = await dashRes.json()
          const s = d?.data?.stats
          if (s) setMetrics({ totalUsers: s.totalUsers ?? 0, totalEvents: s.totalEvents ?? 0, activeRsvps: s.activeRsvps ?? 0 })
        }
        if (roleRes.ok) {
          const d = await roleRes.json()
          setPendingRoleRequests(d?.data?.requests || [])
        }
      } catch { /* silent */ } finally {
        setIsLoading(false)
      }
    }
    void fetchData()
  }, [])

  const metricCards = [
    { icon: Users, label: 'Total Users', value: metrics?.totalUsers ?? 0, color: 'text-violet-600', bg: 'bg-violet-500/10' },
    { icon: Calendar, label: 'Total Events', value: metrics?.totalEvents ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { icon: Activity, label: 'Active RSVPs', value: metrics?.activeRsvps ?? 0, color: 'text-sky-600', bg: 'bg-sky-500/10' },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/50">
          <AdminHeaderBg />

          <div className="relative z-10 mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium text-amber-600">Admin Command Centre</span>
            </div>
            <AnimatedText 
              text={`${greeting}, ${firstName}`}
              className="text-3xl font-bold tracking-tight sm:text-4xl mb-2" 
            />
            <p className="text-muted-foreground text-base max-w-md">
              Here's a snapshot of what's happening across the platform.
            </p>
          </div>
        </div>

        {/* Metrics Strip */}
        <section className="pt-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {metricCards.map((m) => {
              const Icon = m.icon
              return (
                <div key={m.label} className={`rounded-2xl border border-border/60 p-4 flex flex-col gap-2 bg-background/50 shadow-sm`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.bg}`}>
                    <Icon className={`h-4 w-4 ${m.color}`} />
                  </div>
                  <div>
                    {isLoading ? (
                      <div className="h-6 w-24 animate-pulse rounded bg-muted/60 mb-0.5" />
                    ) : (
                      <p className="text-xl font-bold leading-none">
                        {m.value.toLocaleString()}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
        {/* Attention Banner */}
        {!isLoading && pendingRoleRequests.length > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {pendingRoleRequests.length} organiser request{pendingRoleRequests.length > 1 ? 's' : ''} waiting for your review.
              </p>
            </div>
            <Link href="/admin/role-requests" className="w-full sm:w-auto">
              <Button size="sm" className="w-full shrink-0 rounded-xl bg-amber-500 text-white hover:bg-amber-600 sm:w-auto">
                Review <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Quick Actions
          </h2>
          <QuickActionsCarousel />
        </section>
      </div>
    </div>
  )
}
