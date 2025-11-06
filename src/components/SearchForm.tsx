'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const ROW_OPTIONS = [5, 10, 25, 50, 100]

export default function SearchForm() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [maxRows, setMaxRows] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Check if user is logged in
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (!query.trim()) {
      setError('Please enter a search query')
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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create search')
      }

      // Success - redirect to dashboard
      router.push('/dashboard?search=pending')
    } catch (err: any) {
      setError(err.message || 'Failed to create search. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const creditsNeeded = maxRows > 10 ? maxRows - 10 : 0

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
          {ROW_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option} results {option <= 10 ? '(Free)' : ''}
            </option>
          ))}
        </select>
      </div>

      {creditsNeeded > 0 && (
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

      {status === 'unauthenticated' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Please sign in to start searching
          </p>
        </div>
      )}
    </form>
  )
}
