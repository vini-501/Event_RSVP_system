import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';
import { requireAuth } from '@/lib/api/middleware/auth';
import { requireRole } from '@/lib/api/middleware/rbac';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    requireRole(auth, 'organizer');

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return successResponse(
      { events: data || [], total: (data || []).length },
      'Organizer events retrieved successfully'
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
