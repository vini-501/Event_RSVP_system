import { z } from 'zod';
import { ValidationError } from './errors';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['attendee', 'organizer']).default('attendee'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const baseEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['conference', 'workshop', 'meetup', 'social', 'networking', 'other']),
  location: z.string().min(3, 'Location is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  startDateTime: z.string().datetime('Invalid start date/time'),
  endDateTime: z.string().datetime('Invalid end date/time'),
  imageUrl: z.string().url().optional(),
  rsvpDeadline: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  price: z.number().min(0).optional(),
});

export const createEventSchema = baseEventSchema.refine(data => new Date(data.endDateTime) > new Date(data.startDateTime), {
  message: 'End date must be after start date',
  path: ['endDateTime'],
});

export const updateEventSchema = baseEventSchema.partial();

export const createRsvpSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  status: z.enum(['going', 'maybe', 'not_going']).default('going'),
  plusOneCount: z.number().min(0).max(5).default(0),
  dietaryPreferences: z.string().optional(),
});

export const updateRsvpSchema = z.object({
  status: z.enum(['going', 'maybe', 'not_going']),
  plusOneCount: z.number().min(0).max(5).optional(),
  dietaryPreferences: z.string().optional(),
});

export const checkInSchema = z.object({
  checkInTimestamp: z.string().datetime('Invalid check-in timestamp'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export async function validateRequest<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {} as Record<string, string>);
      throw new ValidationError('Validation failed', details);
    }
    throw error;
  }
}
