import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';
import { parseRequestBody } from '@/lib/api/middleware/validation';
import { createRsvpSchema } from '@/lib/api/utils/validators';
import { requireAuth } from '@/lib/api/middleware/auth';
import { getUserRsvps, createRsvp } from '@/lib/api/services/rsvp.service';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { searchParams } = new URL(request.url);

    const eventId = searchParams.get('eventId');
    let rsvps = await getUserRsvps(auth.userId);

    if (eventId) {
      rsvps = rsvps.filter((r: any) => r.event_id === eventId);
    }

    return successResponse(
      { rsvps, total: rsvps.length },
      'RSVPs retrieved successfully'
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
    const body = await parseRequestBody(request, createRsvpSchema);

    // Create RSVP
    const rsvp = await createRsvp(auth.userId, body.eventId, {
      status: body.status || 'going',
      plusOneCount: body.plusOneCount,
      dietaryPreferences: body.dietaryPreferences,
    });

    return successResponse(
      { rsvp },
      'RSVP submitted and pending admin approval',
      201
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
