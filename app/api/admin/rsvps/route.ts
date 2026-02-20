import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/api/middleware/auth';
import { requireRole } from '@/lib/api/middleware/rbac';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';

function extractApprovalStatus(customResponses: any): 'pending' | 'approved' | 'rejected' {
  if (customResponses && typeof customResponses === 'object' && !Array.isArray(customResponses)) {
    const status = customResponses.approval_status || customResponses.approvalStatus;
    if (status === 'pending' || status === 'approved' || status === 'rejected') {
      return status;
    }
  }
  return 'approved';
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    requireRole(auth, 'admin');

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('approvalStatus') || 'pending';

    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from('rsvps')
      .select(`
        id,
        event_id,
        user_id,
        status,
        is_waitlisted,
        plus_one_count,
        custom_responses,
        created_at,
        updated_at,
        profiles!user_id(id, first_name, last_name, email),
        events!event_id(id, name, start_date, location)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    let rows = (data || []).map((row: any) => ({
      ...row,
      approval_status: extractApprovalStatus(row.custom_responses),
    }));

    if (filter !== 'all') {
      rows = rows.filter((row: any) => row.approval_status === filter);
    }

    return successResponse(
      { rsvps: rows, total: rows.length },
      'Admin RSVP approvals retrieved successfully'
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
