import { Users, TrendingUp, Calendar, Target } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { Event } from '@/lib/types'

interface EventStatsProps {
  event: Event
}

export function EventStats({ event }: EventStatsProps) {
  const capacityPercentage = (event.currentAttendees / event.capacity) * 100
  const spotsAvailable = event.capacity - event.currentAttendees

  const stats = [
    {
      label: 'Total Attendees',
      value: event.currentAttendees,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Capacity',
      value: `${capacityPercentage.toFixed(1)}%`,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Available Spots',
      value: spotsAvailable,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Status',
      value: event.status,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className={`p-4 ${stat.bgColor}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <Icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
