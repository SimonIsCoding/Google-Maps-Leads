import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import logger from '@/lib/logger'
import { webhookReturnSchema } from '@/lib/validators'
import { deductCredits } from '@/lib/credits'
import { sendSearchCompletionEmail, sendSearchFailedEmail } from '@/lib/email'

/**
 * POST /api/webhook-return
 * Webhook endpoint for external scraper to return results
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json()

    logger.info({ body }, 'Webhook callback received')

    // Validate payload
    const { requestId, status, rowsReturned, sheetUrl, errorMessage } = webhookReturnSchema.parse(body)

    // Find search by requestId (idempotency check)
    const existingSearch = await prisma.search.findUnique({
      where: { requestId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            credits: true,
          },
        },
      },
    })

    if (!existingSearch) {
      logger.warn({ requestId }, 'Search not found for webhook callback')
      return NextResponse.json(
        { error: 'Search not found' },
        { status: 404 }
      )
    }

    // Idempotency: if already processed, return success
    if (existingSearch.status === 'SUCCESS' || existingSearch.status === 'FAILED') {
      logger.info({ requestId, currentStatus: existingSearch.status }, 'Webhook already processed (idempotent)')
      return NextResponse.json(
        { message: 'Webhook already processed' },
        { status: 200 }
      )
    }

    // Process based on status
    if (status === 'success') {
      // Update search as successful
      const updatedSearch = await prisma.search.update({
        where: { requestId },
        data: {
          status: 'SUCCESS',
          rowsReturned,
          sheetUrl,
          completedAt: new Date(),
        },
      })

      // Deduct credits from user (transactional)
      if (updatedSearch.creditsUsed > 0) {
        await deductCredits(
          existingSearch.userId,
          updatedSearch.creditsUsed,
          updatedSearch.id,
          `Credits used for search: ${updatedSearch.query}`
        )
      }

      logger.info(
        {
          requestId,
          searchId: updatedSearch.id,
          rowsReturned,
          creditsUsed: updatedSearch.creditsUsed,
        },
        'Search completed successfully'
      )

      // Send completion email (don't wait)
      if (sheetUrl && existingSearch.user.email) {
        sendSearchCompletionEmail(
          existingSearch.user.email,
          existingSearch.user.name || 'User',
          updatedSearch.query,
          sheetUrl
        ).catch((error) => {
          logger.error({ error, requestId }, 'Failed to send completion email')
        })
      }

      return NextResponse.json({
        message: 'Search completed successfully',
        searchId: updatedSearch.id,
      })
    } else {
      // Update search as failed
      const updatedSearch = await prisma.search.update({
        where: { requestId },
        data: {
          status: 'FAILED',
          errorMessage: errorMessage || 'Search failed',
          completedAt: new Date(),
          creditsUsed: 0, // Don't charge for failed searches
        },
      })

      logger.warn(
        {
          requestId,
          searchId: updatedSearch.id,
          errorMessage,
        },
        'Search failed'
      )

      // Send failure email (don't wait)
      if (existingSearch.user.email) {
        sendSearchFailedEmail(
          existingSearch.user.email,
          existingSearch.user.name || 'User',
          updatedSearch.query,
          errorMessage || 'Unknown error'
        ).catch((error) => {
          logger.error({ error, requestId }, 'Failed to send failure email')
        })
      }

      return NextResponse.json({
        message: 'Search failed',
        searchId: updatedSearch.id,
      })
    }
  } catch (error: any) {
    logger.error({ error }, 'Webhook processing failed')

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid webhook payload', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
