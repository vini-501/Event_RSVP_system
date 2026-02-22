import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api/middleware/auth'
import { requireRole } from '@/lib/api/middleware/rbac'
import { successResponse, errorResponse } from '@/lib/api/utils/formatters'
import { handleApiError } from '@/lib/api/utils/errors'

// PATCH — admin approves or rejects a role request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const auth = await requireAuth(request)
    requireRole(auth, 'admin')

    const { requestId } = await params
    const body = await request.json()
    const { action, admin_note } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return errorResponse(
        'INVALID_ACTION',
        'Action must be "approve" or "reject".',
        400
      )
    }

    const supabase = await createAdminClient()

    // Fetch the request
    const { data: roleRequest, error: fetchError } = await supabase
      .from('role_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchError || !roleRequest) {
      return errorResponse('NOT_FOUND', 'Role request not found.', 404)
    }

    if (roleRequest.status !== 'pending') {
      return errorResponse(
        'ALREADY_PROCESSED',
        `This request has already been ${roleRequest.status}.`,
        400
      )
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    // Update the role request
    const { error: updateError } = await supabase
      .from('role_requests')
      .update({
        status: newStatus,
        admin_note: admin_note || null,
        reviewed_by: auth.userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)

    if (updateError) throw updateError

    // If approved, upgrade the user's role in profiles
    if (action === 'approve') {
      const { error: roleError } = await supabase
        .from('profiles')
        .update({
          role: roleRequest.requested_role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', roleRequest.user_id)

      if (roleError) throw roleError
    }

    // Create a notification for the user
    const notificationContent =
      action === 'approve'
        ? 'Your request to become an organiser has been approved! 🎉 You can now create and manage events.'
        : `Your organiser request was not approved.${admin_note ? ` Reason: ${admin_note}` : ''}`

    await supabase.from('notifications').insert({
      user_id: roleRequest.user_id,
      type: 'event_update', // reuse existing type
      channel: 'email',
      status: 'pending',
      recipient: roleRequest.user_id,
      subject: action === 'approve' ? 'Organiser Request Approved' : 'Organiser Request Update',
      content: notificationContent,
    })

    return successResponse(
      { id: requestId, status: newStatus },
      `Role request ${newStatus} successfully`
    )
  } catch (error) {
    const { status, body } = handleApiError(error)
    return errorResponse(body.error.code, body.error.message, status, body.error.details)
  }
}
