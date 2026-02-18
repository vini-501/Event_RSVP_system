import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';
import { requireAuth } from '@/lib/api/middleware/auth';
import { getEventAttendees, getEventById } from '@/lib/api/services/event.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { eventId } = await params;

    // Verify event exists and user has permission to view attendees
    const event = await getEventById(eventId);
    if (event.organizer_id !== auth.userId && auth.role !== 'admin') {
      throw new Error('Not authorized to view attendees');
    }

    const result = await getEventAttendees(eventId);
    return successResponse(result, 'Attendees retrieved successfully');
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
