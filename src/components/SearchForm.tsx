'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ROW_OPTIONS = [5, 10, 25, 50, 100]
const GUEST_MAX_ROWS = 10
const POLL_INTERVAL = 5000 // 5 seconds

interface SearchResult {
  requestId: string
  query: string
  status: string
  sheetUrl?: string
  errorMessage?: string
  rowsReturned?: number
}

export default function SearchForm() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [maxRows, setMaxRows] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [polling, setPolling] = useState(false)

  const isGuest = status === 'unauthenticated'
  const maxRowsAllowed = isGuest ? GUEST_MAX_ROWS : 100

  // Poll for search status
  useEffect(() => {
    if (!result || !polling) return

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/search/status/${result.requestId}`)
        if (!response.ok) return

        const data = await response.json()
        const updatedSearch = data.search

        setResult({
          requestId: updatedSearch.requestId,
          query: updatedSearch.query,
          status: updatedSearch.status,
          sheetUrl: updatedSearch.sheetUrl,
          errorMessage: updatedSearch.errorMessage,
          rowsReturned: updatedSearch.rowsReturned,
        })

        // Stop polling if completed or failed
        if (updatedSearch.status === 'SUCCESS' || updatedSearch.status === 'FAILED') {
          setPolling(false)
        }
      } catch (err) {
        console.error('Failed to poll search status:', err)
      }
    }

    const intervalId = setInterval(pollStatus, POLL_INTERVAL)
    return () => clearInterval(intervalId)
  }, [result, polling])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!query.trim()) {
      setError('Please enter a search query')
      return
    }

    // For guests, enforce max rows limit
    if (isGuest && maxRows > GUEST_MAX_ROWS) {
      setError(`Guest searches are limited to ${GUEST_MAX_ROWS} rows. Please sign up for more!`)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          maxRows,
        }),
      })

      const data = await response.json()

      if (response.status === 402) {
        // Insufficient credits - redirect to pricing
        router.push(`/pricing?needed=${data.creditsNeeded}&available=${data.creditsAvailable}`)
        return
      }

      if (response.status === 403 && data.redirectTo) {
        // Guest trying to exceed limits
        setError(data.error)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create search')
      }

      // Success - show result for guests, redirect for authenticated users
      if (data.isGuest) {
        setResult({
          requestId: data.requestId,
          query: query.trim(),
          status: 'PENDING',
        })
        setPolling(true)
      } else {
        // Authenticated users go to dashboard
        router.push('/dashboard?search=pending')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create search. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleNewSearch = () => {
    setResult(null)
    setQuery('')
    setMaxRows(10)
    setError('')
    setPolling(false)
  }

  const creditsNeeded = maxRows > 10 ? maxRows - 10 : 0

  // If showing result, render result view
  if (result) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {result.status === 'SUCCESS' ? '✅ Search Complete!' : result.status === 'FAILED' ? '❌ Search Failed' : '⏳ Processing...'}
          </h3>
          <p className="text-gray-600">
            Query: <strong>{result.query}</strong>
          </p>
        </div>

        {result.status === 'PENDING' && (
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <svg className="animate-spin h-12 w-12 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-center text-gray-600">
              We're scraping Google Maps for your results... This usually takes 30-60 seconds.
            </p>
          </div>
        )}

        {result.status === 'SUCCESS' && result.sheetUrl && (
          <div className="mb-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
              <p className="text-green-800 mb-4">
                🎉 Your Google Sheet is ready with <strong>{result.rowsReturned}</strong> results!
              </p>
              <a
                href={result.sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                📊 Open Google Sheet
              </a>
            </div>
          </div>
        )}

        {result.status === 'FAILED' && (
          <div className="mb-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800">
                {result.errorMessage || 'Something went wrong. Please try again.'}
              </p>
            </div>
          </div>
        )}

        {isGuest && result.status === 'SUCCESS' && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 text-center mb-3">
              💡 <strong>Want more?</strong> Sign up for free to get unlimited searches and track your history!
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/auth/signup"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition text-sm"
              >
                Sign Up Free
              </Link>
              <Link
                href="/auth/signin"
                className="bg-white text-primary-600 border-2 border-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-primary-50 transition text-sm"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleNewSearch}
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            ← Start New Search
          </button>
        </div>
      </div>
    )
  }

  // Regular search form
  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
      <div className="mb-6">
        <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
          Search Query
        </label>
        <div className="flex">
          <input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., bakery Paris 11"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-primary-600 text-white px-6 py-3 rounded-r-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </span>
            ) : (
              '🔍 Search'
            )}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="maxRows" className="block text-sm font-medium text-gray-700 mb-2">
          Number of Results
        </label>
        <select
          id="maxRows"
          value={maxRows}
          onChange={(e) => setMaxRows(parseInt(e.target.value))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          disabled={loading}
        >
          {ROW_OPTIONS.filter(option => option <= maxRowsAllowed).map((option) => (
            <option key={option} value={option}>
              {option} results {option <= 10 ? '(Free)' : ''}
            </option>
          ))}
        </select>
        {isGuest && (
          <p className="text-xs text-gray-500 mt-1">
            Guest users limited to {GUEST_MAX_ROWS} results. <Link href="/auth/signup" className="text-primary-600 hover:underline">Sign up</Link> for more!
          </p>
        )}
      </div>

      {!isGuest && creditsNeeded > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 This search will use <strong>{creditsNeeded} credits</strong>
            {session && (
              <span>
                {' '}
                (You have <strong>{session.user.credits}</strong> credits)
              </span>
            )}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {isGuest && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✨ <strong>Try it free!</strong> No sign-up required for your first search.
          </p>
        </div>
      )}
    </form>
  )
}
