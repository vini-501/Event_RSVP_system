import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';
import { requireAuth } from '@/lib/api/middleware/auth';
import { getUserNotifications, sendRsvpConfirmation, sendEventReminder } from '@/lib/api/services/notification.service';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const allNotifications = await getUserNotifications(auth.userId);
    const paginated = allNotifications.slice(offset, offset + limit);

    return successResponse(
      { notifications: paginated, total: allNotifications.length, limit, offset },
      'Notifications retrieved successfully'
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

    const { action, rsvpId, eventId } = body;

    if (action === 'send_rsvp_confirmation' && rsvpId) {
      const notification = await sendRsvpConfirmation(rsvpId);
      return successResponse(notification, 'RSVP confirmation sent');
    }

    if (action === 'send_event_reminder' && eventId) {
      const notifications = await sendEventReminder(eventId);
      return successResponse({ count: notifications.length }, 'Event reminders sent');
    }

    return errorResponse('INVALID_ACTION', 'Invalid notification action', 400);
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
