import { createClient } from '@/lib/supabase/server';

export type NotificationChannel = 'email' | 'sms' | 'whatsapp';

const DEFAULT_CHANNELS: NotificationChannel[] = ['email'];

/**
 * Helper: create notifications for all requested channels
 */
async function createMultiChannelNotifications(
  basePayload: {
    user_id: string;
    event_id: string;
    rsvp_id?: string;
    type: string;
    recipient: string;
    subject: string;
    content: string;
  },
  channels: NotificationChannel[] = DEFAULT_CHANNELS,
) {
  const supabase = await createClient();
  const notifications = [];

  for (const channel of channels) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...basePayload,
        channel,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) notifications.push(data);
  }

  return notifications;
}

/**
 * Send an RSVP confirmation notification
 */
export async function sendRsvpConfirmation(
  rsvpId: string,
  channels: NotificationChannel[] = DEFAULT_CHANNELS,
) {
  const supabase = await createClient();

  const { data: rsvp } = await supabase.from('rsvps').select('*').eq('id', rsvpId).single();
  if (!rsvp) throw new Error('RSVP not found');

  const { data: user } = await supabase.from('profiles').select('*').eq('id', rsvp.user_id).single();
  if (!user) throw new Error('User not found');

  const { data: event } = await supabase.from('events').select('*').eq('id', rsvp.event_id).single();
  if (!event) throw new Error('Event not found');

  const { data: template } = await supabase
    .from('notification_templates')
    .select('*')
    .eq('type', 'rsvp_confirmation')
    .eq('channel', 'email')
    .single();

  const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  const content = renderTemplate(template?.template || '', {
    userName,
    eventName: event.name,
    eventDate: new Date(event.start_date).toLocaleDateString(),
    eventTime: new Date(event.start_date).toLocaleTimeString(),
    eventLocation: event.location,
  });

  const notifications = await createMultiChannelNotifications(
    {
      user_id: rsvp.user_id,
      event_id: rsvp.event_id,
      rsvp_id: rsvpId,
      type: 'rsvp_confirmation',
      recipient: user.email,
      subject: template?.subject?.replace('{{eventName}}', event.name) || 'RSVP Confirmation',
      content,
    },
    channels,
  );

  return notifications.length === 1 ? notifications[0] : notifications;
}

/**
 * Send event reminder notification
 */
export async function sendEventReminder(
  eventId: string,
  channels: NotificationChannel[] = DEFAULT_CHANNELS,
) {
  const supabase = await createClient();

  const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single();
  if (!event) throw new Error('Event not found');

  const { data: rsvps } = await supabase
    .from('rsvps')
    .select('*, profiles!user_id(first_name, last_name, email)')
    .eq('event_id', eventId)
    .eq('status', 'going');

  const { data: template } = await supabase
    .from('notification_templates')
    .select('*')
    .eq('type', 'event_reminder')
    .eq('channel', 'email')
    .single();

  const notifications = [];
  for (const rsvp of rsvps || []) {
    const profile = (rsvp as any).profiles;
    if (!profile) continue;

    const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    const content = renderTemplate(template?.template || '', {
      userName,
      eventName: event.name,
      eventDate: new Date(event.start_date).toLocaleDateString(),
      eventTime: new Date(event.start_date).toLocaleTimeString(),
      eventLocation: event.location,
    });

    const sent = await createMultiChannelNotifications(
      {
        user_id: rsvp.user_id,
        event_id: eventId,
        type: 'event_reminder',
        recipient: profile.email,
        subject: template?.subject?.replace('{{eventName}}', event.name) || 'Event Reminder',
        content,
      },
      channels,
    );
    notifications.push(...sent);
  }

  return notifications;
}

/**
 * Send event update notification
 */
export async function sendEventUpdate(
  eventId: string,
  updateContent: string,
  channels: NotificationChannel[] = DEFAULT_CHANNELS,
) {
  const supabase = await createClient();

  const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single();
  if (!event) throw new Error('Event not found');

  const { data: rsvps } = await supabase
    .from('rsvps')
    .select('*, profiles!user_id(first_name, last_name, email)')
    .eq('event_id', eventId);

  const { data: template } = await supabase
    .from('notification_templates')
    .select('*')
    .eq('type', 'event_update')
    .eq('channel', 'email')
    .single();

  const notifications = [];
  for (const rsvp of rsvps || []) {
    const profile = (rsvp as any).profiles;
    if (!profile) continue;

    const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    const content = renderTemplate(template?.template || '', {
      userName,
      eventName: event.name,
      eventDate: new Date(event.start_date).toLocaleDateString(),
      eventTime: new Date(event.start_date).toLocaleTimeString(),
      eventLocation: event.location,
      updateContent,
    });

    const sent = await createMultiChannelNotifications(
      {
        user_id: rsvp.user_id,
        event_id: eventId,
        type: 'event_update',
        recipient: profile.email,
        subject: template?.subject?.replace('{{eventName}}', event.name) || 'Event Update',
        content,
      },
      channels,
    );
    notifications.push(...sent);
  }

  return notifications;
}

/**
 * Send event cancellation notification
 */
export async function sendEventCancellation(
  eventId: string,
  channels: NotificationChannel[] = DEFAULT_CHANNELS,
) {
  const supabase = await createClient();

  const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single();
  if (!event) throw new Error('Event not found');

  const { data: rsvps } = await supabase
    .from('rsvps')
    .select('*, profiles!user_id(first_name, last_name, email)')
    .eq('event_id', eventId);

  const { data: template } = await supabase
    .from('notification_templates')
    .select('*')
    .eq('type', 'event_cancellation')
    .eq('channel', 'email')
    .single();

  const notifications = [];
  for (const rsvp of rsvps || []) {
    const profile = (rsvp as any).profiles;
    if (!profile) continue;

    const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    const content = renderTemplate(template?.template || '', {
      userName,
      eventName: event.name,
      eventDate: new Date(event.start_date).toLocaleDateString(),
    });

    const sent = await createMultiChannelNotifications(
      {
        user_id: rsvp.user_id,
        event_id: eventId,
        type: 'event_cancellation',
        recipient: profile.email,
        subject: template?.subject?.replace('{{eventName}}', event.name) || 'Event Cancelled',
        content,
      },
      channels,
    );
    notifications.push(...sent);
  }

  return notifications;
}

/**
 * Process 24h event reminders — finds events starting within the next 24h
 * and sends reminders to all confirmed attendees. Call via cron or scheduled API.
 */
export async function processScheduledReminders() {
  const supabase = await createClient();
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Find events starting within 24h that haven't had reminders sent
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('id, name')
    .gte('start_date', now.toISOString())
    .lte('start_date', in24h.toISOString())
    .in('status', ['published', 'live']);

  const results = [];
  for (const event of upcomingEvents || []) {
    // Check if reminder already sent for this event
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id)
      .eq('type', 'event_reminder');

    if ((count || 0) > 0) continue; // already sent

    const sent = await sendEventReminder(event.id);
    results.push({ eventId: event.id, eventName: event.name, notificationsSent: sent.length });
  }

  return results;
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get notification by ID
 */
export async function getNotificationById(notificationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', notificationId)
    .single();

  if (error || !data) throw new Error('Notification not found');
  return data;
}

/**
 * Helper function to render template with variables
 */
function renderTemplate(template: string, variables: Record<string, string>): string {
  let rendered = template;
  Object.entries(variables).forEach(([key, value]) => {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  return rendered;
}
