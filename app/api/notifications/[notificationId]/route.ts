import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';
import { requireAuth } from '@/lib/api/middleware/auth';
import { NotFoundError } from '@/lib/api/utils/errors';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { notificationId } = await params;
    const supabase = await createClient();

    const { data: notification, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .eq('user_id', auth.userId)
      .single();

    if (error || !notification) {
      throw new NotFoundError('Notification');
    }

    const { data: updated, error: updateError } = await supabase
      .from('notifications')
      .update({ status: 'read', updated_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select()
      .single();

    if (updateError) throw updateError;

    return successResponse(updated, 'Notification marked as read');
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
