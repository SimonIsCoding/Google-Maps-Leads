'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Link from 'next/link'

interface Search {
  id: string
  requestId: string
  query: string
  maxRows: number
  status: string
  rowsReturned: number | null
  sheetUrl: string | null
  creditsUsed: number
  errorMessage: string | null
  createdAt: string
  completedAt: string | null
}

function NotificationHandler({ onNotification }: { onNotification: (notification: { type: 'success' | 'error', message: string } | null) => void }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for notifications from URL params
    const paymentStatus = searchParams.get('payment')
    const searchStatus = searchParams.get('search')

    if (paymentStatus === 'success') {
      onNotification({
        type: 'success',
        message: 'Payment successful! Credits have been added to your account.',
      })
    }

    if (searchStatus === 'pending') {
      onNotification({
        type: 'success',
        message: 'Search submitted! You will receive an email when results are ready.',
      })
    }

    // Auto-hide notification after 5 seconds
    if (paymentStatus || searchStatus) {
      setTimeout(() => onNotification(null), 5000)
    }
  }, [searchParams, onNotification])

  return null
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searches, setSearches] = useState<Search[]>([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSearches()
      // Poll for updates every 10 seconds
      const interval = setInterval(fetchSearches, 10000)
      return () => clearInterval(interval)
    }
  }, [status])

  const fetchSearches = async () => {
    try {
      const response = await fetch('/api/search')
      if (response.ok) {
        const data = await response.json()
        setSearches(data.searches)
      }
    } catch (error) {
      console.error('Failed to fetch searches:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SUCCESS: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <Suspense fallback={null}>
        <NotificationHandler onNotification={setNotification} />
      </Suspense>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {session.user.name || session.user.email}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Available Credits</p>
            <p className="text-3xl font-bold text-primary-600">{session.user.credits}</p>
            <Link
              href="/pricing"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Buy more credits
            </Link>
          </div>
        </div>

        {/* New Search Button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            + New Search
          </Link>
        </div>

        {/* Searches Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Search History</h2>
          </div>

          {searches.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-4">No searches yet</p>
              <Link
                href="/"
                className="text-primary-600 hover:text-primary-700"
              >
                Create your first search
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Query
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Results
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searches.map((search) => (
                    <tr key={search.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(search.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {search.query}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(search.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {search.rowsReturned !== null
                          ? `${search.rowsReturned}/${search.maxRows}`
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {search.creditsUsed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {search.status === 'SUCCESS' && search.sheetUrl ? (
                          <a
                            href={search.sheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700"
                          >
                            View Sheet
                          </a>
                        ) : search.status === 'FAILED' ? (
                          <span className="text-red-600" title={search.errorMessage || 'Unknown error'}>
                            Failed
                          </span>
                        ) : (
                          <span className="text-gray-400">Pending...</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
