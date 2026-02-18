import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';

export async function POST() {
  try {
    const supabase = await createClient();

    // Supabase handles token refresh automatically via the middleware
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return errorResponse('AUTH_ERROR', 'Not authenticated', 401);
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return successResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          role: profile?.role || 'attendee',
        },
      },
      'Session valid',
      200
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
