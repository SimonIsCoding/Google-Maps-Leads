import { Metadata } from 'next'
import Header from '@/components/Header'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Features - MapScraperHub',
  description: 'Discover all the features of MapScraperHub - the easiest way to extract Google Maps data.',
}

export default function Features() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need to extract Google Maps data
          </h1>
          <p className="text-xl text-gray-600">
            Powerful features designed to save you time and money
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold mb-4">Fast Data Extraction</h2>
            <p className="text-gray-600 mb-4">
              Get your results in minutes, not hours. Our scraping service is optimized
              for speed and reliability.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Average processing time: 2-5 minutes</li>
              <li>✓ Real-time status updates</li>
              <li>✓ Email notifications when ready</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-4">Clean, Structured Data</h2>
            <p className="text-gray-600 mb-4">
              Receive organized data in Google Sheets format, ready for analysis or export.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Business names and addresses</li>
              <li>✓ Contact information</li>
              <li>✓ Ratings and reviews</li>
              <li>✓ Opening hours</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-4xl mb-4">💰</div>
            <h2 className="text-2xl font-bold mb-4">Pay As You Go</h2>
            <p className="text-gray-600 mb-4">
              No monthly subscriptions. Only pay for what you use with our credit system.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>✓ First 10 results always free</li>
              <li>✓ Credits never expire</li>
              <li>✓ Bulk discounts available</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-4">Secure & Reliable</h2>
            <p className="text-gray-600 mb-4">
              Your data and payment information are protected with industry-standard security.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>✓ SSL encryption</li>
              <li>✓ Secure payment via Stripe</li>
              <li>✓ 99.9% uptime guarantee</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-2xl font-bold mb-4">Email Notifications</h2>
            <p className="text-gray-600 mb-4">
              Stay informed with automatic email notifications for your searches.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Completion notifications</li>
              <li>✓ Direct link to results</li>
              <li>✓ Error alerts</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-4xl mb-4">📱</div>
            <h2 className="text-2xl font-bold mb-4">Responsive Design</h2>
            <p className="text-gray-600 mb-4">
              Access MapScraperHub from any device - desktop, tablet, or mobile.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Mobile-friendly interface</li>
              <li>✓ Works on all browsers</li>
              <li>✓ Dashboard accessible anywhere</li>
            </ul>
          </div>
        </div>

        {/* Use Cases */}
        <div className="bg-white rounded-lg shadow-sm p-12 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Use Cases</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Lead Generation</h3>
              <p className="text-gray-600">
                Find potential customers in specific areas for your sales team.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Market Research</h3>
              <p className="text-gray-600">
                Analyze competitors and market density in target regions.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Business Intelligence</h3>
              <p className="text-gray-600">
                Gather data for strategic planning and decision making.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-600 mb-6">
            Try MapScraperHub today with 10 free results per search.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition"
          >
            Start Free Trial
          </Link>
        </div>
      </main>
    </div>
  )
}
