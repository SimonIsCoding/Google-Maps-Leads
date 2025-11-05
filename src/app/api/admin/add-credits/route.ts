import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addCredits } from '@/lib/credits'
import logger from '@/lib/logger'
import { z } from 'zod'
import { TransactionType } from '@prisma/client'

const addCreditsSchema = z.object({
  userId: z.string(),
  credits: z.number().int().positive(),
  description: z.string().optional(),
})

/**
 * POST /api/admin/add-credits
 * Add credits to a user account (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { userId, credits, description } = addCreditsSchema.parse(body)

    const desc = description || `Admin credit: ${credits} credits added by ${session.user.email}`

    await addCredits(userId, credits, TransactionType.ADMIN_CREDIT, desc)

    logger.info(
      { adminId: session.user.id, userId, credits },
      'Credits added by admin'
    )

    return NextResponse.json({
      message: 'Credits added successfully',
      userId,
      credits,
    })
  } catch (error: any) {
    logger.error({ error }, 'Failed to add credits')

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to add credits' },
      { status: 500 }
    )
  }
}
