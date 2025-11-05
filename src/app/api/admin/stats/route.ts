import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import logger from '@/lib/logger'

/**
 * GET /api/admin/stats
 * Get platform statistics (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get statistics
    const [
      totalUsers,
      totalSearches,
      successfulSearches,
      failedSearches,
      pendingSearches,
      recentSearches,
      totalCreditsInCirculation,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.search.count(),
      prisma.search.count({ where: { status: 'SUCCESS' } }),
      prisma.search.count({ where: { status: 'FAILED' } }),
      prisma.search.count({ where: { status: 'PENDING' } }),
      prisma.search.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      }),
      prisma.user.aggregate({
        _sum: {
          credits: true,
        },
      }),
    ])

    return NextResponse.json({
      users: {
        total: totalUsers,
      },
      searches: {
        total: totalSearches,
        successful: successfulSearches,
        failed: failedSearches,
        pending: pendingSearches,
        recent: recentSearches,
      },
      credits: {
        totalInCirculation: totalCreditsInCirculation._sum.credits || 0,
      },
    })
  } catch (error: any) {
    logger.error({ error }, 'Failed to fetch admin stats')
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
