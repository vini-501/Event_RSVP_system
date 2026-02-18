'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, BarChart3, Shield, TrendingUp, Activity } from 'lucide-react'

const platformStats = [
  { label: 'Total Users', value: '2,847', change: '+12%', icon: Users, color: 'text-primary' },
  { label: 'Total Events', value: '156', change: '+8%', icon: Calendar, color: 'text-emerald-600' },
  { label: 'Active RSVPs', value: '4,293', change: '+23%', icon: Activity, color: 'text-blue-600' },
  { label: 'Revenue', value: '$12,480', change: '+15%', icon: TrendingUp, color: 'text-amber-600' },
]

const roleDistribution = [
  { role: 'Attendees', count: 2340, percent: 82, color: 'bg-primary' },
  { role: 'Organizers', count: 485, percent: 17, color: 'bg-emerald-500' },
  { role: 'Admins', count: 22, percent: 1, color: 'bg-amber-500' },
]

const recentActivity = [
  { action: 'New user registered', user: 'john.doe@email.com', role: 'attendee', time: '2 min ago' },
  { action: 'Event created', user: 'sarah@events.com', role: 'organizer', time: '15 min ago' },
  { action: 'RSVP submitted', user: 'mike@email.com', role: 'attendee', time: '22 min ago' },
  { action: 'Event published', user: 'lisa@events.com', role: 'organizer', time: '1 hour ago' },
  { action: 'User role updated', user: 'admin@eventhub.com', role: 'admin', time: '2 hours ago' },
]

const roleBadgeColor: Record<string, string> = {
  attendee: 'bg-primary/10 text-primary',
  organizer: 'bg-emerald-500/10 text-emerald-600',
  admin: 'bg-amber-500/10 text-amber-600',
}

export default function AdminDashboardPage() {
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
                      <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="rounded-xl bg-muted/60 p-2.5">
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                      {stat.change}
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
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
