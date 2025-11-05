import Stripe from 'stripe'
import logger from './logger'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number // in cents
  priceId: string
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'pack-100',
    name: '100 Credits',
    credits: 100,
    price: 1000, // $10.00
    priceId: process.env.STRIPE_PRICE_ID_100_CREDITS || 'price_100',
  },
  {
    id: 'pack-500',
    name: '500 Credits',
    credits: 500,
    price: 4000, // €40.00 (20% discount)
    priceId: process.env.STRIPE_PRICE_ID_500_CREDITS || 'price_500',
  },
  {
    id: 'pack-1000',
    name: '1000 Credits',
    credits: 1000,
    price: 7000, // €70.00 (30% discount)
    priceId: process.env.STRIPE_PRICE_ID_1000_CREDITS || 'price_1000',
  },
]

/**
 * Create a Stripe checkout session for credit purchase
 */
export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  packageId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const creditPackage = CREDIT_PACKAGES.find((pkg) => pkg.id === packageId)

  if (!creditPackage) {
    throw new Error('Invalid credit package')
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: userEmail,
      line_items: [
        {
          price: creditPackage.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        packageId: creditPackage.id,
        credits: creditPackage.credits.toString(),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    logger.info({ userId, packageId, sessionId: session.id }, 'Checkout session created')

    return session.url!
  } catch (error) {
    logger.error({ error, userId, packageId }, 'Failed to create checkout session')
    throw error
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (error) {
    logger.error({ error }, 'Webhook signature verification failed')
    throw error
  }
}

/**
 * Get credit package by price ID
 */
export function getCreditPackageByPriceId(priceId: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((pkg) => pkg.priceId === priceId)
}
