import { z } from 'zod';

/**
 * Validation schemas for forms and API requests
 *
 * Uses Zod for runtime validation with TypeScript type inference.
 * All schemas should be reused across frontend and backend.
 */

// ==================== Contact Form ====================

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  subject: z.enum(['general', 'sales_custom', 'support', 'partnership']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// ==================== Rate Limiting ====================

/**
 * Simple in-memory rate limit tracker
 *
 * For production, consider Redis-based rate limiting
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (e.g., IP address or email)
 * @param maxRequests - Maximum requests allowed in the time window
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limit exceeded, false otherwise
 */
export function isRateLimited(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Clean up expired entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  // No record or expired record
  if (!record || record.resetTime < now) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return false;
  }

  // Increment count
  record.count++;

  // Check if limit exceeded
  if (record.count > maxRequests) {
    return true;
  }

  return false;
}

/**
 * Get rate limit status for an identifier
 */
export function getRateLimitStatus(identifier: string): {
  limited: boolean;
  remaining: number;
  resetTime: number;
} {
  const record = rateLimitMap.get(identifier);
  const now = Date.now();

  if (!record || record.resetTime < now) {
    return { limited: false, remaining: 5, resetTime: now + 60000 };
  }

  return {
    limited: record.count > 5,
    remaining: Math.max(0, 5 - record.count),
    resetTime: record.resetTime,
  };
}
