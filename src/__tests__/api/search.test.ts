import { POST, GET } from '@/app/api/search/route'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { triggerScraper } from '@/lib/scraper'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('next-auth')
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    search: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))
jest.mock('@/lib/scraper')

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockTriggerScraper = triggerScraper as jest.MockedFunction<typeof triggerScraper>

describe('POST /api/search', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should reject unauthenticated requests', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/search', {
      method: 'POST',
      body: JSON.stringify({
        query: 'bakery Paris',
        maxRows: 10,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should create search for authenticated user with sufficient credits', async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
        credits: 50,
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    })

    mockTriggerScraper.mockResolvedValue({
      requestId: 'request-123',
    })

    const mockUser = {
      id: 'user-123',
      credits: 50,
    }

    const mockSearch = {
      id: 'search-123',
      userId: 'user-123',
      requestId: 'request-123',
      query: 'bakery Paris',
      maxRows: 25,
      status: 'PENDING',
      creditsUsed: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(prisma.search.create as jest.Mock).mockResolvedValue(mockSearch)

    const request = new NextRequest('http://localhost:3000/api/search', {
      method: 'POST',
      body: JSON.stringify({
        query: 'bakery Paris',
        maxRows: 25,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.searchId).toBe('search-123')
    expect(data.creditsNeeded).toBe(15)
    expect(mockTriggerScraper).toHaveBeenCalledWith('bakery Paris', 25)
  })

  it('should reject search when user has insufficient credits', async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
        credits: 5,
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    })

    const mockUser = {
      id: 'user-123',
      credits: 5,
    }

    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost:3000/api/search', {
      method: 'POST',
      body: JSON.stringify({
        query: 'bakery Paris',
        maxRows: 50,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(402)
    expect(data.error).toBe('Insufficient credits')
    expect(data.creditsNeeded).toBe(40)
    expect(data.creditsAvailable).toBe(5)
  })

  it('should allow free searches with 10 or fewer rows', async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
        credits: 0,
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    })

    mockTriggerScraper.mockResolvedValue({
      requestId: 'request-123',
    })

    const mockSearch = {
      id: 'search-123',
      userId: 'user-123',
      requestId: 'request-123',
      query: 'bakery Paris',
      maxRows: 10,
      status: 'PENDING',
      creditsUsed: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    ;(prisma.search.create as jest.Mock).mockResolvedValue(mockSearch)

    const request = new NextRequest('http://localhost:3000/api/search', {
      method: 'POST',
      body: JSON.stringify({
        query: 'bakery Paris',
        maxRows: 10,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.creditsNeeded).toBe(0)
  })
})

describe('GET /api/search', () => {
  it('should return user search history', async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
        credits: 50,
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    })

    const mockSearches = [
      {
        id: 'search-1',
        requestId: 'request-1',
        query: 'bakery Paris',
        maxRows: 25,
        status: 'SUCCESS',
        rowsReturned: 25,
        sheetUrl: 'https://example.com/sheet',
        creditsUsed: 15,
        errorMessage: null,
        createdAt: new Date(),
        completedAt: new Date(),
      },
    ]

    ;(prisma.search.findMany as jest.Mock).mockResolvedValue(mockSearches)
    ;(prisma.search.count as jest.Mock).mockResolvedValue(1)

    const request = new NextRequest('http://localhost:3000/api/search')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.searches).toHaveLength(1)
    expect(data.total).toBe(1)
  })
})
