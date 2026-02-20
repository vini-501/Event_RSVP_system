import { createClient } from '@/lib/supabase/server';
import { ConflictError, ForbiddenError, NotFoundError } from '../utils/errors';
import { checkEventCapacity, getEventById } from './event.service';

const RSVP_APPROVAL_STATUSES = ['pending', 'approved', 'rejected'] as const;
type RsvpApprovalStatus = (typeof RSVP_APPROVAL_STATUSES)[number];

function getRsvpApprovalStatus(rsvp: any): RsvpApprovalStatus {
  const metadata = rsvp?.custom_responses;
  if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
    const status = (metadata.approval_status || metadata.approvalStatus) as string | undefined;
    if (status && RSVP_APPROVAL_STATUSES.includes(status as RsvpApprovalStatus)) {
      return status as RsvpApprovalStatus;
    }
  }

  // Legacy rows created before approval flow are treated as approved.
  return 'approved';
}

function withRsvpApprovalStatus(rsvp: any) {
  return {
    ...rsvp,
    approval_status: getRsvpApprovalStatus(rsvp),
  };
}

function buildRsvpMetadata(
  customResponses: any,
  approvalStatus: RsvpApprovalStatus
) {
  if (customResponses && typeof customResponses === 'object' && !Array.isArray(customResponses)) {
    return {
      ...customResponses,
      approval_status: approvalStatus,
    };
  }

  if (Array.isArray(customResponses)) {
    return {
      answers: customResponses,
      approval_status: approvalStatus,
    };
  }

  return {
    answers: [],
    approval_status: approvalStatus,
  };
}

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
  return (data || []).map(withRsvpApprovalStatus);
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
  return withRsvpApprovalStatus(data);
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
  const all = (rsvps || []).map(withRsvpApprovalStatus);

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
      custom_responses: buildRsvpMetadata(data.customResponses, 'pending'),
      check_in_status: 'not_checked_in',
      rsvp_deadline_met: deadlineMet,
      is_waitlisted: isWaitlisted,
      waitlist_position: waitlistPosition,
    })
    .select()
    .single();

  if (error) throw error;

  // Keep event capacity state in sync for confirmed "going" responses.
  if (data.status === 'going' && !isWaitlisted) {
    const stillHasCapacity = await checkEventCapacity(eventId, 0);
    if (!stillHasCapacity) {
      await supabase
        .from('events')
        .update({ is_capacity_full: true, updated_at: new Date().toISOString() })
        .eq('id', eventId);
    }
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

  return withRsvpApprovalStatus(rsvp);
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
    throw new ForbiddenError('Not authorized to update this RSVP');
  }

  const supabase = await createClient();
  const newStatus = data.status || rsvp.status;
  const newPlusOnes = data.plusOneCount ?? rsvp.plus_one_count;

  // If changing TO 'going' (from maybe/not_going), re-check capacity
  let isWaitlisted = rsvp.is_waitlisted;
  let waitlistPosition = rsvp.waitlist_position;

  if (newStatus === 'going' && rsvp.status !== 'going') {
    const hasCapacity = await checkEventCapacity(rsvp.event_id, newPlusOnes);
    if (!hasCapacity) {
      isWaitlisted = true;
      const { count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', rsvp.event_id);
      waitlistPosition = (count || 0) + 1;

      // Add to waitlist
      await supabase.from('waitlist').insert({
        event_id: rsvp.event_id,
        rsvp_id: rsvpId,
        user_id: userId,
        status: 'waiting',
        position: waitlistPosition,
      });
    }
  }

  // If changing FROM 'going' to something else, free up capacity
  if (rsvp.status === 'going' && newStatus !== 'going' && !rsvp.is_waitlisted) {
    // Delete the ticket since they're no longer going
    await supabase.from('tickets').delete().eq('rsvp_id', rsvpId);
    // Remove waitlist flag and re-open capacity flag on the event
    await supabase
      .from('events')
      .update({ is_capacity_full: false, updated_at: new Date().toISOString() })
      .eq('id', rsvp.event_id);
  }

  const { data: updated, error } = await supabase
    .from('rsvps')
    .update({
      status: newStatus,
      plus_one_count: newPlusOnes,
      dietary_preferences: data.dietaryPreferences ?? rsvp.dietary_preferences,
      custom_responses: buildRsvpMetadata(
        data.customResponses ?? rsvp.custom_responses,
        'pending'
      ),
      is_waitlisted: isWaitlisted,
      waitlist_position: waitlistPosition,
      updated_at: new Date().toISOString(),
    })
    .eq('id', rsvpId)
    .select()
    .single();

  if (error) throw error;

  // Role/status edits require re-approval: remove previously issued ticket.
  await supabase.from('tickets').delete().eq('rsvp_id', rsvpId);

  if (newStatus === 'going' && !isWaitlisted) {
    const stillHasCapacity = await checkEventCapacity(rsvp.event_id, 0);
    if (!stillHasCapacity) {
      await supabase
        .from('events')
        .update({ is_capacity_full: true, updated_at: new Date().toISOString() })
        .eq('id', rsvp.event_id);
    }
  }

  return withRsvpApprovalStatus(updated);
}

/**
 * Delete an RSVP and associated ticket/waitlist entry
 */
export async function deleteRsvp(rsvpId: string, userId: string) {
  const rsvp = await getRsvpById(rsvpId);
  if (rsvp.user_id !== userId) {
    throw new ForbiddenError('Not authorized to delete this RSVP');
  }

  const supabase = await createClient();

  // Cascade should handle tickets/waitlist, but let's be explicit
  await supabase.from('tickets').delete().eq('rsvp_id', rsvpId);
  await supabase.from('waitlist').delete().eq('rsvp_id', rsvpId);
  const { error } = await supabase.from('rsvps').delete().eq('id', rsvpId);
  if (error) throw error;

  // If user was 'going' and not waitlisted, re-open capacity flag
  if (rsvp.status === 'going' && !rsvp.is_waitlisted) {
    await supabase
      .from('events')
      .update({ is_capacity_full: false, updated_at: new Date().toISOString() })
      .eq('id', rsvp.event_id);
  }
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
