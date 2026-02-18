'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().optional(),
  phone: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>(
    'idle'
  )

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      bio: 'Event enthusiast and community organizer',
      phone: '',
    },
  })

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true)
    setSaveStatus('idle')

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log('Profile updated:', data)
      setSaveStatus('success')

      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Profile Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      {/* Profile Form */}
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled={isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} disabled={isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio Field */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself..."
                      {...field}
                      disabled={isSaving}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Messages */}
            {saveStatus === 'success' && (
              <div className="rounded-lg bg-green-500/10 p-4 text-sm text-green-600">
                Profile updated successfully!
              </div>
            )}

            {saveStatus === 'error' && (
              <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-600">
                Error updating profile. Please try again.
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </Card>

      {/* Password Change Section */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-bold text-foreground">
          Change Password
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Update your password to keep your account secure
        </p>
        <Button variant="outline">Change Password</Button>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-500/5 p-6">
        <h2 className="mb-4 text-lg font-bold text-red-600">Danger Zone</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Delete your account and all associated data. This action cannot be
          undone.
        </p>
        <Button variant="destructive">Delete Account</Button>
      </Card>
    </div>
  )
}
