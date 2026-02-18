import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';
import { requireAuth } from '@/lib/api/middleware/auth';
import { requireRole } from '@/lib/api/middleware/rbac';
import {
  getUserNotifications,
  sendRsvpConfirmation,
  sendEventReminder,
  sendEventUpdate,
  sendEventCancellation,
  processScheduledReminders,
} from '@/lib/api/services/notification.service';

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

    const { action, rsvpId, eventId, content, channels } = body;

    if (action === 'send_rsvp_confirmation' && rsvpId) {
      const notification = await sendRsvpConfirmation(rsvpId, channels);
      return successResponse(notification, 'RSVP confirmation sent');
    }

    if (action === 'send_event_reminder' && eventId) {
      requireRole(auth, 'organizer');
      const notifications = await sendEventReminder(eventId, channels);
      return successResponse({ count: notifications.length }, 'Event reminders sent');
    }

    if (action === 'send_event_update' && eventId) {
      requireRole(auth, 'organizer');
      const notifications = await sendEventUpdate(eventId, content || '', channels);
      return successResponse({ count: notifications.length }, 'Event update notifications sent');
    }

    if (action === 'send_event_cancellation' && eventId) {
      requireRole(auth, 'organizer');
      const notifications = await sendEventCancellation(eventId, channels);
      return successResponse({ count: notifications.length }, 'Event cancellation notifications sent');
    }

    if (action === 'process_scheduled_reminders') {
      requireRole(auth, 'admin');
      const results = await processScheduledReminders();
      return successResponse({ results }, `Processed reminders for ${results.length} events`);
    }

    return errorResponse('INVALID_ACTION', 'Invalid notification action. Valid actions: send_rsvp_confirmation, send_event_reminder, send_event_update, send_event_cancellation, process_scheduled_reminders', 400);
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
