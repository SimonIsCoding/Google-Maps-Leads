import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import logger from '@/lib/logger'

/**
 * GET /api/search/status/[requestId]
 * Public endpoint to check search status by requestId
 * This allows guest users to check their search results
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { requestId } = params

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Find search by requestId
    const search = await prisma.search.findUnique({
      where: { requestId },
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
    })

    if (!search) {
      return NextResponse.json(
        { error: 'Search not found' },
        { status: 404 }
      )
    }

    logger.info({ requestId, status: search.status }, 'Search status checked')

    return NextResponse.json({
      search,
    })
  } catch (error: any) {
    logger.error({ error, requestId: params.requestId }, 'Failed to fetch search status')

    return NextResponse.json(
      { error: 'Failed to fetch search status' },
      { status: 500 }
    )
  }
}
