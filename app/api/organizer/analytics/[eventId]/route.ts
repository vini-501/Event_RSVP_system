import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';
import { requireAuth } from '@/lib/api/middleware/auth';
import { requireRole } from '@/lib/api/middleware/rbac';
import { getEventAnalytics } from '@/lib/api/services/organizer.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    requireRole(auth, 'organizer');
    const { eventId } = await params;

    const analytics = await getEventAnalytics(eventId, auth.userId);
    return successResponse(analytics, 'Analytics retrieved successfully');
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
