import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import logger from '@/lib/logger'
import { searchSchema } from '@/lib/validators'
import { calculateCreditsNeeded, hasEnoughCredits } from '@/lib/credits'
import { triggerScraper } from '@/lib/scraper'
import { rateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { v4 as uuidv4 } from 'uuid'

const GUEST_USER_EMAIL = 'guest@mapscraperhub.system'
const GUEST_MAX_ROWS = 10

/**
 * Get or create the guest user for unauthenticated searches
 */
async function getGuestUser() {
  let guestUser = await prisma.user.findUnique({
    where: { email: GUEST_USER_EMAIL },
  })

  if (!guestUser) {
    // Create guest user if doesn't exist
    guestUser = await prisma.user.create({
      data: {
        email: GUEST_USER_EMAIL,
        name: 'Guest User',
        credits: 999999, // Unlimited credits for guest (they're limited by rows anyway)
        role: 'USER',
      },
    })
    logger.info({ guestUserId: guestUser.id }, 'Guest user created')
  }

  return guestUser
}

/**
 * POST /api/search
 * Create a new search request
 * Supports both authenticated and guest (unauthenticated) searches
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    // Determine if this is a guest or authenticated user
    const isGuest = !session || !session.user
    let userId: string

    if (isGuest) {
      // Get or create guest user
      const guestUser = await getGuestUser()
      userId = guestUser.id
      logger.info({ userId }, 'Guest search request')
    } else {
      userId = session.user.id
    }

    // Rate limiting
    const rateLimitResult = rateLimit(getRateLimitIdentifier(req, userId))

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          resetTime: rateLimitResult.resetTime,
        },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await req.json()
    let { query, maxRows } = searchSchema.parse(body)

    // For guest users, limit to GUEST_MAX_ROWS
    if (isGuest && maxRows > GUEST_MAX_ROWS) {
      return NextResponse.json(
        {
          error: `Guest searches are limited to ${GUEST_MAX_ROWS} rows. Please sign up for unlimited searches.`,
          maxRowsAllowed: GUEST_MAX_ROWS,
          redirectTo: '/auth/register',
        },
        { status: 403 } // Forbidden
      )
    }

    logger.info({ userId, query, maxRows, isGuest }, 'Search request received')

    // Calculate credits needed (guests don't pay credits, but we track it)
    const creditsNeeded = isGuest ? 0 : calculateCreditsNeeded(maxRows)

    // Check if authenticated user has enough credits
    if (!isGuest && creditsNeeded > 0) {
      const hasSufficientCredits = await hasEnoughCredits(userId, creditsNeeded)

      if (!hasSufficientCredits) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { credits: true },
        })

        return NextResponse.json(
          {
            error: 'Insufficient credits',
            creditsNeeded,
            creditsAvailable: user?.credits || 0,
            redirectTo: '/pricing',
          },
          { status: 402 } // Payment Required
        )
      }
    }

    // Generate requestId first
    const requestId = uuidv4()

    // Create search record with PENDING status BEFORE triggering scraper
    // This ensures the record exists when the callback arrives
    const search = await prisma.search.create({
      data: {
        userId,
        requestId,
        query,
        maxRows,
        status: 'PENDING',
        creditsUsed: creditsNeeded, // Store expected credits (will be deducted on success)
      },
    })

    // Now trigger external scraper (async, but record is already in DB)
    triggerScraper(query, maxRows, requestId).catch((error) => {
      logger.error({ error, requestId, searchId: search.id }, 'Failed to trigger scraper')
      // Update search status to FAILED if webhook fails
      prisma.search.update({
        where: { id: search.id },
        data: { status: 'FAILED', errorMessage: 'Failed to trigger scraper' },
      }).catch((err) => logger.error({ err }, 'Failed to update search status'))
    })

    logger.info(
      { userId, searchId: search.id, requestId, creditsNeeded },
      'Search created successfully'
    )

    return NextResponse.json(
      {
        searchId: search.id,
        requestId: search.requestId,
        status: search.status,
        creditsNeeded,
        isGuest,
        message: isGuest
          ? 'Free trial search submitted! Sign up to access more features.'
          : 'Search request submitted successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    logger.error({ error }, 'Search request failed')

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create search request' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/search
 * Get user's search history
 */
export async function GET(req: NextRequest) {
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
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Get searches
    const [searches, total] = await Promise.all([
      prisma.search.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          requestId: true,
          query: true,
          maxRows: true,
          status: true,
          rowsReturned: true,
          sheetUrl: true,
          creditsUsed: true,
          errorMessage: true,
          createdAt: true,
          completedAt: true,
        },
      }),
      prisma.search.count({
        where: { userId },
      }),
    ])

    return NextResponse.json({
      searches,
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    logger.error({ error }, 'Failed to fetch searches')

    return NextResponse.json(
      { error: 'Failed to fetch searches' },
      { status: 500 }
    )
  }
}
