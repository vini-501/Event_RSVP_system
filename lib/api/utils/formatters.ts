import { NextResponse } from 'next/server';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function successResponse<T>(
  data: T,
  message: string = 'Success',
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false as const,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

export function formatUser(user: any) {
  const { password, ...rest } = user;
  return rest;
}

export function formatEvent(event: any) {
  return {
    ...event,
    startDateTime: event.start_datetime,
    endDateTime: event.end_datetime,
    rsvpDeadline: event.rsvp_deadline,
    organizerId: event.organizer_id,
    imageUrl: event.image_url,
    totalRsvps: event.total_rsvps,
    checkInCount: event.check_in_count,
  };
}

export function formatRsvp(rsvp: any) {
  return {
    ...rsvp,
    eventId: rsvp.event_id,
    userId: rsvp.user_id,
    plusOneCount: rsvp.plus_one_count,
    dietaryPreferences: rsvp.dietary_preferences,
    createdAt: rsvp.created_at,
    updatedAt: rsvp.updated_at,
  };
}

export function formatTicket(ticket: any) {
  return {
    ...ticket,
    eventId: ticket.event_id,
    userId: ticket.user_id,
    rsvpId: ticket.rsvp_id,
    checkInStatus: ticket.check_in_status,
    checkInTime: ticket.check_in_time,
    qrCode: ticket.qr_code,
    createdAt: ticket.created_at,
  };
}
