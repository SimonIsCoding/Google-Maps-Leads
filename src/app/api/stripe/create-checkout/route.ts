import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCheckoutSession } from '@/lib/stripe'
import logger from '@/lib/logger'
import { z } from 'zod'

const checkoutSchema = z.object({
  packageId: z.string(),
})

/**
 * POST /api/stripe/create-checkout
 * Create a Stripe checkout session for credit purchase
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const userEmail = session.user.email

    // Parse request body
    const body = await req.json()
    const { packageId } = checkoutSchema.parse(body)

    const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000'
    const successUrl = `${appBaseUrl}/dashboard?payment=success`
    const cancelUrl = `${appBaseUrl}/pricing?payment=cancelled`

    // Create Stripe checkout session
    const checkoutUrl = await createCheckoutSession(
      userId,
      userEmail,
      packageId,
      successUrl,
      cancelUrl
    )

    logger.info({ userId, packageId }, 'Checkout session created')

    return NextResponse.json({
      url: checkoutUrl,
    })
  } catch (error: any) {
    logger.error({ error }, 'Failed to create checkout session')

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
