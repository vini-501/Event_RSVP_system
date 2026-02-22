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
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
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
        className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background shadow-md border border-border/60 p-1.5 hover:bg-muted transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 px-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.href} href={action.href} className="shrink-0">
              <Card className="min-w-[180px] group cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-300 border-border/60">
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
        className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background shadow-md border border-border/60 p-1.5 hover:bg-muted transition-colors"
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
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-amber-500/8 blur-3xl" />
        <div className="pointer-events-none absolute top-10 -left-10 h-56 w-56 rounded-full bg-primary/8 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-600">Admin Command Centre</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">
            {greeting},{' '}
            <span className="bg-gradient-to-r from-amber-500 to-primary bg-clip-text text-transparent">
              {firstName}.
            </span>
          </h1>
          <p className="text-muted-foreground text-base max-w-md">
            Here's a snapshot of what's happening across the platform.
          </p>

          {/* Metrics Strip */}
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg">
            {metricCards.map((m) => {
              const Icon = m.icon
              return (
                <div key={m.label} className={`rounded-2xl border border-border/60 p-4 flex flex-col gap-2 bg-background`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.bg}`}>
                    <Icon className={`h-4 w-4 ${m.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none">
                      {isLoading ? '—' : m.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 space-y-10">
        {/* Attention Banner */}
        {!isLoading && pendingRoleRequests.length > 0 && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {pendingRoleRequests.length} organiser request{pendingRoleRequests.length > 1 ? 's' : ''} waiting for your review.
              </p>
            </div>
            <Link href="/admin/role-requests">
              <Button size="sm" className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white shrink-0">
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
