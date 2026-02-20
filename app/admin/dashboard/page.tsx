'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, Shield, TrendingUp, Activity } from 'lucide-react'

const roleBadgeColor: Record<string, string> = {
  attendee: 'bg-primary/10 text-primary',
  organizer: 'bg-emerald-500/10 text-emerald-600',
  admin: 'bg-amber-500/10 text-amber-600',
}

type DashboardStat = {
  totalUsers: number
  totalEvents: number
  activeRsvps: number
  revenue: number
  change: {
    totalUsers: number
    totalEvents: number
    activeRsvps: number
    revenue: number
  }
}

type RoleDistributionItem = {
  role: string
  count: number
  percent: number
  color: string
}

type ActivityItem = {
  action: string
  user: string
  role: string
  createdAt: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStat | null>(null)
  const [roleDistribution, setRoleDistribution] = useState<RoleDistributionItem[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/admin/dashboard', { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to fetch dashboard metrics')

        const payload = await response.json()
        const data = payload?.data
        setStats(data?.stats || null)
        setRoleDistribution(data?.roleDistribution || [])
        setRecentActivity(data?.recentActivity || [])
      } catch (error) {
        console.error('Failed to fetch admin dashboard', error)
        setStats({
          totalUsers: 0,
          totalEvents: 0,
          activeRsvps: 0,
          revenue: 0,
          change: {
            totalUsers: 0,
            totalEvents: 0,
            activeRsvps: 0,
            revenue: 0,
          },
        })
        setRoleDistribution([])
        setRecentActivity([])
      } finally {
        setIsLoading(false)
      }
    }

    void fetchDashboard()
    const timer = setInterval(() => void fetchDashboard(), 30000)
    return () => clearInterval(timer)
  }, [])

  const platformStats = useMemo(
    () => [
      {
        label: 'Total Users',
        value: stats?.totalUsers ?? 0,
        change: stats?.change.totalUsers ?? 0,
        icon: Users,
        color: 'text-primary',
      },
      {
        label: 'Total Events',
        value: stats?.totalEvents ?? 0,
        change: stats?.change.totalEvents ?? 0,
        icon: Calendar,
        color: 'text-emerald-600',
      },
      {
        label: 'Active RSVPs',
        value: stats?.activeRsvps ?? 0,
        change: stats?.change.activeRsvps ?? 0,
        icon: Activity,
        color: 'text-blue-600',
      },
      {
        label: 'Revenue',
        value: `$${(stats?.revenue ?? 0).toLocaleString()}`,
        change: stats?.change.revenue ?? 0,
        icon: TrendingUp,
        color: 'text-amber-600',
      },
    ],
    [stats],
  )

  const relativeTime = (iso: string) => {
    const diffMs = new Date(iso).getTime() - Date.now()
    const minutes = Math.round(diffMs / (1000 * 60))
    if (Math.abs(minutes) < 60) return `${Math.abs(minutes)} min ago`
    const hours = Math.round(minutes / 60)
    if (Math.abs(hours) < 24) return `${Math.abs(hours)} hour${Math.abs(hours) === 1 ? '' : 's'} ago`
    const days = Math.round(hours / 24)
    return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Platform-wide overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {platformStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold">
                        {isLoading ? '...' : stat.value}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/60 p-2.5">
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        stat.change >= 0
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-red-500/10 text-red-600'
                      }`}
                    >
                      {stat.change >= 0 ? '+' : ''}
                      {stat.change}%
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Role Distribution */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
            <CardTitle className="text-lg">User Role Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              {isLoading && roleDistribution.length === 0 && (
                <p className="text-sm text-muted-foreground">Loading role distribution...</p>
              )}
              {roleDistribution.map((item) => (
                <div key={item.role} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.role}</span>
                    <span className="text-muted-foreground">{item.count} ({item.percent}%)</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-3">
                {isLoading && recentActivity.length === 0 && (
                  <p className="text-sm text-muted-foreground">Loading recent activity...</p>
                )}
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.user}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeColor[activity.role]}`}>
                        {activity.role}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {relativeTime(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
                {!isLoading && recentActivity.length === 0 && (
                  <p className="text-sm text-muted-foreground">No recent activity yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
