import { Metadata } from 'next'
import Header from '@/components/Header'
import SearchForm from '@/components/SearchForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'MapScraperHub - Transform Google Maps Searches into Google Sheets',
  description: 'Turn Google Maps searches into organized Google Sheets data. Simple, fast, and affordable.',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Google Maps Searches
            <br />
            <span className="text-primary-600">into Google Sheets</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Extract business data from Google Maps and get organized results in a Google Sheet.
            Perfect for lead generation, market research, and business intelligence.
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-3xl mx-auto mb-16">
          <SearchForm />
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Fast & Simple</h3>
            <p className="text-gray-600">
              Just enter your search query and select the number of results. Get your data in minutes.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Affordable</h3>
            <p className="text-gray-600">
              First 10 results free per search. Only pay for what you need with our credit system.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Organized Data</h3>
            <p className="text-gray-600">
              Get clean, structured data in Google Sheets ready for analysis or export.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Enter Search</h3>
              <p className="text-sm text-gray-600">
                Type your search query like "bakery Paris"
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Select Results</h3>
              <p className="text-sm text-gray-600">
                Choose how many results you want (5-100)
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">We Scrape</h3>
              <p className="text-sm text-gray-600">
                Our system extracts data from Google Maps
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">Get Results</h3>
              <p className="text-sm text-gray-600">
                Receive a Google Sheet with organized data
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Sign up now and get your first search with 10 results completely free.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition"
          >
            Start Free Trial
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 MapScraperHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
