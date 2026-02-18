import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';
import { parseRequestBody, validateQueryParam } from '@/lib/api/middleware/validation';
import { createEventSchema } from '@/lib/api/utils/validators';
import { requireAuth } from '@/lib/api/middleware/auth';
import { requireRole } from '@/lib/api/middleware/rbac';
import { getEvents, createEvent } from '@/lib/api/services/event.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category') || undefined;
    const location = searchParams.get('location') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const result = await getEvents({
      category,
      location,
      page,
      limit,
    });

    return successResponse(result, 'Events retrieved successfully');
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
    requireRole(auth, 'organizer');

    const body = await parseRequestBody(request, createEventSchema);

    const event = await createEvent(auth.userId, {
      title: body.title,
      description: body.description,
      category: body.category,
      location: body.location,
      capacity: body.capacity,
      startDateTime: body.startDateTime,
      endDateTime: body.endDateTime,
      imageUrl: body.imageUrl,
      rsvpDeadline: body.rsvpDeadline,
    });

    return successResponse(event, 'Event created successfully', 201);
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
