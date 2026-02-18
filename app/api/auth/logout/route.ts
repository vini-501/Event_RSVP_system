import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return successResponse(null, 'Logout successful', 200);
  } catch {
    return errorResponse('AUTH_ERROR', 'Logout failed', 500);
  }
}
