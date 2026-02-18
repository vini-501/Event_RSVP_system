import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AuthError } from '../utils/errors';

export interface AuthContext {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export async function extractAuth(request: NextRequest): Promise<AuthContext> {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthError('Not authenticated');
  }

  // Fetch profile for role and name info
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, role')
    .eq('id', user.id)
    .single();

  return {
    userId: user.id,
    email: user.email || '',
    role: profile?.role || user.user_metadata?.role || 'attendee',
    firstName: profile?.first_name || user.user_metadata?.first_name || '',
    lastName: profile?.last_name || user.user_metadata?.last_name || '',
  };
}

export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  return extractAuth(request);
}
