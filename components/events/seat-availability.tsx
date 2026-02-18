import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SeatAvailabilityProps {
  current: number
  total: number
}

export function SeatAvailability({ current, total }: SeatAvailabilityProps) {
  const spotsLeft = total - current
  const percentageFilled = (current / total) * 100
  const isNearCapacity = percentageFilled > 85
  const isFull = current >= total

  if (isFull) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Event is at full capacity</AlertDescription>
      </Alert>
    )
  }

  if (isNearCapacity) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} available!
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          {current} / {total} Attending
        </span>
        <span className="text-muted-foreground">
          {spotsLeft} spots available
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
          style={{ width: `${percentageFilled}%` }}
        />
      </div>
    </div>
  )
}
