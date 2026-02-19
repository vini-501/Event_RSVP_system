import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/api/middleware/auth';
import { requireRole } from '@/lib/api/middleware/rbac';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    requireRole(auth, 'admin');

    const supabase = await createClient();

    const { data: events, error } = await supabase
      .from('events')
      .select('*, profiles!organizer_id(id, first_name, last_name, email, avatar_url)')
      .order('start_date', { ascending: true });

    if (error) throw error;

    const eventIds = (events || []).map((e: any) => e.id);
    let attendeeCounts: Record<string, number> = {};

    if (eventIds.length > 0) {
      const { data: rsvps, error: rsvpError } = await supabase
        .from('rsvps')
        .select('event_id, plus_one_count')
        .in('event_id', eventIds)
        .eq('status', 'going')
        .eq('is_waitlisted', false);

      if (rsvpError) throw rsvpError;

      attendeeCounts = (rsvps || []).reduce((acc: Record<string, number>, r: any) => {
        acc[r.event_id] = (acc[r.event_id] || 0) + 1 + (r.plus_one_count || 0);
        return acc;
      }, {});
    }

    const mappedEvents = (events || []).map((e: any) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      image: e.image_url,
      category: e.category,
      startDate: e.start_date,
      endDate: e.end_date,
      location: e.location,
      address: e.location,
      capacity: e.capacity,
      currentAttendees: attendeeCounts[e.id] || 0,
      price: e.price,
      status: e.status,
      organizerId: e.organizer_id,
      organizer: e.profiles,
      tags: e.tags,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    }));

    return successResponse(
      { events: mappedEvents, total: mappedEvents.length },
      'Admin events retrieved successfully'
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
