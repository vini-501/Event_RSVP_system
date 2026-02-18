import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError } from '@/lib/api/utils/errors';
import { parseRequestBody, validateQueryParam } from '@/lib/api/middleware/validation';
import { createEventSchema } from '@/lib/api/utils/validators';
import { requireAuth } from '@/lib/api/middleware/auth';
import { requireRole } from '@/lib/api/middleware/rbac';
import { getEvents, createEvent } from '@/lib/api/services/event.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category') || undefined;
    const location = searchParams.get('location') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // 1. Get raw events
    const result = await getEvents({
      category,
      location,
      page,
      limit,
    });

    const events = result.events as any[];
    const eventIds = events.map(e => e.id);

    // 2. Get attendee counts for these events (status='going', not waitlisted)
    // We'll do a raw count query for all these IDs
    // Since we can't easily do a group-by count via the service, we'll use a direct client here
    const { createClient } = require('@/lib/supabase/server');
    const supabase = await createClient();
    
    // Fetch counts - simple approach: get all valid RSVPs for these events and count in memory
    // For production with thousands of RSVPs, use rpc or a view. For now this is fine.
    const { data: rsvps } = await supabase
      .from('rsvps')
      .select('event_id, plus_one_count')
      .in('event_id', eventIds)
      .eq('status', 'going')
      .eq('is_waitlisted', false);

    const attendeeCounts: Record<string, number> = {};
    (rsvps || []).forEach((r: any) => {
      attendeeCounts[r.event_id] = (attendeeCounts[r.event_id] || 0) + 1 + (r.plus_one_count || 0);
    });

    // 3. Map to frontend Event interface (camelCase)
    const mappedEvents = events.map(e => ({
      id: e.id,
      name: e.name,
      description: e.description,
      image: e.image_url, // map image_url -> image
      category: e.category,
      startDate: e.start_date, // map start_date -> startDate
      endDate: e.end_date, // map end_date -> endDate
      location: e.location,
      address: e.location, // simplified mapping
      capacity: e.capacity,
      currentAttendees: attendeeCounts[e.id] || 0, // inject count
      price: e.price,
      status: e.status,
      organizerId: e.organizer_id,
      organizer: e.profiles, // mapped automatically if structure matches User
      tags: e.tags,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    }));

    return successResponse({
      events: mappedEvents,
      total: result.total,
      page: result.page,
      limit: result.limit
    }, 'Events retrieved successfully');
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

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    requireRole(auth, 'organizer');

    const body = await parseRequestBody(request, createEventSchema);

    const rawEvent = await createEvent(auth.userId, {
      title: body.title,
      description: body.description,
      category: body.category,
      location: body.location,
      capacity: body.capacity,
      startDateTime: body.startDateTime,
      endDateTime: body.endDateTime,
      imageUrl: body.imageUrl,
      rsvpDeadline: body.rsvpDeadline,
      tags: body.tags,
      price: body.price,
    });

    // Map to camelCase for frontend
    const event = {
      id: rawEvent.id,
      name: rawEvent.name,
      description: rawEvent.description,
      image: rawEvent.image_url,
      category: rawEvent.category,
      startDate: rawEvent.start_date,
      endDate: rawEvent.end_date,
      location: rawEvent.location,
      capacity: rawEvent.capacity,
      currentAttendees: 0,
      price: rawEvent.price,
      status: rawEvent.status,
      organizerId: rawEvent.organizer_id,
      tags: rawEvent.tags,
      createdAt: rawEvent.created_at,
      updatedAt: rawEvent.updated_at,
    };

    return successResponse(event, 'Event created successfully', 201);
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
