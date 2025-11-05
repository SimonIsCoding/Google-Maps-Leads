import { z } from 'zod'

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(500, 'Search query is too long'),
  maxRows: z.number().int().positive().min(5).max(100),
})

export const webhookReturnSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
  status: z.enum(['success', 'failed']),
  rowsReturned: z.number().int().nonnegative().optional(),
  sheetUrl: z.string().url().optional(),
  errorMessage: z.string().optional(),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type SearchInput = z.infer<typeof searchSchema>
export type WebhookReturnInput = z.infer<typeof webhookReturnSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
