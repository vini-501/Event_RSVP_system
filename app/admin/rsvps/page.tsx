'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, CheckCircle2, XCircle, Calendar, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type AdminRsvp = {
  id: string
  status: 'going' | 'maybe' | 'not_going'
  plus_one_count: number
  approval_status: 'pending' | 'approved' | 'rejected'
  created_at: string
  profiles?: {
    first_name?: string
    last_name?: string
    email?: string
  }
  events?: {
    name?: string
    start_date?: string
    location?: string
  }
}

export default function AdminRsvpsPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [rsvps, setRsvps] = useState<AdminRsvp[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchRsvps = async (filter: 'all' | 'pending' | 'approved' | 'rejected') => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/rsvps?approvalStatus=${filter}`, { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to load RSVP approvals')
      const data = await response.json()
      setRsvps(data?.data?.rsvps || [])
    } catch (error) {
      console.error('Failed to load RSVP approvals', error)
      toast({
        title: 'Failed to load RSVP approvals',
        variant: 'destructive',
      })
      setRsvps([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchRsvps(statusFilter)
  }, [statusFilter])

  const handleApproval = async (rsvpId: string, action: 'approve' | 'reject') => {
    try {
      setUpdatingId(rsvpId)
      const response = await fetch(`/api/admin/rsvps/${rsvpId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.error?.message || `Failed to ${action} RSVP`)
      }

      toast({
        title: action === 'approve' ? 'RSVP approved' : 'RSVP rejected',
      })

      await fetchRsvps(statusFilter)
    } catch (error: any) {
      toast({
        title: action === 'approve' ? 'Approve failed' : 'Reject failed',
        description: error?.message || 'Try again.',
        variant: 'destructive',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = rsvps.filter((row) => {
    const attendee = `${row.profiles?.first_name || ''} ${row.profiles?.last_name || ''}`.trim().toLowerCase()
    const email = (row.profiles?.email || '').toLowerCase()
    const eventName = (row.events?.name || '').toLowerCase()
    const q = searchTerm.toLowerCase()
    return attendee.includes(q) || email.includes(q) || eventName.includes(q)
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">RSVP Approvals</h1>
          <p className="text-muted-foreground">Approve or reject attendee RSVP requests.</p>
        </div>

        <Card className="border-border/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search attendee/email/event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-xl pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-full rounded-xl sm:w-[220px]">
                <SelectValue placeholder="Filter by approval status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="overflow-hidden border-border/60">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Loading RSVP approvals...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attendee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">RSVP</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Approval</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((row) => {
                    const attendeeName = `${row.profiles?.first_name || ''} ${row.profiles?.last_name || ''}`.trim() || 'Unknown attendee'
                    const approvalVariant =
                      row.approval_status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : row.approval_status === 'rejected'
                          ? 'bg-red-500/10 text-red-600'
                          : 'bg-amber-500/10 text-amber-600'

                    return (
                      <tr key={row.id} className="hover:bg-muted/20">
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{attendeeName}</p>
                            <p className="text-xs text-muted-foreground">{row.profiles?.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{row.events?.name}</p>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {row.events?.start_date ? new Date(row.events.start_date).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <Badge variant="outline" className="capitalize">
                              {row.status.replace('_', ' ')}
                            </Badge>
                            <p className="text-xs text-muted-foreground">+{row.plus_one_count} guests</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${approvalVariant}`}>
                            {row.approval_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              disabled={updatingId === row.id || row.approval_status === 'approved'}
                              onClick={() => void handleApproval(row.id, 'approve')}
                            >
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              disabled={updatingId === row.id || row.approval_status === 'rejected'}
                              onClick={() => void handleApproval(row.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
          {!isLoading && filtered.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <User className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              No RSVP requests found for the selected filter.
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
