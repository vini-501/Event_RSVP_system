import { createClient } from '@/lib/supabase/server';
import { NotFoundError } from '../utils/errors';

/**
 * Get events with filtering and pagination
 */
export async function getEvents(
  filters?: {
    category?: string;
    location?: string;
    page?: number;
    limit?: number;
  }
) {
  const supabase = await createClient();
  let query = supabase
    .from('events')
    .select('*, profiles!organizer_id(id, first_name, last_name, email, avatar_url)', { count: 'exact' })
    .eq('status', 'published');

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || 12;
  const start = (page - 1) * limit;

  query = query.range(start, start + limit - 1).order('start_date', { ascending: true });

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    events: data || [],
    total: count || 0,
    page,
    limit,
  };
}

/**
 * Get a specific event by ID
 */
export async function getEventById(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*, profiles!organizer_id(id, first_name, last_name, email, avatar_url)')
    .eq('id', eventId)
    .single();

  if (error || !data) throw new NotFoundError('Event');
  return data;
}

/**
 * Create a new event
 */
export async function createEvent(
  organizerId: string,
  data: {
    title?: string;
    name?: string;
    description?: string;
    category?: string;
    location?: string;
    capacity?: number;
    startDateTime?: string;
    endDateTime?: string;
    imageUrl?: string;
    rsvpDeadline?: string;
    tags?: string[];
    price?: number;
  }
) {
  const supabase = await createClient();
  const { data: event, error } = await supabase
    .from('events')
    .insert({
      name: data.title || data.name || '',
      description: data.description || '',
      category: data.category || 'other',
      location: data.location || '',
      capacity: data.capacity || 0,
      start_date: data.startDateTime || new Date().toISOString(),
      end_date: data.endDateTime || new Date().toISOString(),
      image_url: data.imageUrl,
      rsvp_deadline: data.rsvpDeadline,
      organizer_id: organizerId,
      tags: data.tags,
      price: data.price,
      status: 'published',
    })
    .select()
    .single();

  if (error) throw error;
  return event;
}

/**
 * Update an existing event
 */
export async function updateEvent(
  eventId: string,
  organizerId: string,
  data: Record<string, any>
) {
  const supabase = await createClient();

  // Check ownership
  const event = await getEventById(eventId);
  if (event.organizer_id !== organizerId) {
    throw new Error('Not authorized to update this event');
  }

  const { data: updated, error } = await supabase
    .from('events')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string, organizerId: string) {
  const supabase = await createClient();

  const event = await getEventById(eventId);
  if (event.organizer_id !== organizerId) {
    throw new Error('Not authorized to delete this event');
  }

  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) throw error;
}

/**
 * Get event attendees/RSVPs
 */
export async function getEventAttendees(eventId: string) {
  await getEventById(eventId); // verify event exists
  const supabase = await createClient();

  const { data: attendees, error } = await supabase
    .from('rsvps')
    .select('*, profiles!user_id(id, first_name, last_name, email, avatar_url)')
    .eq('event_id', eventId)
    .eq('status', 'going')
    .eq('is_waitlisted', false);

  if (error) throw error;

  const checkedIn = (attendees || []).filter((a: any) => a.check_in_status === 'checked_in').length;

  return {
    total: attendees?.length || 0,
    checkInCount: checkedIn,
    attendees: attendees || [],
  };
}

/**
 * Check if event has capacity for additional attendees
 */
export async function checkEventCapacity(
  eventId: string,
  additionalPlusOnes: number = 0
): Promise<boolean> {
  const event = await getEventById(eventId);
  const supabase = await createClient();

  const { data: rsvps, error } = await supabase
    .from('rsvps')
    .select('plus_one_count')
    .eq('event_id', eventId)
    .eq('status', 'going')
    .eq('is_waitlisted', false);

  if (error) throw error;

  const totalAttendees = (rsvps || []).reduce(
    (sum: number, r: any) => sum + 1 + (r.plus_one_count || 0),
    0
  );

  return totalAttendees + additionalPlusOnes + 1 <= event.capacity;
}
