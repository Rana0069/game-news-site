import { Suspense } from 'react'
import type { Metadata } from 'next'
import SearchContent from './SearchContent'
import { Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search for gaming news, reviews, and articles.',
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="font-display font-black text-3xl text-white mb-6">Search</h1>
          <div className="flex items-center justify-center py-20">
            <Search size={32} className="text-neon-blue animate-pulse" />
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
