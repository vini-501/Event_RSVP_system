import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';
import { requireAuth } from '@/lib/api/middleware/auth';
import { getUserTickets, generateTicket } from '@/lib/api/services/ticket.service';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { searchParams } = new URL(request.url);

    const eventId = searchParams.get('eventId');
    const tickets = await getUserTickets(auth.userId);

    const filtered = eventId
      ? tickets.filter((t: any) => t.event_id === eventId)
      : tickets;

    return successResponse(
      { tickets: filtered, total: filtered.length },
      'Tickets retrieved successfully'
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

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json();

    const { rsvpId } = body;

    if (!rsvpId) {
      return errorResponse('MISSING_RSVP_ID', 'RSVP ID is required', 400);
    }

    const ticket = await generateTicket(rsvpId);

    return successResponse(ticket, 'Ticket generated successfully', 201);
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
