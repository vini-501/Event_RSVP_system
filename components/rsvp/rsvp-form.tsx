'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Users, HelpCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { RSVP_STATUSES } from '@/lib/constants'

const rsvpFormSchema = z.object({
  status: z.enum(['going', 'maybe', 'not_going']),
  plusOneCount: z.coerce.number().min(0, 'Plus ones cannot be negative').max(10, 'Maximum 10 plus ones'),
  dietaryPreferences: z.string().optional(),
})

interface RSVPFormProps {
  event: any
  onSuccess?: () => void
}

const statusOptions = [
  {
    value: 'going' as const,
    label: "I'm Going",
    icon: CheckCircle2,
    color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-700',
    activeColor: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 ring-2 ring-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  {
    value: 'maybe' as const,
    label: 'Maybe',
    icon: HelpCircle,
    color: 'border-blue-500/40 bg-blue-500/5 text-blue-700',
    activeColor: 'border-blue-500 bg-blue-500/10 text-blue-700 ring-2 ring-blue-500/20',
    dot: 'bg-blue-500',
  },
  {
    value: 'not_going' as const,
    label: 'Not Going',
    icon: XCircle,
    color: 'border-red-500/40 bg-red-500/5 text-red-700',
    activeColor: 'border-red-500 bg-red-500/10 text-red-700 ring-2 ring-red-500/20',
    dot: 'bg-red-500',
  },
]

export function RSVPForm({ event, onSuccess }: RSVPFormProps) {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'waitlisted'>(
    'idle'
  )

  const form = useForm({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      status: 'going',
      plusOneCount: 0,
      dietaryPreferences: '',
    },
  })

  const onSubmit = async (data: any) => {
    setSubmitStatus('idle')

    try {
      const response = await fetch(`/api/rsvps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          status: data.status,
          plusOneCount: data.plusOneCount,
          dietaryPreferences: data.dietaryPreferences,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit RSVP')
      }

      const result = await response.json()

      if (result.isWaitlisted) {
        setSubmitStatus('waitlisted')
      } else {
        setSubmitStatus('success')
      }

      form.reset()

      if (onSuccess) {
        setTimeout(onSuccess, 2000)
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      setSubmitStatus('error')
    }
  }

  const selectedStatus = form.watch('status')

  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary to-primary/40" />
      <div className="p-6">
        <h2 className="mb-1 text-xl font-bold text-foreground">RSVP Now</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Let us know if you can make it
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* RSVP Status Selector */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Response</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-2">
                      {statusOptions.map((option) => {
                        const Icon = option.icon
                        const isSelected = field.value === option.value
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => field.onChange(option.value)}
                            className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all duration-200 cursor-pointer ${
                              isSelected ? option.activeColor : option.color
                            } hover:shadow-sm`}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-medium">{option.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plus Ones */}
            <FormField
              control={form.control}
              name="plusOneCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    Additional Guests
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5].map((count) => (
                          <SelectItem key={count} value={count.toString()}>
                            {count} {count === 1 ? 'Guest' : 'Guests'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>Bring along additional guests</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dietary Preferences */}
            <FormField
              control={form.control}
              name="dietaryPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Preferences (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Let us know if you have any dietary restrictions or preferences..."
                      className="rounded-xl resize-none"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Status Messages */}
            {submitStatus === 'success' && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                RSVP submitted successfully! Check your email for confirmation.
              </div>
            )}

            {submitStatus === 'waitlisted' && (
              <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-sm text-blue-600">
                <HelpCircle className="h-4 w-4 shrink-0" />
                You've been added to the waitlist. We'll notify you if a spot opens up.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600">
                <XCircle className="h-4 w-4 shrink-0" />
                Error submitting RSVP. Please try again.
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
              className="w-full rounded-xl shadow-md shadow-primary/25"
            >
              {form.formState.isSubmitting ? 'Submitting...' : 'Submit RSVP'}
            </Button>
          </form>
        </Form>
      </div>
    </Card>
  )
}
