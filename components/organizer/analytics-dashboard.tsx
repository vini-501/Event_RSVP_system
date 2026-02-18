'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '@/components/ui/card'
import type { Rsvp } from '@/lib/types'

interface AnalyticsDashboardProps {
  rsvps: Rsvp[]
}

export function AnalyticsDashboard({ rsvps }: AnalyticsDashboardProps) {
  // Count RSVPs by status
  const statusCounts = {
    going: rsvps.filter((r) => r.status === 'going').length,
    maybe: rsvps.filter((r) => r.status === 'maybe').length,
    not_going: rsvps.filter((r) => r.status === 'not_going').length,
  }

  const pieData = [
    { name: 'Going', value: statusCounts.going, color: '#22c55e' },
    { name: 'Maybe', value: statusCounts.maybe, color: '#3b82f6' },
    { name: 'Not Going', value: statusCounts.not_going, color: '#ef4444' },
  ].filter((item) => item.value > 0)

  // Check-in status
  const checkedIn = rsvps.filter((r) => r.checkInStatus === 'checked_in').length
  const checkInPercentage = rsvps.length > 0 ? (checkedIn / rsvps.length) * 100 : 0
  
  // Total attendees with plus ones
  const totalAttendees = rsvps
    .filter((r) => r.status === 'going')
    .reduce((sum, r) => sum + 1 + r.plusOneCount, 0)
  
  // Average plus ones
  const avgPlusOnes = rsvps.length > 0
    ? (rsvps.reduce((sum, r) => sum + r.plusOneCount, 0) / rsvps.length).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      {/* RSVP Status Breakdown */}
      <Card className="p-6">
        <h3 className="mb-6 text-lg font-semibold text-foreground">
          RSVP Status Breakdown
        </h3>

        {pieData.length > 0 ? (
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {pieData.map((item) => (
                <div key={item.name} className="text-center">
                  <div className="text-2xl font-bold text-foreground">{item.value}</div>
                  <p className="text-xs text-muted-foreground">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No RSVP data yet</p>
        )}
      </Card>

      {/* Check-in Status */}
      <Card className="p-6">
        <h3 className="mb-6 text-lg font-semibold text-foreground">Check-in Status</h3>
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Checked In</span>
              <span className="text-2xl font-bold text-primary">
                {checkedIn}/{rsvps.length}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${checkInPercentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {checkInPercentage.toFixed(1)}% of attendees checked in
            </p>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Total Responses</h3>
          <p className="text-3xl font-bold text-primary">{rsvps.length}</p>
          <p className="mt-2 text-sm text-muted-foreground">All RSVP responses</p>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Total Attendees</h3>
          <p className="text-3xl font-bold text-primary">{totalAttendees}</p>
          <p className="mt-2 text-sm text-muted-foreground">Including plus ones</p>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Avg Plus Ones</h3>
          <p className="text-3xl font-bold text-primary">{avgPlusOnes}</p>
          <p className="mt-2 text-sm text-muted-foreground">Per attendee</p>
        </Card>
      </div>
    </div>
  )
}
