import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';
import { parseRequestBody } from '@/lib/api/middleware/validation';
import { signupSchema } from '@/lib/api/utils/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody(request, signupSchema);
    const supabase = await createClient();

    const firstName = body.firstName || '';
    const lastName = body.lastName || '';

    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: body.role || 'attendee',
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return errorResponse('CONFLICT', 'User with this email already exists', 409);
      }
      return errorResponse('AUTH_ERROR', error.message, 400);
    }

    if (!data.user) {
      return errorResponse('AUTH_ERROR', 'Signup failed', 500);
    }

    // Fetch the profile that was auto-created by the trigger
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
          firstName: profile?.first_name || firstName,
          lastName: profile?.last_name || lastName,
          role: profile?.role || body.role || 'attendee',
        },
        session: data.session,
      },
      'Signup successful',
      201
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
