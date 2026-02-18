import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';
import { requireAuth } from '@/lib/api/middleware/auth';
import { getQrCodeData, getTicketDetails } from '@/lib/api/services/ticket.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { ticketId } = await params;

    const ticketDetails = await getTicketDetails(ticketId);

    // Verify user owns this ticket
    if (ticketDetails.user_id !== auth.userId && auth.role !== 'admin') {
      return errorResponse('FORBIDDEN', 'Not authorized to access this ticket', 403);
    }

    const qrData = await getQrCodeData(ticketId);

    return successResponse(
      {
        ticketId,
        qrCode: ticketDetails.qr_code,
        qrData: qrData,
        ticketDetails: {
          id: ticketDetails.id,
          eventId: ticketDetails.event_id,
          userId: ticketDetails.user_id,
          checkInStatus: ticketDetails.check_in_status,
          checkInTime: ticketDetails.check_in_time,
        },
      },
      'QR code retrieved successfully'
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
