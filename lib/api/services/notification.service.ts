import { createClient } from '@/lib/supabase/server';

/**
 * Send an RSVP confirmation notification
 */
export async function sendRsvpConfirmation(rsvpId: string) {
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

  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      user_id: rsvp.user_id,
      event_id: rsvp.event_id,
      rsvp_id: rsvpId,
      type: 'rsvp_confirmation',
      channel: 'email',
      status: 'sent',
      recipient: user.email,
      subject: template?.subject?.replace('{{eventName}}', event.name) || 'RSVP Confirmation',
      content: renderTemplate(template?.template || '', {
        userName,
        eventName: event.name,
        eventDate: new Date(event.start_date).toLocaleDateString(),
        eventTime: new Date(event.start_date).toLocaleTimeString(),
        eventLocation: event.location,
      }),
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return notification;
}

/**
 * Send event reminder notification
 */
export async function sendEventReminder(eventId: string) {
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
    const { data } = await supabase
      .from('notifications')
      .insert({
        user_id: rsvp.user_id,
        event_id: eventId,
        type: 'event_reminder',
        channel: 'email',
        status: 'sent',
        recipient: profile.email,
        subject: template?.subject?.replace('{{eventName}}', event.name) || 'Event Reminder',
        content: renderTemplate(template?.template || '', {
          userName,
          eventName: event.name,
          eventDate: new Date(event.start_date).toLocaleDateString(),
          eventTime: new Date(event.start_date).toLocaleTimeString(),
          eventLocation: event.location,
        }),
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (data) notifications.push(data);
  }

  return notifications;
}

/**
 * Send event update notification
 */
export async function sendEventUpdate(eventId: string, updateContent: string) {
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
    const { data } = await supabase
      .from('notifications')
      .insert({
        user_id: rsvp.user_id,
        event_id: eventId,
        type: 'event_update',
        channel: 'email',
        status: 'sent',
        recipient: profile.email,
        subject: template?.subject?.replace('{{eventName}}', event.name) || 'Event Update',
        content: renderTemplate(template?.template || '', {
          userName,
          eventName: event.name,
          eventDate: new Date(event.start_date).toLocaleDateString(),
          eventTime: new Date(event.start_date).toLocaleTimeString(),
          eventLocation: event.location,
          updateContent,
        }),
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (data) notifications.push(data);
  }

  return notifications;
}

/**
 * Send event cancellation notification
 */
export async function sendEventCancellation(eventId: string) {
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
    const { data } = await supabase
      .from('notifications')
      .insert({
        user_id: rsvp.user_id,
        event_id: eventId,
        type: 'event_cancellation',
        channel: 'email',
        status: 'sent',
        recipient: profile.email,
        subject: template?.subject?.replace('{{eventName}}', event.name) || 'Event Cancelled',
        content: renderTemplate(template?.template || '', {
          userName,
          eventName: event.name,
          eventDate: new Date(event.start_date).toLocaleDateString(),
        }),
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (data) notifications.push(data);
  }

  return notifications;
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
