'use client'

import { useEffect, useState } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

interface CountdownTimerProps {
  targetDate: Date
  label?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

export function CountdownTimer({ targetDate, label }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  })

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime()
      const target = targetDate.getTime()
      const difference = target - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true })
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isExpired: false,
      })
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600">
        <AlertTriangle className="h-4 w-4" />
        Event has started
      </div>
    )
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      )}
      <div className={`inline-flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium ${
        isUrgent
          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
          : 'bg-primary/10 text-primary border border-primary/20'
      }`}>
        <Clock className="h-4 w-4" />
        <div className="flex items-center gap-1.5">
          {timeLeft.days > 0 && (
            <TimeUnit value={timeLeft.days} unit="d" />
          )}
          <TimeUnit value={timeLeft.hours} unit="h" />
          <TimeUnit value={timeLeft.minutes} unit="m" />
          <TimeUnit value={timeLeft.seconds} unit="s" />
        </div>
      </div>
    </div>
  )
}

function TimeUnit({ value, unit }: { value: number; unit: string }) {
  return (
    <span className="inline-flex items-baseline gap-0.5">
      <span className="tabular-nums font-bold text-base">{value}</span>
      <span className="text-xs opacity-70">{unit}</span>
    </span>
  )
}
