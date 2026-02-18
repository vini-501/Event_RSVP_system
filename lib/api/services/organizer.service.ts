import { createClient } from '@/lib/supabase/server';
import { NotFoundError } from '../utils/errors';

/**
 * Get comprehensive event analytics for organizer dashboard
 */
export async function getEventAnalytics(eventId: string, organizerId: string) {
  const supabase = await createClient();

  const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single();
  if (!event) throw new NotFoundError('Event');
  if (event.organizer_id !== organizerId) throw new Error('Not authorized to view analytics');

  const { data: allRsvps } = await supabase.from('rsvps').select('*').eq('event_id', eventId);
  const rsvps = allRsvps || [];

  const confirmed = rsvps.filter((r: any) => !r.is_waitlisted);
  const waitlisted = rsvps.filter((r: any) => r.is_waitlisted);

  const breakdown = {
    going: confirmed.filter((r: any) => r.status === 'going').length,
    maybe: confirmed.filter((r: any) => r.status === 'maybe').length,
    notGoing: confirmed.filter((r: any) => r.status === 'not_going').length,
  };

  const checkedIn = confirmed.filter((r: any) => r.check_in_status === 'checked_in').length;
  const totalAttendees = confirmed
    .filter((r: any) => r.status === 'going')
    .reduce((sum: number, r: any) => sum + 1 + (r.plus_one_count || 0), 0);

  return {
    eventId,
    eventName: event.name,
    capacity: event.capacity,
    totalRsvps: rsvps.length,
    confirmedRsvps: confirmed.length,
    waitlistedRsvps: waitlisted.length,
    breakdown,
    totalAttendees,
    availableSeats: Math.max(0, event.capacity - totalAttendees),
    checkedIn,
    checkInRate: confirmed.length > 0 ? ((checkedIn / confirmed.length) * 100).toFixed(1) : '0',
  };
}

/**
 * Search and filter attendees for organizer
 */
export async function searchAttendees(
  eventId: string,
  organizerId: string,
  filters?: {
    status?: string;
    checkInStatus?: string;
    search?: string;
  }
) {
  const supabase = await createClient();

  const { data: event } = await supabase.from('events').select('organizer_id').eq('id', eventId).single();
  if (!event) throw new NotFoundError('Event');
  if (event.organizer_id !== organizerId) throw new Error('Not authorized to view attendees');

  let query = supabase
    .from('rsvps')
    .select('*, profiles!user_id(id, first_name, last_name, email, avatar_url)')
    .eq('event_id', eventId);

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.checkInStatus) query = query.eq('check_in_status', filters.checkInStatus);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;

  let attendees = data || [];

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    attendees = attendees.filter((r: any) => {
      const profile = r.profiles;
      const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.toLowerCase();
      return name.includes(searchLower) || profile?.email?.toLowerCase().includes(searchLower);
    });
  }

  return attendees;
}

/**
 * Export attendee list as CSV
 */
export async function exportAttendeeList(eventId: string, organizerId: string) {
  const supabase = await createClient();

  const { data: event } = await supabase.from('events').select('organizer_id').eq('id', eventId).single();
  if (!event) throw new NotFoundError('Event');
  if (event.organizer_id !== organizerId) throw new Error('Not authorized to export attendees');

  const { data: rsvps } = await supabase
    .from('rsvps')
    .select('*, profiles!user_id(first_name, last_name, email)')
    .eq('event_id', eventId)
    .eq('status', 'going')
    .eq('is_waitlisted', false)
    .order('created_at', { ascending: true });

  let csv = 'Name,Email,Status,Plus Ones,Check-In Status,Check-In Time,Dietary Preferences\n';

  (rsvps || []).forEach((rsvp: any) => {
    const profile = rsvp.profiles;
    const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
    const row = [
      `"${name}"`,
      `"${profile?.email || ''}"`,
      rsvp.status,
      rsvp.plus_one_count,
      rsvp.check_in_status,
      rsvp.check_in_time ? new Date(rsvp.check_in_time).toISOString() : '',
      `"${rsvp.dietary_preferences || ''}"`,
    ].join(',');
    csv += row + '\n';
  });

  return csv;
}

/**
 * Get waitlist for an event (organizer view)
 */
export async function getEventWaitlist(eventId: string, organizerId: string) {
  const supabase = await createClient();

  const { data: event } = await supabase.from('events').select('organizer_id').eq('id', eventId).single();
  if (!event) throw new NotFoundError('Event');
  if (event.organizer_id !== organizerId) throw new Error('Not authorized to view waitlist');

  const { data, error } = await supabase
    .from('waitlist')
    .select('*, rsvps!rsvp_id(*), profiles!user_id(id, first_name, last_name, email)')
    .eq('event_id', eventId)
    .eq('status', 'waiting')
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Send announcement (mock — logs to console)
 */
export async function sendAnnouncement(
  eventId: string,
  organizerId: string,
  announcement: { title: string; message: string; targetAudience?: string }
) {
  const supabase = await createClient();

  const { data: event } = await supabase.from('events').select('organizer_id').eq('id', eventId).single();
  if (!event) throw new NotFoundError('Event');
  if (event.organizer_id !== organizerId) throw new Error('Not authorized to send announcements');

  let query = supabase.from('rsvps').select('*', { count: 'exact', head: true }).eq('event_id', eventId);
  if (announcement.targetAudience && announcement.targetAudience !== 'all') {
    query = query.eq('status', announcement.targetAudience);
  }

  const { count } = await query;

  return {
    success: true,
    recipientCount: count || 0,
    announcement,
  };
}
