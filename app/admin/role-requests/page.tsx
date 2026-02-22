'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Rocket, Check, X, Clock, Mail, Calendar, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type RoleRequest = {
  id: string
  user_id: string
  requested_role: string
  status: 'pending' | 'approved' | 'rejected'
  reason: string | null
  admin_note: string | null
  user_name: string
  user_email: string
  created_at: string
  updated_at: string
}

const statusBadge: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
}

export default function AdminRoleRequestsPage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<RoleRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/role-requests?status=${statusFilter}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setRequests(data.data?.requests || [])
    } catch {
      toast({
        title: 'Failed to load requests',
        description: 'Please refresh and try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, toast])

  useEffect(() => {
    void fetchRequests()
  }, [fetchRequests])

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessingId(requestId)
    try {
      const res = await fetch(`/api/role-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({
          title: 'Action failed',
          description: data?.error?.message || 'Could not process request.',
          variant: 'destructive',
        })
        return
      }
      toast({
        title: action === 'approve' ? 'Request approved ✅' : 'Request rejected',
        description:
          action === 'approve'
            ? 'The user has been upgraded to organiser and notified.'
            : 'The user has been notified.',
      })
      // Remove from list or update status
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r))
      )
    } catch {
      toast({
        title: 'Action failed',
        description: 'Something went wrong.',
        variant: 'destructive',
      })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Role Requests</h1>
            </div>
            <p className="text-muted-foreground">Review and manage organiser upgrade requests</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {requests.length} {statusFilter === 'all' ? 'total' : statusFilter} requests
          </div>
        </div>

        {/* Filter */}
        <Card className="border-border/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full rounded-xl sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="rounded-xl" onClick={() => void fetchRequests()}>
              Refresh
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden border-border/60">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
                <p className="text-sm">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center">
                <Rocket className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No {statusFilter !== 'all' ? statusFilter : ''} role requests found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Requested Role
                    </th>
                    <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {requests.map((req) => (
                    <tr key={req.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {req.user_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{req.user_name}</p>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {req.user_email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                          {req.requested_role}
                        </span>
                      </td>
                      <td className="hidden px-6 py-4 sm:table-cell">
                        <p className="line-clamp-2 text-sm text-muted-foreground max-w-[200px]">
                          {req.reason || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadge[req.status]}`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="hidden px-6 py-4 md:table-cell">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(req.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              className="h-8 gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                              disabled={processingId === req.id}
                              onClick={() => void handleAction(req.id, 'approve')}
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              disabled={processingId === req.id}
                              onClick={() => void handleAction(req.id, 'reject')}
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
