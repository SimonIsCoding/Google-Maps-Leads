'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Link from 'next/link'

const CREDIT_PACKAGES = [
  {
    id: 'pack-100',
    name: '100 Credits',
    credits: 100,
    price: 10,
    popular: false,
  },
  {
    id: 'pack-500',
    name: '500 Credits',
    credits: 500,
    price: 40,
    popular: true,
    discount: '20% off',
  },
  {
    id: 'pack-1000',
    name: '1000 Credits',
    credits: 1000,
    price: 70,
    popular: false,
    discount: '30% off',
  },
]

export default function Pricing() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)

  const creditsNeeded = searchParams.get('needed')
  const creditsAvailable = searchParams.get('available')

  const handlePurchase = async (packageId: string) => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    setLoading(packageId)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error('Purchase failed:', error)
      alert('Failed to start checkout. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            First 10 results free per search. Pay only for what you need.
          </p>
        </div>

        {/* Insufficient Credits Alert */}
        {creditsNeeded && creditsAvailable && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              ⚠️ You need <strong>{creditsNeeded}</strong> credits for your search, but you only have{' '}
              <strong>{creditsAvailable}</strong> credits. Please purchase more credits below.
            </p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-lg shadow-lg p-8 relative ${
                pkg.popular ? 'ring-2 ring-primary-600' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-primary-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {pkg.name}
                </h3>
                {pkg.discount && (
                  <p className="text-green-600 font-semibold mb-2">{pkg.discount}</p>
                )}
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  €{pkg.price}
                </div>
                <p className="text-gray-600">
                  €{(pkg.price / pkg.credits).toFixed(2)} per credit
                </p>
              </div>

              <ul className="mb-8 space-y-3">
                <li className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {pkg.credits} credits
                </li>
                <li className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  No expiration
                </li>
                <li className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Email notifications
                </li>
              </ul>

              <button
                onClick={() => handlePurchase(pkg.id)}
                disabled={loading === pkg.id}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  pkg.popular
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === pkg.id ? 'Processing...' : 'Purchase'}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">
                How do credits work?
              </h3>
              <p className="text-gray-600">
                Each search gives you 10 results for free. If you want more results,
                you need 1 credit per additional row. For example, a 50-row search
                uses 40 credits (50 - 10 free rows).
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">
                Do credits expire?
              </h3>
              <p className="text-gray-600">
                No! Your credits never expire. Use them whenever you need.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express)
                through our secure payment processor, Stripe.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">
                Can I get a refund?
              </h3>
              <p className="text-gray-600">
                We offer refunds for unused credits within 30 days of purchase.
                Contact our support team for assistance.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Not sure yet? Try it free with 10 results per search.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            Start Searching
          </Link>
        </div>
      </main>
    </div>
  )
}
