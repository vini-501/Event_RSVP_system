import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';
import { parseRequestBody } from '@/lib/api/middleware/validation';
import { loginSchema } from '@/lib/api/utils/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody(request, loginSchema);
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      return errorResponse('AUTH_ERROR', 'Invalid email or password', 401);
    }

    if (!data.user) {
      return errorResponse('AUTH_ERROR', 'Login failed', 500);
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return successResponse(
      {
        user: {
          id: data.user.id,
          email: data.user.email,
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          role: profile?.role || 'attendee',
        },
        session: data.session,
      },
      'Login successful',
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
