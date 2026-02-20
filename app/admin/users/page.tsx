'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Users, Search, Shield, MoreVertical, Mail, Calendar, Eye, UserCog } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

type UserRole = 'attendee' | 'organizer' | 'admin'

type AdminUser = {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'active'
  joinedAt: string
  events: number
}

const roleBadge: Record<UserRole, string> = {
  attendee: 'bg-primary/10 text-primary border-primary/20',
  organizer: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  admin: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
}

const statusBadge: Record<'active', string> = {
  active: 'bg-emerald-500/10 text-emerald-600',
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = useMemo(() => createClient(), [])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [roleUpdatingUserId, setRoleUpdatingUserId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/users', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to fetch admin users')
      }

      const data = await response.json()
      setUsers(data.data?.users || [])
    } catch (error) {
      console.error('Failed to fetch admin users', error)
      toast({
        title: 'Failed to load users',
        description: 'Please refresh and try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    const channel = supabase
      .channel('admin-users-profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          void fetchUsers()
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [fetchUsers, supabase])

  const cycleRole = (role: UserRole): UserRole => {
    if (role === 'attendee') return 'organizer'
    if (role === 'organizer') return 'admin'
    return 'attendee'
  }

  const handleViewProfile = (user: AdminUser) => {
    router.push(`/profile?user=${user.id}`)
  }

  const handleChangeRole = async (user: AdminUser) => {
    try {
      const nextRole = cycleRole(user.role)
      setRoleUpdatingUserId(user.id)
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role: nextRole }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.error?.message || 'Failed to update role')
      }

      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u)))
      toast({
        title: 'Role updated',
        description: `${user.name} is now ${nextRole}.`,
      })
    } catch (error: any) {
      console.error('Role update failed', error)
      toast({
        title: 'Role update failed',
        description: error?.message || 'Could not update role.',
        variant: 'destructive',
      })
    } finally {
      setRoleUpdatingUserId(null)
    }
  }

  const handleSendEmail = (user: AdminUser) => {
    const subject = encodeURIComponent('EventEase Admin Message')
    const body = encodeURIComponent(`Hi ${user.name},\n\n`)
    window.location.href = `mailto:${user.email}?subject=${subject}&body=${body}`
    toast({
      title: 'Opening email client',
      description: `Composing email to ${user.email}`,
    })
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">User Management</h1>
            </div>
            <p className="text-muted-foreground">Manage users, roles, and permissions</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            {users.length} total users
          </div>
        </div>

        <Card className="border-border/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-xl pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full rounded-xl sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="attendee">Attendees</SelectItem>
                <SelectItem value="organizer">Organizers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="overflow-hidden border-border/60">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Loading users...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Role
                    </th>
                    <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                      Status
                    </th>
                    <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleBadge[user.role]}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="hidden px-6 py-4 sm:table-cell">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge[user.status]}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="hidden px-6 py-4 md:table-cell">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.joinedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2" onSelect={() => handleViewProfile(user)}>
                              <Eye className="h-3.5 w-3.5" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              disabled={roleUpdatingUserId === user.id}
                              onSelect={() => {
                                if (roleUpdatingUserId) return
                                void handleChangeRole(user)
                              }}
                            >
                              <UserCog className="h-3.5 w-3.5" /> Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onSelect={() => handleSendEmail(user)}>
                              <Mail className="h-3.5 w-3.5" /> Send Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {!isLoading && filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No users found matching your criteria</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
