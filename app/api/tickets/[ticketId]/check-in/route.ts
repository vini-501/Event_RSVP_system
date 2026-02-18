import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';
import { requireAuth } from '@/lib/api/middleware/auth';
import { checkInTicket, getTicketById, checkInByQRCode, getEventCheckInStats } from '@/lib/api/services/ticket.service';
import { getEventById } from '@/lib/api/services/event.service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { ticketId } = await params;
    const body = await request.json();

    // Get ticket and verify event organizer
    const ticket = await getTicketById(ticketId);
    const event = await getEventById(ticket.event_id);

    if (event.organizer_id !== auth.userId && auth.role !== 'admin') {
      throw new Error('Not authorized to check in attendees');
    }

    const checkedInTicket = await checkInTicket(ticketId);
    const stats = await getEventCheckInStats(ticket.event_id);

    return successResponse(
      { ticket: checkedInTicket, stats },
      'Attendee checked in successfully'
    );
  } catch (error) {
    const { status, body } = handleApiError(error);
    return errorResponse(
      body.error.code,
      body.error.message,
      status,
      body.error.details
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { ticketId } = await params;
    const body = await request.json();

    const { qrCode } = body;

    if (!qrCode) {
      return errorResponse('MISSING_QR_CODE', 'QR code is required', 400);
    }

    const result = await checkInByQRCode(qrCode);

    if (!result.success) {
      return errorResponse('CHECKIN_FAILED', result.message || result.error || 'Failed to check in', 400, { error: result.error });
    }

    const stats = await getEventCheckInStats(result.ticket!.event_id);

    return successResponse(
      { ticket: result.ticket, stats },
      'Checked in successfully'
    );
  } catch (error) {
    const { status, body } = handleApiError(error);
    return errorResponse(
      body.error.code,
      body.error.message,
      status,
      body.error.details
    );
  }
}
