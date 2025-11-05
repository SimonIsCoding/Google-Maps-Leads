'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in.'
      case 'Verification':
        return 'The verification token has expired or has already been used.'
      default:
        return 'An error occurred during authentication.'
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow text-center">
      <div className="text-red-600 text-6xl mb-4">⚠️</div>
      <h1 className="text-3xl font-bold mb-4">Authentication Error</h1>
      <p className="text-gray-600 mb-8">{getErrorMessage(error)}</p>
      <Link
        href="/auth/signin"
        className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
      >
        Try Again
      </Link>
    </div>
  )
}

export default function AuthError() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Suspense fallback={
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="animate-pulse">
              <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-8"></div>
            </div>
          </div>
        }>
          <ErrorContent />
        </Suspense>
      </main>
    </div>
  )
}
