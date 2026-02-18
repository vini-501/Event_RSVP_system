import { Users, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface SeatAvailabilityProps {
  current: number
  total: number
  showLabel?: boolean
}

export function SeatAvailability({ current, total, showLabel = true }: SeatAvailabilityProps) {
  const spotsLeft = total - current
  const percentageFilled = (current / total) * 100
  const isNearCapacity = percentageFilled > 85
  const isFull = current >= total

  return (
    <div className="space-y-3">
      {showLabel && (
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Seat Availability
        </p>
      )}

      {/* Status badge */}
      {isFull ? (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm font-medium text-red-600">
          <AlertTriangle className="h-4 w-4" />
          Event is at full capacity
        </div>
      ) : isNearCapacity ? (
        <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 text-sm font-medium text-amber-600">
          <AlertTriangle className="h-4 w-4" />
          Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left!
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-sm font-medium text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          {spotsLeft} spots available
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <Users className="h-3.5 w-3.5 text-primary" />
            {current} / {total}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round(percentageFilled)}% filled
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isFull
                ? 'bg-red-500'
                : isNearCapacity
                ? 'bg-amber-500'
                : 'bg-primary'
            }`}
            style={{ width: `${Math.min(percentageFilled, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
