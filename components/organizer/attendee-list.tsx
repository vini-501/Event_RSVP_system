import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RSVP_STATUSES } from '@/lib/constants'
import type { Rsvp } from '@/lib/types'

interface AttendeeListProps {
  rsvps: (Rsvp & { user?: any })[]
}

export function AttendeeList({ rsvps }: AttendeeListProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Plus Ones</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Dietary Preferences</TableHead>
            <TableHead className="text-right">Registered</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rsvps.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No attendees found
              </TableCell>
            </TableRow>
          ) : (
            rsvps.map((rsvp) => {
              const statusInfo = RSVP_STATUSES.find((s) => s.value === rsvp.status)

              return (
                <TableRow key={rsvp.id}>
                  <TableCell className="font-medium">
                    {rsvp.user?.name || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-sm">{rsvp.user?.email || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusInfo?.color}>
                      {statusInfo?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{rsvp.plusOneCount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={rsvp.checkInStatus === 'checked_in' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {rsvp.checkInStatus === 'checked_in' ? 'Checked in' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {rsvp.dietaryPreferences || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(rsvp.createdAt, 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
