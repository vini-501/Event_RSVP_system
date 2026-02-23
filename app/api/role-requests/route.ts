import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api/middleware/auth'
import { requireRole } from '@/lib/api/middleware/rbac'
import { successResponse, errorResponse } from '@/lib/api/utils/formatters'
import { handleApiError } from '@/lib/api/utils/errors'

import { rateLimit } from '@/lib/api/middleware/rate-limit'

// POST — attendee submits a role upgrade request
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)

    // Apply rate limiting: 2 requests per 24 hours (very low frequency)
    const rl = await rateLimit(request, {
      limit: 2,
      windowMs: 24 * 60 * 60 * 1000,
      keyPrefix: 'role_request',
    })

    if (rl.isLimited) {
      return errorResponse(
        'TOO_MANY_REQUESTS',
        `You've made too many requests. Please try again in several hours.`,
        429
      )
    }

    // Only attendees can request an upgrade
    if (auth.role !== 'attendee') {
      return errorResponse('ALREADY_UPGRADED', 'You are already an organizer or admin.', 400)
    }

    const body = await request.json().catch(() => ({}))
    const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 500) : null

    const supabase = await createClient()

    // Check for existing pending request
    const { data: existing } = await supabase
      .from('role_requests')
      .select('id, status')
      .eq('user_id', auth.userId)
      .eq('status', 'pending')
      .maybeSingle()

    if (existing) {
      return errorResponse('REQUEST_EXISTS', 'You already have a pending organizer request.', 409)
    }

    // Insert new request
    const { data, error } = await supabase
      .from('role_requests')
      .insert({
        user_id: auth.userId,
        requested_role: 'organizer',
        status: 'pending',
        reason,
      })
      .select('id, status, created_at')
      .single()

    if (error) throw error

    return successResponse(data, 'Organizer request submitted successfully', 201)
  } catch (error) {
    const { status, body } = handleApiError(error)
    return errorResponse(body.error.code, body.error.message, status, body.error.details)
  }
}

// GET — admin lists all role requests, or attendee checks own request status
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') || 'all'

    // If admin, list all requests with pagination
    if (auth.role === 'admin') {
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = (page - 1) * limit

      const adminSupabase = await createAdminClient()

      let query = adminSupabase
        .from('role_requests')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data: requests, error, count } = await query

      if (error) throw error

      // Fetch user profiles for all requesters
      const userIds = [...new Set((requests || []).map((r: any) => r.user_id))]
      let profiles: Record<string, any> = {}

      if (userIds.length > 0) {
        const { data: profileData } = await adminSupabase
          .from('profiles')
          .select('id, email, first_name, last_name')
          .in('id', userIds)

        profiles = (profileData || []).reduce((acc: any, p: any) => {
          acc[p.id] = p
          return acc
        }, {})
      }

      const enrichedRequests = (requests || []).map((r: any) => {
        const profile = profiles[r.user_id]
        return {
          ...r,
          user_name: profile
            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email
            : 'Unknown',
          user_email: profile?.email || '',
        }
      })

      return successResponse(
        {
          requests: enrichedRequests,
          total: count || enrichedRequests.length,
          page,
          limit,
        },
        'Role requests retrieved'
      )
    }

    // Non-admin: return own requests
    const supabase = await createClient()
    const { data: requests, error } = await supabase
      .from('role_requests')
      .select('id, status, reason, admin_note, created_at, updated_at')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return successResponse({ requests: requests || [] }, 'Your role requests')
  } catch (error) {
    const { status, body } = handleApiError(error)
    return errorResponse(body.error.code, body.error.message, status, body.error.details)
  }
}
