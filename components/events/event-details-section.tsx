import { format, formatDistanceToNow } from 'date-fns'
import { Calendar, Clock, MapPin, Users, Tag, DollarSign } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SeatAvailability } from './seat-availability'
import type { Event } from '@/lib/types'

interface EventDetailsSectionProps {
  event: Event
}

export function EventDetailsSection({ event }: EventDetailsSectionProps) {
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  const isSameDay = startDate.toDateString() === endDate.toDateString()

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge variant="secondary" className="mb-4">
              {event.status}
            </Badge>
            <h1 className="break-words text-3xl font-bold text-foreground sm:text-4xl">
              {event.name}
            </h1>
          </div>
          {event.price && (
            <div className="text-left sm:text-right">
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-3xl font-bold text-primary">${event.price}</p>
            </div>
          )}
        </div>
        <p className="text-lg text-muted-foreground">{event.description}</p>
      </div>

      <Separator />

      {/* Event Details Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="border-none bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Calendar className="mt-1 h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-foreground">
                {format(startDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-none bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Clock className="mt-1 h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Time</p>
              <p className="text-foreground">
                {format(startDate, 'h:mm a')}
                {!isSameDay && ` - ${format(endDate, 'EEEE h:mm a')}`}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-none bg-primary/5 p-4 md:col-span-2">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="text-foreground">{event.location}</p>
              {event.address && (
                <p className="text-sm text-muted-foreground">{event.address}</p>
              )}
              {(event.city || event.state) && (
                <p className="text-sm text-muted-foreground">
                  {event.city}, {event.state} {event.zipCode}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Separator />

      {/* Attendance Section */}
      <Card className="border-none bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Attendance</h3>
        </div>
        <SeatAvailability
          current={event.currentAttendees}
          total={event.capacity}
        />
      </Card>

      {/* Event Category and Tags */}
      {(event.category || event.tags?.length) && (
        <Card className="border-none bg-card p-6">
          <div className="space-y-4">
            {event.category && (
              <div className="flex items-start gap-3">
                <Tag className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Category
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {event.category}
                  </Badge>
                </div>
              </div>
            )}

            {event.tags && event.tags.length > 0 && (
              <div>
                <p className="mb-3 text-sm font-medium text-muted-foreground">
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Organizer Section */}
      {event.organizer && (
        <Card className="border-none bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            About the Organizer
          </h3>
          <div className="space-y-2">
            <p className="font-medium text-foreground">{event.organizer.name}</p>
            <p className="text-sm text-muted-foreground">{event.organizer.email}</p>
          </div>
        </Card>
      )}
    </div>
  )
}
