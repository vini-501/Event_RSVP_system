import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/utils/formatters'
import { handleApiError } from '@/lib/api/utils/errors'
import { requireAuth } from '@/lib/api/middleware/auth'
import { checkInByQRCode, getEventCheckInStats } from '@/lib/api/services/ticket.service'
import { getEventById } from '@/lib/api/services/event.service'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const body = await request.json()

    const { qrCode, eventId } = body

    if (!qrCode) {
      return errorResponse('MISSING_QR_CODE', 'QR code is required', 400)
    }

    if (!eventId) {
      return errorResponse('MISSING_EVENT_ID', 'Event ID is required', 400)
    }

    // Verify organizer permissions
    const event = await getEventById(eventId)
    if (event.organizer_id !== auth.userId && auth.role !== 'admin') {
      return errorResponse('FORBIDDEN', 'Not authorized to check in attendees', 403)
    }

    // Check in by QR code
    const result = await checkInByQRCode(qrCode)

    if (!result.success) {
      return errorResponse(
        'CHECKIN_FAILED',
        result.message || result.error || 'Failed to check in',
        400,
        { error: result.error }
      )
    }

    // Verify ticket belongs to this event
    if (result.ticket?.event_id !== eventId) {
      return errorResponse('INVALID_TICKET', 'Ticket does not belong to this event', 400)
    }

    // Get updated stats
    const stats = await getEventCheckInStats(eventId)

    return successResponse(
      { ticket: result.ticket, stats },
      'Checked in successfully'
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
