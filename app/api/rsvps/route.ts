import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';
import { parseRequestBody } from '@/lib/api/middleware/validation';
import { createRsvpSchema } from '@/lib/api/utils/validators';
import { requireAuth } from '@/lib/api/middleware/auth';
import { getUserRsvps, createRsvp } from '@/lib/api/services/rsvp.service';
import { generateTicket } from '@/lib/api/services/ticket.service';
import { sendRsvpConfirmation } from '@/lib/api/services/notification.service';

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

    // Generate ticket if RSVP is confirmed (not waitlisted)
    let ticket = null;
    if (rsvp.status === 'going' && !rsvp.is_waitlisted) {
      ticket = await generateTicket(rsvp.id);
    }

    // Send confirmation notification
    try {
      await sendRsvpConfirmation(rsvp.id);
    } catch (notificationError) {
      console.error('[v0] Failed to send notification:', notificationError);
    }

    return successResponse(
      { rsvp, ticket },
      rsvp.is_waitlisted ? 'RSVP submitted - added to waitlist' : 'RSVP created successfully',
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
