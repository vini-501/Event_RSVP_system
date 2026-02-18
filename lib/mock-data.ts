import type { User, Event, Rsvp, Waitlist, CustomQuestion, Ticket, Notification, NotificationTemplate } from './types';

// Mock users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'sarah@example.com',
    name: 'Sarah Johnson',
    role: 'attendee',
    avatar: undefined,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'user-2',
    email: 'alex@example.com',
    name: 'Alex Chen',
    role: 'organizer',
    avatar: undefined,
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2023-12-20'),
  },
  {
    id: 'user-3',
    email: 'jordan@example.com',
    name: 'Jordan Smith',
    role: 'attendee',
    avatar: undefined,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'user-4',
    email: 'emma@example.com',
    name: 'Emma Wilson',
    role: 'organizer',
    avatar: undefined,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'user-5',
    email: 'michael@example.com',
    name: 'Michael Brown',
    role: 'admin',
    avatar: undefined,
    createdAt: new Date('2023-11-01'),
    updatedAt: new Date('2023-11-01'),
  },
];

// Mock events
export const mockEvents: Event[] = [
  {
    id: 'event-1',
    name: 'React Summit 2025',
    description:
      'Join us for the largest React conference of the year. Learn about the latest React features, best practices, and network with the community.',
    image: undefined,
    category: 'conference',
    startDate: new Date('2025-03-15'),
    endDate: new Date('2025-03-17'),
    location: 'San Francisco Convention Center',
    address: '747 Howard St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94103',
    capacity: 500,
    currentAttendees: 342,
    price: 299,
    status: 'published',
    organizerId: 'user-2',
    organizer: mockUsers[1],
    tags: ['React', 'JavaScript', 'Frontend'],
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
  },
  {
    id: 'event-2',
    name: 'Next.js Masterclass',
    description:
      'Learn Next.js from scratch. This interactive workshop covers routing, SSR, API routes, and deployment strategies.',
    image: undefined,
    category: 'workshop',
    startDate: new Date('2025-02-22'),
    endDate: new Date('2025-02-22'),
    location: 'Tech Hub Downtown',
    address: '123 Tech Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    capacity: 50,
    currentAttendees: 48,
    price: 99,
    status: 'published',
    organizerId: 'user-2',
    organizer: mockUsers[1],
    tags: ['Next.js', 'Web Development', 'Training'],
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-11-15'),
  },
  {
    id: 'event-3',
    name: 'Web Dev Meetup - Monthly',
    description:
      'Monthly gathering for web developers. Network, share projects, and discuss the latest trends in web development.',
    image: undefined,
    category: 'meetup',
    startDate: new Date('2025-02-20'),
    endDate: new Date('2025-02-20'),
    location: 'Coffee & Code Cafe',
    address: '456 Main Ave',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    capacity: 100,
    currentAttendees: 67,
    price: undefined,
    status: 'published',
    organizerId: 'user-4',
    organizer: mockUsers[3],
    tags: ['Meetup', 'Networking', 'Web Development'],
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01'),
  },
  {
    id: 'event-4',
    name: 'TypeScript Deep Dive',
    description:
      'Comprehensive workshop on TypeScript. Learn advanced types, generics, decorators, and how to use TypeScript in large projects.',
    image: undefined,
    category: 'workshop',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-03-01'),
    location: 'Innovation Hub',
    address: '789 Innovation Blvd',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    capacity: 75,
    currentAttendees: 62,
    price: 149,
    status: 'published',
    organizerId: 'user-2',
    organizer: mockUsers[1],
    tags: ['TypeScript', 'Programming', 'Advanced'],
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'event-5',
    name: 'AI & Machine Learning Conference 2025',
    description:
      'Explore the latest advancements in AI and ML. Keynotes from industry leaders, technical workshops, and networking opportunities.',
    image: undefined,
    category: 'conference',
    startDate: new Date('2025-04-10'),
    endDate: new Date('2025-04-12'),
    location: 'Los Angeles Convention Center',
    address: '1201 S Figueroa St',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90015',
    capacity: 1000,
    currentAttendees: 756,
    price: 399,
    status: 'published',
    organizerId: 'user-4',
    organizer: mockUsers[3],
    tags: ['AI', 'Machine Learning', 'Data Science'],
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'event-6',
    name: 'Startup Pitch Night',
    description:
      'Watch innovative startups pitch their ideas to investors. Network with founders, investors, and tech enthusiasts.',
    image: undefined,
    category: 'social',
    startDate: new Date('2025-02-25'),
    endDate: new Date('2025-02-25'),
    location: 'Downtown Venue',
    address: '321 Business Plaza',
    city: 'Boston',
    state: 'MA',
    zipCode: '02101',
    capacity: 200,
    currentAttendees: 145,
    price: 50,
    status: 'live',
    organizerId: 'user-2',
    organizer: mockUsers[1],
    tags: ['Startups', 'Pitch', 'Networking'],
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-15'),
  },
];

// Mock RSVPs
export const mockRsvps: Rsvp[] = [
  {
    id: 'rsvp-1',
    eventId: 'event-1',
    event: mockEvents[0],
    userId: 'user-1',
    user: mockUsers[0],
    status: 'going',
    plusOneCount: 1,
    dietaryPreferences: 'Vegetarian',
    checkInStatus: 'not_checked_in',
    rsvpDeadlineMet: true,
    isWaitlisted: false,
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'rsvp-2',
    eventId: 'event-1',
    event: mockEvents[0],
    userId: 'user-3',
    user: mockUsers[2],
    status: 'going',
    plusOneCount: 2,
    dietaryPreferences: 'Vegan',
    checkInStatus: 'checked_in',
    checkInTime: new Date('2025-03-15T09:30:00'),
    rsvpDeadlineMet: true,
    isWaitlisted: false,
    createdAt: new Date('2024-12-12'),
    updatedAt: new Date('2025-03-15'),
  },
  {
    id: 'rsvp-3',
    eventId: 'event-2',
    event: mockEvents[1],
    userId: 'user-1',
    user: mockUsers[0],
    status: 'going',
    plusOneCount: 1,
    dietaryPreferences: undefined,
    checkInStatus: 'not_checked_in',
    rsvpDeadlineMet: true,
    isWaitlisted: false,
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-05'),
  },
  {
    id: 'rsvp-4',
    eventId: 'event-3',
    event: mockEvents[2],
    userId: 'user-3',
    user: mockUsers[2],
    status: 'maybe',
    plusOneCount: 1,
    dietaryPreferences: undefined,
    checkInStatus: 'not_checked_in',
    rsvpDeadlineMet: true,
    isWaitlisted: false,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
  },
  {
    id: 'rsvp-5',
    eventId: 'event-4',
    event: mockEvents[3],
    userId: 'user-1',
    user: mockUsers[0],
    status: 'going',
    plusOneCount: 1,
    dietaryPreferences: 'Gluten-free',
    checkInStatus: 'not_checked_in',
    rsvpDeadlineMet: true,
    isWaitlisted: false,
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
  },
  {
    id: 'rsvp-6',
    eventId: 'event-5',
    event: mockEvents[4],
    userId: 'user-3',
    user: mockUsers[2],
    status: 'going',
    plusOneCount: 1,
    dietaryPreferences: undefined,
    checkInStatus: 'not_checked_in',
    rsvpDeadlineMet: true,
    isWaitlisted: false,
    createdAt: new Date('2024-11-20'),
    updatedAt: new Date('2024-11-20'),
  },
  {
    id: 'rsvp-7',
    eventId: 'event-6',
    event: mockEvents[5],
    userId: 'user-1',
    user: mockUsers[0],
    status: 'going',
    plusOneCount: 1,
    dietaryPreferences: undefined,
    checkInStatus: 'checked_in',
    checkInTime: new Date('2025-02-25T18:00:00'),
    rsvpDeadlineMet: true,
    isWaitlisted: false,
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date('2025-02-25'),
  },
];

// Mock waitlist entries
export const mockWaitlist: Waitlist[] = [
  {
    id: 'wl-1',
    eventId: 'event-2',
    rsvpId: 'rsvp-waitlist-1',
    userId: 'user-5',
    status: 'waiting',
    position: 1,
    createdAt: new Date('2025-02-20'),
    updatedAt: new Date('2025-02-20'),
  },
];

// Mock tickets for check-in
export const mockTickets: Ticket[] = [
  {
    id: 'tkt-1',
    rsvpId: 'rsvp-1',
    userId: 'user-1',
    eventId: 'event-1',
    checkInStatus: 'not_checked_in',
    createdAt: new Date('2024-12-10'),
  },
  {
    id: 'tkt-2',
    rsvpId: 'rsvp-2',
    userId: 'user-3',
    eventId: 'event-1',
    checkInStatus: 'checked_in',
    createdAt: new Date('2024-12-12'),
  },
];

// Mock custom questions
export const mockCustomQuestions: CustomQuestion[] = [
  {
    id: 'q-1',
    eventId: 'event-1',
    question: 'What is your dietary preference?',
    type: 'select',
    required: false,
    options: ['Vegetarian', 'Vegan', 'Gluten-free', 'None'],
    order: 1,
    createdAt: new Date('2024-12-01'),
  },
  {
    id: 'q-2',
    eventId: 'event-1',
    question: 'Will you be attending the networking dinner?',
    type: 'checkbox',
    required: false,
    order: 2,
    createdAt: new Date('2024-12-01'),
  },
];

// Notification templates
export const mockNotificationTemplates: NotificationTemplate[] = [
  {
    id: 'template-1',
    type: 'rsvp_confirmation',
    channel: 'email',
    subject: 'RSVP Confirmed - {{eventName}}',
    template: `Hi {{userName}},

Your RSVP for {{eventName}} has been confirmed! 

Event Details:
Date: {{eventDate}}
Time: {{eventTime}}
Location: {{eventLocation}}

Your ticket has been attached. Please keep it safe for check-in.

Thank you for confirming!
Best regards,
EventHub Team`,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'template-2',
    type: 'event_reminder',
    channel: 'email',
    subject: 'Reminder: {{eventName}} is tomorrow!',
    template: `Hi {{userName}},

This is a friendly reminder that {{eventName}} is happening tomorrow at {{eventTime}}!

Don't forget to bring your ticket. See you there!

Best regards,
EventHub Team`,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'template-3',
    type: 'event_update',
    channel: 'email',
    subject: 'Update: {{eventName}}',
    template: `Hi {{userName}},

There has been an important update to {{eventName}}:

{{updateContent}}

Please visit the event page for more details.

Best regards,
EventHub Team`,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'template-4',
    type: 'event_cancellation',
    channel: 'email',
    subject: 'Important: {{eventName}} has been cancelled',
    template: `Hi {{userName}},

Unfortunately, {{eventName}} scheduled for {{eventDate}} has been cancelled.

We apologize for any inconvenience. Your RSVP has been automatically updated.

Best regards,
EventHub Team`,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock notifications (in-app record of sent notifications)
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    eventId: 'event-1',
    rsvpId: 'rsvp-1',
    type: 'rsvp_confirmation',
    channel: 'email',
    status: 'sent',
    recipient: 'sarah@example.com',
    subject: 'RSVP Confirmed - Tech Conference 2025',
    content: 'Your RSVP has been confirmed. Check your email for your ticket.',
    sentAt: new Date('2024-12-10T10:00:00'),
    createdAt: new Date('2024-12-10T10:00:00'),
    updatedAt: new Date('2024-12-10T10:00:00'),
  },
  {
    id: 'notif-2',
    userId: 'user-3',
    eventId: 'event-1',
    rsvpId: 'rsvp-2',
    type: 'rsvp_confirmation',
    channel: 'email',
    status: 'sent',
    recipient: 'jordan@example.com',
    subject: 'RSVP Confirmed - Tech Conference 2025',
    content: 'Your RSVP has been confirmed. Check your email for your ticket.',
    sentAt: new Date('2024-12-12T10:00:00'),
    createdAt: new Date('2024-12-12T10:00:00'),
    updatedAt: new Date('2024-12-12T10:00:00'),
  },
];

// Backward compat aliases
export const mockRSVPs = mockRsvps;
export const MOCK_EVENTS = mockEvents;
