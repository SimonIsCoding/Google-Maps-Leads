import { NextRequest, NextResponse } from 'next/server'
import logger from '@/lib/logger'

/**
 * Mock scraper endpoint for development
 * This simulates the external scraper service
 *
 * In production, this endpoint should be removed or disabled
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Mock scraper is disabled in production' },
      { status: 403 }
    )
  }

  try {
    const body = await req.json()
    const { requestId, query, maxRows, callbackUrl } = body

    logger.info(
      { requestId, query, maxRows, callbackUrl },
      'Mock scraper received request'
    )

    // Simulate processing delay (2-5 seconds)
    const delay = Math.floor(Math.random() * 3000) + 2000

    setTimeout(async () => {
      // Simulate 90% success rate
      const isSuccess = Math.random() > 0.1

      const callbackPayload = isSuccess
        ? {
            requestId,
            status: 'success',
            rowsReturned: Math.min(maxRows, Math.floor(Math.random() * maxRows) + 1),
            sheetUrl: `https://docs.google.com/spreadsheets/d/mock-${requestId}`,
          }
        : {
            requestId,
            status: 'failed',
            errorMessage: 'Mock scraper simulated failure',
          }

      logger.info(
        { requestId, callbackPayload },
        'Mock scraper sending callback'
      )

      // Send callback
      try {
        await fetch(callbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(callbackPayload),
        })
      } catch (error) {
        logger.error({ error, requestId }, 'Mock scraper callback failed')
      }
    }, delay)

    return NextResponse.json({
      success: true,
      requestId,
      message: `Mock scraper will process in ${delay}ms`,
    })
  } catch (error) {
    logger.error({ error }, 'Mock scraper error')
    return NextResponse.json(
      { error: 'Mock scraper failed' },
      { status: 500 }
    )
  }
}
