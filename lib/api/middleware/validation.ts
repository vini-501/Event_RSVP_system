import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ValidationError } from '../utils/errors';

export async function parseRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return await schema.parseAsync(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {} as Record<string, string>);
      throw new ValidationError('Request validation failed', details);
    }
    throw error;
  }
}

export function validateQueryParam(
  searchParams: URLSearchParams,
  key: string,
  required: boolean = false,
  schema?: z.ZodSchema
): any {
  const value = searchParams.get(key);
  
  if (required && !value) {
    throw new ValidationError(`Query parameter '${key}' is required`);
  }

  if (value && schema) {
    try {
      return schema.parse(value);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(`Invalid query parameter '${key}': ${error.errors[0].message}`);
      }
      throw error;
    }
  }

  return value;
}
