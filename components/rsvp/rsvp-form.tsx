'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { RSVP_STATUSES } from '@/lib/constants'
import type { RSVPFormData, Event } from '@/lib/types'

const rsvpFormSchema = z.object({
  status: z.enum(['going', 'maybe', 'not_going']),
  plusOneCount: z.coerce.number().min(0, 'Plus ones cannot be negative').max(10, 'Maximum 10 plus ones'),
  dietaryPreferences: z.string().optional(),
})

interface RSVPFormProps {
  event: any
  onSuccess?: () => void
}

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
      // Call API to create/update RSVP
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

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-2xl font-bold text-foreground">RSVP Now</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <p className="text-sm text-muted-foreground">
            You are logged in as <strong>{event.organizerName || 'Attendee'}</strong>
          </p>

          {/* RSVP Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Response</FormLabel>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted">
                        <RadioGroupItem value="going" id="going" />
                        <Label htmlFor="going" className="flex-1 cursor-pointer font-medium">
                          <span className="inline-block h-2 w-2 rounded-full mr-2 bg-green-500" />
                          I'm Going
                        </Label>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted">
                        <RadioGroupItem value="maybe" id="maybe" />
                        <Label htmlFor="maybe" className="flex-1 cursor-pointer font-medium">
                          <span className="inline-block h-2 w-2 rounded-full mr-2 bg-blue-500" />
                          Maybe
                        </Label>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted">
                        <RadioGroupItem value="not_going" id="not_going" />
                        <Label htmlFor="not_going" className="flex-1 cursor-pointer font-medium">
                          <span className="inline-block h-2 w-2 rounded-full mr-2 bg-red-500" />
                          Not Going
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
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
                <FormLabel>Plus Ones</FormLabel>
                <FormControl>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <SelectTrigger>
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
            <div className="rounded-lg bg-green-500/10 p-4 text-sm text-green-600">
              RSVP submitted successfully! Check your email for a confirmation and ticket.
            </div>
          )}

          {submitStatus === 'waitlisted' && (
            <div className="rounded-lg bg-blue-500/10 p-4 text-sm text-blue-600">
              You've been added to the waitlist. We'll notify you if a spot becomes available.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-600">
              There was an error submitting your RSVP. Please try again or check your internet connection.
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting ? 'Submitting...' : 'Submit RSVP'}
          </Button>
        </form>
      </Form>
    </Card>
  )
}
