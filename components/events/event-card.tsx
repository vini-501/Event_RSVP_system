import Link from 'next/link'
import { format } from 'date-fns'
import { MapPin, Users, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Event } from '@/lib/types'
import { ROUTES, DATE_FORMAT } from '@/lib/constants'

interface EventCardProps {
  event: Event
  variant?: 'default' | 'compact'
}

export function EventCard({ event, variant = 'default' }: EventCardProps) {
  const capacityPercentage = (event.currentAttendees / event.capacity) * 100
  const spotsAvailable = event.capacity - event.currentAttendees

  if (variant === 'compact') {
    return (
      <Link href={ROUTES.EVENT_DETAILS(event.id)}>
        <Card className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-md border-border/60 hover:border-primary/20">
          <div className="h-1 bg-gradient-to-r from-primary to-primary/40" />
          <div className="p-4">
            <div className="mb-2 flex items-start justify-between">
              <h3 className="line-clamp-2 text-sm font-semibold group-hover:text-primary transition-colors">
                {event.name}
              </h3>
              {event.price && (
                <span className="whitespace-nowrap text-sm font-bold text-primary">
                  ${event.price}
                </span>
              )}
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {format(event.startDate, DATE_FORMAT)}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1">
                <div className="mb-1 text-xs font-medium">
                  {event.currentAttendees}/{event.capacity}
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={ROUTES.EVENT_DETAILS(event.id)}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-md border-border/60 hover:border-primary/20">
        <div className="aspect-video bg-gradient-to-br from-primary/10 via-primary/5 to-background relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Calendar className="h-12 w-12 text-primary/20" />
          </div>
        </div>
        <div className="p-6">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <Badge variant="outline" className="mb-2 rounded-full text-xs border-primary/20 text-primary bg-primary/5">
                {event.category}
              </Badge>
              <h2 className="line-clamp-2 text-lg font-bold group-hover:text-primary transition-colors">
                {event.name}
              </h2>
            </div>
            {event.price && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground">From</div>
                <div className="text-xl font-bold text-primary">${event.price}</div>
              </div>
            )}
          </div>

          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {event.description}
          </p>

          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <time>{format(event.startDate, DATE_FORMAT)}</time>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 font-medium">
                <Users className="h-4 w-4 text-primary" />
                {event.currentAttendees} attending
              </div>
              <span className="text-xs text-muted-foreground">
                {spotsAvailable} spots left
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
              />
            </div>
          </div>

          <button className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 shadow-md shadow-primary/25">
            View Details
          </button>
        </div>
      </Card>
    </Link>
  )
}
