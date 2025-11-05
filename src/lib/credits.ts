import prisma from './prisma'
import logger from './logger'
import { TransactionType } from '@prisma/client'

const FREE_ROWS = 10

/**
 * Calculate credits needed for a search
 * First 10 rows are free, then 1 credit per row
 */
export function calculateCreditsNeeded(maxRows: number): number {
  if (maxRows <= FREE_ROWS) {
    return 0
  }
  return maxRows - FREE_ROWS
}

/**
 * Check if user has enough credits for a search
 */
export async function hasEnoughCredits(userId: string, creditsNeeded: number): Promise<boolean> {
  if (creditsNeeded === 0) return true

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user.credits >= creditsNeeded
}

/**
 * Deduct credits from user account (transactional)
 * Creates a transaction record and updates user credits
 */
export async function deductCredits(
  userId: string,
  creditsToDeduct: number,
  searchId: string,
  description: string
): Promise<void> {
  if (creditsToDeduct === 0) return

  try {
    await prisma.$transaction(async (tx) => {
      // Get current user credits with lock
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      })

      if (!user) {
        throw new Error('User not found')
      }

      if (user.credits < creditsToDeduct) {
        throw new Error('Insufficient credits')
      }

      // Update user credits
      await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: creditsToDeduct,
          },
        },
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.USAGE,
          amount: -creditsToDeduct,
          description,
          searchId,
        },
      })

      logger.info({ userId, creditsToDeduct, searchId }, 'Credits deducted successfully')
    })
  } catch (error) {
    logger.error({ error, userId, creditsToDeduct }, 'Failed to deduct credits')
    throw error
  }
}

/**
 * Add credits to user account (transactional)
 * Used for purchases and admin credits
 */
export async function addCredits(
  userId: string,
  creditsToAdd: number,
  type: TransactionType,
  description: string,
  stripeSessionId?: string
): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      // Update user credits
      await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: creditsToAdd,
          },
        },
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          type,
          amount: creditsToAdd,
          description,
          stripeSessionId,
        },
      })

      logger.info({ userId, creditsToAdd, type }, 'Credits added successfully')
    })
  } catch (error) {
    logger.error({ error, userId, creditsToAdd }, 'Failed to add credits')
    throw error
  }
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user.credits
}
