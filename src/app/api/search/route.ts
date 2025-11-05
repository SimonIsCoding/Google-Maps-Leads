import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import logger from '@/lib/logger'
import { searchSchema } from '@/lib/validators'
import { calculateCreditsNeeded, hasEnoughCredits } from '@/lib/credits'
import { triggerScraper } from '@/lib/scraper'
import { rateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'

/**
 * POST /api/search
 * Create a new search request
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
    const { query, maxRows } = searchSchema.parse(body)

    logger.info({ userId, query, maxRows }, 'Search request received')

    // Calculate credits needed
    const creditsNeeded = calculateCreditsNeeded(maxRows)

    // Check if user has enough credits
    if (creditsNeeded > 0) {
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

    // Trigger external scraper
    const { requestId } = await triggerScraper(query, maxRows)

    // Create search record with PENDING status
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
        message: 'Search request submitted successfully',
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
