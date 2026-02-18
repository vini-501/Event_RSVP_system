'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EVENT_CATEGORIES } from '@/lib/constants'
import { ArrowLeft, CalendarPlus } from 'lucide-react'

export default function CreateEventPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'conference' as string,
    startDate: '',
    endDate: '',
    location: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    capacity: '',
    price: '',
    tags: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Replace with actual Supabase insert
    await new Promise((resolve) => setTimeout(resolve, 1000))

    alert('Event created successfully! (Mock — connect to Supabase for real persistence)')
    setIsSubmitting(false)
    router.push('/organizer/events')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/organizer/events">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Create Event</h1>
            <p className="text-muted-foreground mt-1">Fill in the details below to create a new event</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Basic Information</CardTitle>
              <CardDescription>The essentials about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Event Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. React Summit 2025"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Tell attendees what to expect..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Date &amp; Time</CardTitle>
              <CardDescription>When will your event take place?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="startDate" className="text-sm font-medium">
                    Start Date <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="endDate" className="text-sm font-medium">
                    End Date <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Location</CardTitle>
              <CardDescription>Where will your event be held?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">
                  Venue Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g. Convention Center"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Street Address
                </label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main St"
                  value={formData.address}
                  onChange={handleChange}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">City</label>
                  <Input id="city" name="city" value={formData.city} onChange={handleChange} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-medium">State</label>
                  <Input id="state" name="state" value={formData.state} onChange={handleChange} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="zipCode" className="text-sm font-medium">Zip Code</label>
                  <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} className="rounded-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capacity & Pricing */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Capacity &amp; Pricing</CardTitle>
              <CardDescription>Set limits and ticket pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="capacity" className="text-sm font-medium">
                    Capacity <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    placeholder="e.g. 200"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium">
                    Price ($) <span className="text-muted-foreground text-xs">(leave blank for free)</span>
                  </label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Tags</CardTitle>
              <CardDescription>Help attendees discover your event</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-medium">
                  Tags <span className="text-muted-foreground text-xs">(comma-separated)</span>
                </label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="e.g. React, JavaScript, Frontend"
                  value={formData.tags}
                  onChange={handleChange}
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link href="/organizer/events">
              <Button type="button" variant="outline" className="rounded-xl">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl shadow-md shadow-primary/25">
              {isSubmitting ? (
                'Creating...'
              ) : (
                <>
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Create Event
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
