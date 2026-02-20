import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError, ForbiddenError } from '@/lib/api/utils/errors';
import { parseRequestBody } from '@/lib/api/middleware/validation';
import { updateRsvpSchema } from '@/lib/api/utils/validators';
import { requireAuth } from '@/lib/api/middleware/auth';
import { getRsvpById, updateRsvp, deleteRsvp } from '@/lib/api/services/rsvp.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ rsvpId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { rsvpId } = await params;

    const rsvp = await getRsvpById(rsvpId);

    if (rsvp.user_id !== auth.userId && auth.role !== 'admin') {
      throw new ForbiddenError('Not authorized to view this RSVP');
    }

    return successResponse(rsvp, 'RSVP retrieved successfully');
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
  { params }: { params: Promise<{ rsvpId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { rsvpId } = await params;
    const body = await parseRequestBody(request, updateRsvpSchema);

    const rsvp = await updateRsvp(rsvpId, auth.userId, body);
    return successResponse(rsvp, 'RSVP updated successfully');
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
  { params }: { params: Promise<{ rsvpId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { rsvpId } = await params;

    await deleteRsvp(rsvpId, auth.userId);
    return successResponse(null, 'RSVP deleted successfully');
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
