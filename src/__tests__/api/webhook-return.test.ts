import { POST } from '@/app/api/webhook-return/route'
import prisma from '@/lib/prisma'
import { deductCredits } from '@/lib/credits'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    search: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))
jest.mock('@/lib/credits')
jest.mock('@/lib/email')

const mockDeductCredits = deductCredits as jest.MockedFunction<typeof deductCredits>

describe('POST /api/webhook-return', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should process successful webhook and deduct credits', async () => {
    const mockSearch = {
      id: 'search-123',
      userId: 'user-123',
      requestId: 'request-123',
      query: 'bakery Paris',
      maxRows: 25,
      status: 'PENDING',
      creditsUsed: 15,
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        credits: 50,
      },
    }

    const updatedSearch = {
      ...mockSearch,
      status: 'SUCCESS',
      rowsReturned: 25,
      sheetUrl: 'https://docs.google.com/spreadsheets/d/abc123',
      completedAt: new Date(),
    }

    ;(prisma.search.findUnique as jest.Mock).mockResolvedValue(mockSearch)
    ;(prisma.search.update as jest.Mock).mockResolvedValue(updatedSearch)
    mockDeductCredits.mockResolvedValue()

    const request = new NextRequest('http://localhost:3000/api/webhook-return', {
      method: 'POST',
      body: JSON.stringify({
        requestId: 'request-123',
        status: 'success',
        rowsReturned: 25,
        sheetUrl: 'https://docs.google.com/spreadsheets/d/abc123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Search completed successfully')
    expect(mockDeductCredits).toHaveBeenCalledWith(
      'user-123',
      15,
      'search-123',
      'Credits used for search: bakery Paris'
    )
  })

  it('should process failed webhook without deducting credits', async () => {
    const mockSearch = {
      id: 'search-123',
      userId: 'user-123',
      requestId: 'request-123',
      query: 'bakery Paris',
      maxRows: 25,
      status: 'PENDING',
      creditsUsed: 15,
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        credits: 50,
      },
    }

    const updatedSearch = {
      ...mockSearch,
      status: 'FAILED',
      errorMessage: 'Scraping failed',
      completedAt: new Date(),
      creditsUsed: 0,
    }

    ;(prisma.search.findUnique as jest.Mock).mockResolvedValue(mockSearch)
    ;(prisma.search.update as jest.Mock).mockResolvedValue(updatedSearch)

    const request = new NextRequest('http://localhost:3000/api/webhook-return', {
      method: 'POST',
      body: JSON.stringify({
        requestId: 'request-123',
        status: 'failed',
        errorMessage: 'Scraping failed',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Search failed')
    expect(mockDeductCredits).not.toHaveBeenCalled()
  })

  it('should be idempotent - ignore duplicate webhook callbacks', async () => {
    const mockSearch = {
      id: 'search-123',
      userId: 'user-123',
      requestId: 'request-123',
      query: 'bakery Paris',
      maxRows: 25,
      status: 'SUCCESS', // Already processed
      rowsReturned: 25,
      sheetUrl: 'https://docs.google.com/spreadsheets/d/abc123',
      creditsUsed: 15,
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        credits: 35,
      },
    }

    ;(prisma.search.findUnique as jest.Mock).mockResolvedValue(mockSearch)

    const request = new NextRequest('http://localhost:3000/api/webhook-return', {
      method: 'POST',
      body: JSON.stringify({
        requestId: 'request-123',
        status: 'success',
        rowsReturned: 25,
        sheetUrl: 'https://docs.google.com/spreadsheets/d/abc123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Webhook already processed')
    expect(prisma.search.update).not.toHaveBeenCalled()
    expect(mockDeductCredits).not.toHaveBeenCalled()
  })

  it('should return 404 for unknown requestId', async () => {
    ;(prisma.search.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/webhook-return', {
      method: 'POST',
      body: JSON.stringify({
        requestId: 'unknown-request',
        status: 'success',
        rowsReturned: 25,
        sheetUrl: 'https://docs.google.com/spreadsheets/d/abc123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Search not found')
  })

  it('should validate webhook payload schema', async () => {
    const request = new NextRequest('http://localhost:3000/api/webhook-return', {
      method: 'POST',
      body: JSON.stringify({
        requestId: 'invalid-uuid',
        status: 'invalid-status',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid webhook payload')
  })
})
