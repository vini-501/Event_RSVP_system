import { createClient } from '@/lib/supabase/server';
import { NotFoundError } from '../utils/errors';

/**
 * Generate a unique ticket for an RSVP with QR code
 */
export async function generateTicket(rsvpId: string) {
  const supabase = await createClient();

  const { data: rsvp } = await supabase.from('rsvps').select('*').eq('id', rsvpId).single();
  if (!rsvp) throw new NotFoundError('RSVP');

  // Check if ticket already exists
  const { data: existing } = await supabase.from('tickets').select('*').eq('rsvp_id', rsvpId).single();
  if (existing) return existing;

  // Generate QR code data
  const qrData = JSON.stringify({
    rsvpId,
    userId: rsvp.user_id,
    eventId: rsvp.event_id,
    timestamp: new Date().toISOString(),
    checksum: Math.random().toString(36).substr(2, 9),
  });
  const qrCode = Buffer.from(qrData).toString('base64');

  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert({
      rsvp_id: rsvpId,
      user_id: rsvp.user_id,
      event_id: rsvp.event_id,
      qr_code: qrCode,
      check_in_status: 'not_checked_in',
    })
    .select()
    .single();

  if (error) throw error;
  return ticket;
}

/**
 * Get user's tickets
 */
export async function getUserTickets(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tickets')
    .select('*, events(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get ticket by ID
 */
export async function getTicketById(ticketId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tickets').select('*').eq('id', ticketId).single();
  if (error || !data) throw new NotFoundError('Ticket');
  return data;
}

/**
 * Get ticket by RSVP ID
 */
export async function getTicketByRsvpId(rsvpId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tickets').select('*').eq('rsvp_id', rsvpId).single();
  if (error || !data) throw new NotFoundError('Ticket');
  return data;
}

/**
 * Get all tickets for an event
 */
export async function getEventTickets(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tickets')
    .select('*, profiles!user_id(id, first_name, last_name, email)')
    .eq('event_id', eventId);

  if (error) throw error;
  return data || [];
}

/**
 * Check in a ticket by ID
 */
export async function checkInTicket(ticketId: string) {
  const ticket = await getTicketById(ticketId);
  if (ticket.check_in_status === 'checked_in') {
    throw new Error('Ticket already checked in');
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from('tickets')
    .update({ check_in_status: 'checked_in', check_in_time: now, updated_at: now })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw error;

  // Update RSVP check-in status
  await supabase
    .from('rsvps')
    .update({ check_in_status: 'checked_in', check_in_time: now, updated_at: now })
    .eq('id', ticket.rsvp_id);

  return updated;
}

/**
 * Check in by QR code data
 */
export async function checkInByQRCode(qrCodeBase64: string) {
  try {
    const qrData = Buffer.from(qrCodeBase64, 'base64').toString('utf-8');
    const data = JSON.parse(qrData);

    const supabase = await createClient();
    const { data: ticket } = await supabase
      .from('tickets')
      .select('*')
      .eq('rsvp_id', data.rsvpId)
      .eq('event_id', data.eventId)
      .single();

    if (!ticket) {
      return { success: false, message: 'Ticket not found', error: 'Invalid or expired ticket' };
    }

    if (ticket.check_in_status === 'checked_in') {
      return { success: false, message: 'Already checked in', error: `Checked in at ${ticket.check_in_time}` };
    }

    const checkedIn = await checkInTicket(ticket.id);
    return { success: true, ticket: checkedIn, message: 'Successfully checked in' };
  } catch (error) {
    return { success: false, message: 'Failed to process QR code', error: error instanceof Error ? error.message : 'Invalid QR code format' };
  }
}

/**
 * Get QR code data for a ticket
 */
export async function getQrCodeData(ticketId: string) {
  const ticket = await getTicketById(ticketId);
  return {
    ticketId: ticket.id,
    eventId: ticket.event_id,
    userId: ticket.user_id,
    rsvpId: ticket.rsvp_id,
    checkInStatus: ticket.check_in_status,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get ticket details with related info
 */
export async function getTicketDetails(ticketId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tickets')
    .select('*, profiles!user_id(*), events(*), rsvps!rsvp_id(*)')
    .eq('id', ticketId)
    .single();

  if (error || !data) throw new NotFoundError('Ticket');
  return data;
}

/**
 * Get event check-in statistics
 */
export async function getEventCheckInStats(eventId: string) {
  const tickets = await getEventTickets(eventId);
  const checkedIn = tickets.filter((t: any) => t.check_in_status === 'checked_in').length;

  return {
    totalTickets: tickets.length,
    checkedIn,
    notCheckedIn: tickets.length - checkedIn,
    checkInRate: tickets.length > 0 ? ((checkedIn / tickets.length) * 100).toFixed(1) : '0',
  };
}
