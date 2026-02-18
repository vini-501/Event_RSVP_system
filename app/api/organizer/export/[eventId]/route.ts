import { NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api/utils/errors';
import { requireAuth } from '@/lib/api/middleware/auth';
import { exportAttendeeList } from '@/lib/api/services/organizer.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { eventId } = await params;

    const csv = await exportAttendeeList(eventId, auth.userId);

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="attendees-${eventId}-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    const { status, body } = handleApiError(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: body.error.code,
          message: body.error.message,
        },
      }),
      {
        status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
