import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { verifyWebhookSignature, getCreditPackageByPriceId } from '@/lib/stripe'
import { addCredits } from '@/lib/credits'
import logger from '@/lib/logger'
import { TransactionType } from '@prisma/client'

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 */
export async function POST(req: NextRequest) {
  try {
    // Get raw body
    const body = await req.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      logger.warn('Missing Stripe signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature, STRIPE_WEBHOOK_SECRET)

    logger.info({ eventType: event.type, eventId: event.id }, 'Stripe webhook received')

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Extract metadata
        const userId = session.metadata?.userId
        const packageId = session.metadata?.packageId
        const credits = parseInt(session.metadata?.credits || '0', 10)

        if (!userId || !packageId || !credits) {
          logger.error({ session }, 'Missing metadata in checkout session')
          return NextResponse.json(
            { error: 'Missing metadata' },
            { status: 400 }
          )
        }

        // Verify payment was successful
        if (session.payment_status !== 'paid') {
          logger.warn(
            { sessionId: session.id, paymentStatus: session.payment_status },
            'Payment not completed'
          )
          return NextResponse.json({ received: true })
        }

        // Add credits to user account (idempotent based on stripeSessionId)
        try {
          await addCredits(
            userId,
            credits,
            TransactionType.PURCHASE,
            `Purchased ${credits} credits - ${packageId}`,
            session.id
          )

          logger.info(
            { userId, credits, sessionId: session.id },
            'Credits added successfully from Stripe payment'
          )
        } catch (error: any) {
          // Check if this is a duplicate (idempotency)
          if (error.code === 'P2002') {
            logger.info({ sessionId: session.id }, 'Duplicate webhook event (idempotent)')
            return NextResponse.json({ received: true })
          }
          throw error
        }

        break
      }

      case 'checkout.session.async_payment_succeeded': {
        // Handle async payment methods (like SEPA debit)
        const session = event.data.object as Stripe.Checkout.Session

        const userId = session.metadata?.userId
        const packageId = session.metadata?.packageId
        const credits = parseInt(session.metadata?.credits || '0', 10)

        if (!userId || !packageId || !credits) {
          logger.error({ session }, 'Missing metadata in async payment session')
          return NextResponse.json(
            { error: 'Missing metadata' },
            { status: 400 }
          )
        }

        try {
          await addCredits(
            userId,
            credits,
            TransactionType.PURCHASE,
            `Purchased ${credits} credits - ${packageId} (async)`,
            session.id
          )

          logger.info(
            { userId, credits, sessionId: session.id },
            'Credits added from async payment'
          )
        } catch (error: any) {
          if (error.code === 'P2002') {
            logger.info({ sessionId: session.id }, 'Duplicate async payment event')
            return NextResponse.json({ received: true })
          }
          throw error
        }

        break
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session
        logger.warn({ sessionId: session.id }, 'Async payment failed')
        // Optionally notify user
        break
      }

      default:
        logger.info({ eventType: event.type }, 'Unhandled Stripe event type')
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    logger.error({ error }, 'Stripe webhook processing failed')

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
