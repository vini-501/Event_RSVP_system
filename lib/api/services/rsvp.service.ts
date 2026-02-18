import { createClient } from '@/lib/supabase/server';
import { ConflictError, NotFoundError } from '../utils/errors';
import { checkEventCapacity, getEventById } from './event.service';

/**
 * Get all RSVPs for a specific user
 */
export async function getUserRsvps(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rsvps')
    .select('*, events(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get a specific RSVP by ID
 */
export async function getRsvpById(rsvpId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('id', rsvpId)
    .single();

  if (error || !data) throw new NotFoundError('RSVP');
  return data;
}

/**
 * Get event RSVPs with status breakdown
 */
export async function getEventRsvps(eventId: string) {
  const supabase = await createClient();
  const { data: rsvps, error } = await supabase
    .from('rsvps')
    .select('*, profiles!user_id(id, first_name, last_name, email)')
    .eq('event_id', eventId);

  if (error) throw error;
  const all = rsvps || [];

  const breakdown = {
    going: all.filter((r: any) => r.status === 'going').length,
    maybe: all.filter((r: any) => r.status === 'maybe').length,
    notGoing: all.filter((r: any) => r.status === 'not_going').length,
  };

  const checkedIn = all.filter((r: any) => r.check_in_status === 'checked_in').length;

  return {
    total: all.length,
    breakdown,
    checkedIn,
    rsvps: all,
  };
}

/**
 * Create a new RSVP with capacity and deadline validation
 */
export async function createRsvp(
  userId: string,
  eventId: string,
  data: {
    status: string;
    plusOneCount?: number;
    dietaryPreferences?: string;
    customResponses?: any[];
  }
) {
  const supabase = await createClient();

  // Check if user already has RSVP for this event
  const { data: existing } = await supabase
    .from('rsvps')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .single();

  if (existing) {
    throw new ConflictError('User already has an RSVP for this event');
  }

  const event = await getEventById(eventId);
  const rsvpDeadline = event.rsvp_deadline ? new Date(event.rsvp_deadline) : null;
  const deadlineMet = !rsvpDeadline || new Date() <= rsvpDeadline;

  if (!deadlineMet && data.status === 'going') {
    throw new ConflictError('RSVP deadline has passed');
  }

  const plusOnes = data.plusOneCount || 0;
  let isWaitlisted = false;
  let waitlistPosition: number | undefined;

  if (data.status === 'going') {
    const hasCapacity = await checkEventCapacity(eventId, plusOnes);
    if (!hasCapacity) {
      isWaitlisted = true;
      const { count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);
      waitlistPosition = (count || 0) + 1;
    }
  }

  const { data: rsvp, error } = await supabase
    .from('rsvps')
    .insert({
      user_id: userId,
      event_id: eventId,
      status: data.status,
      plus_one_count: plusOnes,
      dietary_preferences: data.dietaryPreferences,
      custom_responses: data.customResponses,
      check_in_status: 'not_checked_in',
      rsvp_deadline_met: deadlineMet,
      is_waitlisted: isWaitlisted,
      waitlist_position: waitlistPosition,
    })
    .select()
    .single();

  if (error) throw error;

  // Create ticket if going and not waitlisted
  if (data.status === 'going' && !isWaitlisted) {
    await supabase.from('tickets').insert({
      rsvp_id: rsvp.id,
      user_id: userId,
      event_id: eventId,
      check_in_status: 'not_checked_in',
    });
  }

  // Create waitlist entry if applicable
  if (isWaitlisted) {
    await supabase.from('waitlist').insert({
      event_id: eventId,
      rsvp_id: rsvp.id,
      user_id: userId,
      status: 'waiting',
      position: waitlistPosition!,
    });
  }

  return rsvp;
}

/**
 * Update an existing RSVP
 */
export async function updateRsvp(
  rsvpId: string,
  userId: string,
  data: {
    status?: string;
    plusOneCount?: number;
    dietaryPreferences?: string;
    customResponses?: any[];
  }
) {
  const rsvp = await getRsvpById(rsvpId);
  if (rsvp.user_id !== userId) {
    throw new Error('Not authorized to update this RSVP');
  }

  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from('rsvps')
    .update({
      status: data.status || rsvp.status,
      plus_one_count: data.plusOneCount ?? rsvp.plus_one_count,
      dietary_preferences: data.dietaryPreferences ?? rsvp.dietary_preferences,
      custom_responses: data.customResponses ?? rsvp.custom_responses,
      updated_at: new Date().toISOString(),
    })
    .eq('id', rsvpId)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

/**
 * Delete an RSVP and associated ticket/waitlist entry
 */
export async function deleteRsvp(rsvpId: string, userId: string) {
  const rsvp = await getRsvpById(rsvpId);
  if (rsvp.user_id !== userId) {
    throw new Error('Not authorized to delete this RSVP');
  }

  const supabase = await createClient();

  // Cascade should handle tickets/waitlist, but let's be explicit
  await supabase.from('tickets').delete().eq('rsvp_id', rsvpId);
  await supabase.from('waitlist').delete().eq('rsvp_id', rsvpId);
  const { error } = await supabase.from('rsvps').delete().eq('id', rsvpId);
  if (error) throw error;
}

/**
 * Get waitlist for an event
 */
export async function getEventWaitlist(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('waitlist')
    .select('*, profiles!user_id(id, first_name, last_name, email)')
    .eq('event_id', eventId)
    .eq('status', 'waiting')
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get custom questions for an event
 */
export async function getEventCustomQuestions(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('custom_questions')
    .select('*')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Add a custom question to an event
 */
export async function addCustomQuestion(eventId: string, question: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('custom_questions')
    .insert({
      event_id: eventId,
      question: question.question,
      type: question.type || 'text',
      required: question.required || false,
      options: question.options,
      sort_order: question.sort_order || question.order || 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get RSVP stats for organizer dashboard
 */
export async function getRsvpStats(eventId: string) {
  const event = await getEventById(eventId);
  const rsvps = await getEventRsvps(eventId);
  const waitlist = await getEventWaitlist(eventId);

  const supabase = await createClient();
  const { data: goingRsvps } = await supabase
    .from('rsvps')
    .select('plus_one_count')
    .eq('event_id', eventId)
    .eq('status', 'going')
    .eq('is_waitlisted', false);

  const totalAttendees = (goingRsvps || []).reduce(
    (sum: number, r: any) => sum + 1 + (r.plus_one_count || 0),
    0
  );
  const availableSeats = Math.max(0, event.capacity - totalAttendees);

  return {
    totalRsvps: rsvps.total,
    breakdown: rsvps.breakdown,
    checkedIn: rsvps.checkedIn,
    checkInRate: rsvps.total > 0 ? ((rsvps.checkedIn / rsvps.total) * 100).toFixed(1) : 0,
    totalAttendees,
    availableSeats,
    waitlistCount: waitlist.length,
    capacity: event.capacity,
  };
}
