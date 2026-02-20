import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api/middleware/auth'
import { requireRole } from '@/lib/api/middleware/rbac'
import { successResponse, errorResponse } from '@/lib/api/utils/formatters'
import { handleApiError } from '@/lib/api/utils/errors'
import { parseRequestBody } from '@/lib/api/middleware/validation'

const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['attendee', 'organizer', 'admin']),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    requireRole(auth, 'admin')

    const supabase = await createAdminClient()

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    const userIds = (profiles || []).map((p: any) => p.id)
    let eventsByOrganizer: Record<string, number> = {}

    if (userIds.length > 0) {
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('organizer_id')
        .in('organizer_id', userIds)

      if (eventsError) throw eventsError

      eventsByOrganizer = (events || []).reduce((acc: Record<string, number>, event: any) => {
        if (!event.organizer_id) return acc
        acc[event.organizer_id] = (acc[event.organizer_id] || 0) + 1
        return acc
      }, {})
    }

    const users = (profiles || []).map((p: any) => {
      const fullName = `${p.first_name || ''} ${p.last_name || ''}`.trim()

      return {
        id: p.id,
        name: fullName || p.email || 'Unknown User',
        email: p.email || '',
        role: p.role || 'attendee',
        status: 'active',
        joinedAt: p.created_at,
        events: eventsByOrganizer[p.id] || 0,
      }
    })

    return successResponse(
      { users, total: users.length },
      'Admin users retrieved successfully'
    )
  } catch (error) {
    const { status, body } = handleApiError(error)
    return errorResponse(
      body.error.code,
      body.error.message,
      status,
      body.error.details
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    requireRole(auth, 'admin')

    const body = await parseRequestBody(request, updateUserRoleSchema)

    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('profiles')
      .update({ role: body.role, updated_at: new Date().toISOString() })
      .eq('id', body.userId)
      .select('id, role')
      .single()

    if (error) throw error

    return successResponse(
      { user: data },
      'User role updated successfully'
    )
  } catch (error) {
    const { status, body } = handleApiError(error)
    return errorResponse(
      body.error.code,
      body.error.message,
      status,
      body.error.details
    )
  }
}
