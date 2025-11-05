import { NextRequest } from 'next/server'
import logger from './logger'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10)
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10)

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */
export function rateLimit(identifier: string): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const userLimit = store[identifier]

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpired()
  }

  if (!userLimit || now > userLimit.resetTime) {
    // First request or window expired
    store[identifier] = {
      count: 1,
      resetTime: now + WINDOW_MS,
    }
    return {
      success: true,
      remaining: MAX_REQUESTS - 1,
      resetTime: store[identifier].resetTime,
    }
  }

  if (userLimit.count >= MAX_REQUESTS) {
    // Rate limit exceeded
    logger.warn({ identifier, count: userLimit.count }, 'Rate limit exceeded')
    return {
      success: false,
      remaining: 0,
      resetTime: userLimit.resetTime,
    }
  }

  // Increment counter
  userLimit.count++

  return {
    success: true,
    remaining: MAX_REQUESTS - userLimit.count,
    resetTime: userLimit.resetTime,
  }
}

function cleanupExpired() {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (now > store[key].resetTime) {
      delete store[key]
    }
  })
}

/**
 * Get rate limit identifier from request
 */
export function getRateLimitIdentifier(req: NextRequest, userId?: string): string {
  if (userId) return `user:${userId}`

  // Use IP address as fallback
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}
