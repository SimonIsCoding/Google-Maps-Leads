import logger from './logger'

const SCRAPER_WEBHOOK_URL = process.env.SCRAPER_WEBHOOK_URL!
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000'
const MAX_RETRIES = 1 // Only try once, no retries
const RETRY_DELAY_MS = 2000

export interface ScraperRequest
{
  requestId: string
  query: string
  maxRows: number
  callbackUrl: string
}

export interface ScraperResponse
{
  success: boolean
  requestId: string
  error?: string
}

/**
 * Trigger external scraper service via webhook
 * Makes a single attempt - no retries on failure
 */
export async function triggerScraper(
  query: string,
  maxRows: number,
  requestId: string
): Promise<{ requestId: string }> {
  const callbackUrl = `${APP_BASE_URL}/api/webhook-return`

  const payload: ScraperRequest = {
    requestId,
    query,
    maxRows,
    callbackUrl,
  }

  logger.info({ requestId, query, maxRows }, 'Triggering external scraper')

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(SCRAPER_WEBHOOK_URL,
	  {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Scraper webhook returned status ${response.status}`)
      }

      const data = await response.json()

      logger.info(
        { requestId, response: data },
        'Scraper webhook triggered successfully'
      )

      return { requestId }
    } catch (error) {
      lastError = error as Error
      logger.error(
        { requestId, error: lastError.message },
        'Scraper webhook failed'
      )

      if (attempt < MAX_RETRIES) {
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt))
      }
    }
  }

  // Webhook failed
  logger.error(
    { requestId, error: lastError?.message },
    'Scraper webhook attempt failed'
  )

  throw new Error(`Failed to trigger scraper: ${lastError?.message}`)
}

/**
 * Validate webhook signature (if scraper sends one)
 * This is a placeholder - implement based on your scraper's auth mechanism
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // TODO: Implement signature validation based on your scraper's auth
  // Example: HMAC-SHA256 validation
  return true
}
