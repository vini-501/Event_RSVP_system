import type { EventCategory, RSVPStatus, EventStatus } from './types';

// Event categories
export const EVENT_CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'conference', label: 'Conference' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'social', label: 'Social' },
  { value: 'sports', label: 'Sports' },
  { value: 'other', label: 'Other' },
];

// RSVP statuses
export const RSVP_STATUSES: { value: 'going' | 'maybe' | 'not_going'; label: string; color: string }[] = [
  { value: 'going', label: 'Going', color: 'bg-green-500' },
  { value: 'maybe', label: 'Maybe', color: 'bg-blue-500' },
  { value: 'not_going', label: 'Not Going', color: 'bg-red-500' },
];

// Event statuses
export const EVENT_STATUSES: { value: EventStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
  { value: 'published', label: 'Published', color: 'bg-blue-500' },
  { value: 'live', label: 'Live', color: 'bg-green-500' },
  { value: 'finished', label: 'Finished', color: 'bg-gray-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

// Navigation routes
export const ROUTES = {
  HOME: '/',
  EVENTS: '/events',
  EVENT_DETAILS: (id: string) => `/events/${id}`,
  EVENT_RSVP: (id: string) => `/events/${id}/rsvp`,
  LOGIN: '/login',
  SIGNUP: '/signup',
  RESET_PASSWORD: '/reset-password',
  MY_RSVPS: '/my-rsvps',
  MY_RSVP_DETAIL: (id: string) => `/my-rsvps/${id}`,
  PROFILE: '/profile',
  ORGANIZER_DASHBOARD: '/organizer/dashboard',
  ORGANIZER_EVENTS: '/organizer/events',
  ORGANIZER_EVENT_MANAGE: (id: string) => `/organizer/events/${id}/manage`,
  ORGANIZER_EVENT_ATTENDEES: (id: string) => `/organizer/events/${id}/attendees`,
  ORGANIZER_EVENT_ANALYTICS: (id: string) => `/organizer/events/${id}/analytics`,
};

// Pagination
export const ITEMS_PER_PAGE = 12;
export const ITEMS_PER_PAGE_TABLE = 20;

// Date formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATE_TIME_FORMAT = 'MMM dd, yyyy hh:mm a';
export const TIME_FORMAT = 'hh:mm a';
