import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';
import { parseRequestBody } from '@/lib/api/middleware/validation';
import { updateEventSchema } from '@/lib/api/utils/validators';
import { requireAuth } from '@/lib/api/middleware/auth';
import { requireRole } from '@/lib/api/middleware/rbac';
import { getEventById, updateEvent, deleteEvent } from '@/lib/api/services/event.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const event = await getEventById(eventId);
    return successResponse(event, 'Event retrieved successfully');
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    requireRole(auth, 'organizer');

    const { eventId } = await params;
    const body = await parseRequestBody(request, updateEventSchema);

    const event = await updateEvent(eventId, auth.userId, body as Record<string, any>);
    return successResponse(event, 'Event updated successfully');
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    requireRole(auth, 'organizer');

    const { eventId } = await params;
    await deleteEvent(eventId, auth.userId);

    return successResponse(null, 'Event deleted successfully');
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
