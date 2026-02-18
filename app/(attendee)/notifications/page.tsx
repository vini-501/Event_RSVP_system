'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Bell, Mail, Trash2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'

type NotificationType = 'rsvp_confirmation' | 'event_reminder' | 'event_update' | 'event_cancellation'

const notificationTypeLabels: Record<NotificationType, string> = {
  rsvp_confirmation: 'RSVP Confirmation',
  event_reminder: 'Event Reminder',
  event_update: 'Event Update',
  event_cancellation: 'Event Cancellation',
}

const notificationTypeColors: Record<NotificationType, string> = {
  rsvp_confirmation: 'bg-green-100 text-green-800',
  event_reminder: 'bg-blue-100 text-blue-800',
  event_update: 'bg-amber-100 text-amber-800',
  event_cancellation: 'bg-red-100 text-red-800',
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return

      try {
        const response = await fetch('/api/notifications?limit=50', {
          headers: { Authorization: `Bearer ${user.id}` },
        })

        if (!response.ok) throw new Error('Failed to fetch notifications')

        const data = await response.json()
        setNotifications(data.data?.notifications || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notifications')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [user?.id])

  const sentNotifications = notifications.filter(n => n.status === 'sent')
  const failedNotifications = notifications.filter(n => n.status === 'failed')

  const handleDelete = (notificationId: string) => {
    setNotifications(notifications.filter(n => n.id !== notificationId))
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Loading your notifications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Notifications</h1>
        </div>
        <Card className="p-6 text-center border-red-200 bg-red-50">
          <p className="text-red-600">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated with event reminders and updates
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Notifications</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {notifications.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Delivered</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {sentNotifications.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Failed</p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            {failedNotifications.length}
          </p>
        </Card>
      </div>

      {/* Notifications Tabs */}
      {notifications.length > 0 ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="sent">Delivered ({sentNotifications.length})</TabsTrigger>
            {failedNotifications.length > 0 && (
              <TabsTrigger value="failed">Failed ({failedNotifications.length})</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {notifications.map(notification => (
              <NotificationCard 
                key={notification.id} 
                notification={notification}
                onDelete={() => handleDelete(notification.id)}
              />
            ))}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentNotifications.length > 0 ? (
              sentNotifications.map(notification => (
                <NotificationCard 
                  key={notification.id} 
                  notification={notification}
                  onDelete={() => handleDelete(notification.id)}
                />
              ))
            ) : (
              <Card className="p-12 text-center">
                <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No delivered notifications</p>
              </Card>
            )}
          </TabsContent>

          {failedNotifications.length > 0 && (
            <TabsContent value="failed" className="space-y-4">
              {failedNotifications.map(notification => (
                <NotificationCard 
                  key={notification.id} 
                  notification={notification}
                  onDelete={() => handleDelete(notification.id)}
                  isFailed
                />
              ))}
            </TabsContent>
          )}
        </Tabs>
      ) : (
        <Card className="p-12 text-center">
          <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No Notifications Yet
          </h3>
          <p className="text-muted-foreground">
            Event reminders and updates will appear here
          </p>
        </Card>
      )}
    </div>
  )
}

function NotificationCard({ 
  notification, 
  isFailed = false,
  onDelete 
}: { 
  notification: any
  isFailed?: boolean
  onDelete: () => void
}) {
  const typeLabel = notificationTypeLabels[notification.type as NotificationType] || notification.type
  const typeColor = notificationTypeColors[notification.type as NotificationType] || 'bg-gray-100 text-gray-800'

  return (
    <Card className={`overflow-hidden transition-all ${isFailed ? 'border-red-200 bg-red-50' : 'hover:shadow-lg'}`}>
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
        {/* Notification Info */}
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              {notification.subject || typeLabel}
            </h3>
            <Badge className={typeColor}>
              {typeLabel}
            </Badge>
            {isFailed && <Badge className="bg-red-100 text-red-800">Failed</Badge>}
          </div>

          <p className="mb-3 text-muted-foreground">
            {notification.content}
          </p>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              Channel: <span className="font-medium capitalize">{notification.channel}</span>
            </div>
            <div className="flex items-center gap-1">
              Recipient: <span className="font-medium">{notification.recipient}</span>
            </div>
            {notification.sentAt && (
              <div className="flex items-center gap-1">
                Sent: <span className="font-medium">{format(new Date(notification.sentAt), 'MMM d, yyyy h:mm a')}</span>
              </div>
            )}
            {isFailed && notification.failureReason && (
              <div className="flex items-center gap-1 text-red-600">
                Error: <span className="font-medium">{notification.failureReason}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onDelete}
          className="gap-2 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </Card>
  )
}
