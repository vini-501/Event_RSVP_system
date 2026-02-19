import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';
import { requireAuth } from '@/lib/api/middleware/auth';
import { getEventRsvps, getEventWaitlist } from '@/lib/api/services/rsvp.service';
import { getEventById } from '@/lib/api/services/event.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { eventId } = await params;

    const event = await getEventById(eventId);
    if (event.organizer_id !== auth.userId && auth.role !== 'admin') {
      throw new Error('Not authorized to view event RSVPs');
    }

    const rsvps = await getEventRsvps(eventId);
    const waitlist = await getEventWaitlist(eventId);

    return successResponse(
      {
        eventId,
        rsvps: rsvps.rsvps,
        breakdown: rsvps.breakdown,
        checkedIn: rsvps.checkedIn,
        total: rsvps.total,
        waitlist,
      },
      'Organizer RSVP data retrieved successfully'
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
