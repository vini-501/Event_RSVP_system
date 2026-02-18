// User types and roles
export type UserRole = 'attendee' | 'organizer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Event types
export type EventStatus = 'draft' | 'published' | 'live' | 'finished' | 'cancelled';
export type EventCategory = 'conference' | 'workshop' | 'meetup' | 'webinar' | 'social' | 'sports' | 'other';

export interface Event {
  id: string;
  name: string;
  description: string;
  image?: string;
  category: EventCategory;
  startDate: Date;
  endDate: Date;
  location: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  capacity: number;
  currentAttendees: number;
  price?: number;
  status: EventStatus;
  organizerId: string;
  organizer?: User;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// RSVP types
export type RsvpStatus = 'going' | 'maybe' | 'not_going';
export type RSVPStatus = RsvpStatus; // backward compat alias
export type CheckInStatus = 'not_checked_in' | 'checked_in';
export type WaitlistStatus = 'waiting' | 'confirmed' | 'expired';

export interface CustomQuestion {
  id: string;
  eventId: string;
  question: string;
  type: 'text' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
  order: number;
  createdAt: Date;
}

export interface RsvpResponse {
  questionId: string;
  answer: string | string[];
}

export interface Rsvp {
  id: string;
  eventId: string;
  event?: Event;
  userId: string;
  user?: User;
  status: RsvpStatus;
  plusOneCount: number;
  dietaryPreferences?: string;
  customResponses?: RsvpResponse[];
  checkInStatus: CheckInStatus;
  checkInTime?: Date;
  rsvpDeadlineMet: boolean;
  isWaitlisted: boolean;
  waitlistPosition?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Waitlist {
  id: string;
  eventId: string;
  rsvpId: string;
  userId: string;
  status: WaitlistStatus;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

// Ticket types
export interface Ticket {
  id: string;
  rsvpId: string;
  userId: string;
  eventId: string;
  qrCode?: string; // Base64 encoded QR code
  qrCodeUrl?: string; // URL to QR code if stored externally
  checkInStatus: CheckInStatus;
  checkInTime?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

// Notification types
export type NotificationChannel = 'email' | 'sms' | 'whatsapp';
export type NotificationType = 'rsvp_confirmation' | 'event_reminder' | 'event_update' | 'event_cancellation';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'bounced';

export interface Notification {
  id: string;
  userId: string;
  eventId?: string;
  rsvpId?: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  recipient: string; // Email, phone number, or other recipient
  subject?: string;
  content: string;
  metadata?: Record<string, any>;
  sentAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  template: string; // Can include placeholders like {{userName}}, {{eventName}}
  createdAt: Date;
  updatedAt: Date;
}

// Form types
export interface EventFormData {
  name: string;
  description: string;
  image?: string;
  category: EventCategory;
  startDate: Date;
  endDate: Date;
  location: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  capacity: number;
  price?: number;
  tags?: string[];
}

export interface RSVPFormData {
  name: string;
  email: string;
  status: RsvpStatus;
  guestCount: number;
  dietaryPreferences?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}
