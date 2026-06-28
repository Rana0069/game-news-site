'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Filter, Loader } from 'lucide-react'
import ArticleCard from '@/components/article/ArticleCard'

const sortOptions = [
  { label: 'Latest', value: 'latest' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Trending', value: 'trending' },
]

export default function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState('latest')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories).catch(() => {})
  }, [])

  const doSearch = useCallback(async (q: string, s: string, cat: string) => {
    if (!q) { setResults([]); setTotal(0); return }
    setLoading(true)
    try {
      const params = new URLSearchParams({ q, sort: s })
      if (cat) params.set('category', cat)
      const res = await fetch(`/api/search?${params}`)
      const data = await res.json()
      setResults(data.posts || [])
      setTotal(data.total || 0)
    } catch {
      setResults([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const q = searchParams.get('q') || ''
    setQuery(q)
    doSearch(q, sort, category)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, sort, category])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const currentQuery = searchParams.get('q')

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display font-black text-3xl text-white mb-6">Search</h1>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative mb-8">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles, games, reviews..."
          className="input-dark pl-12 py-4 text-lg pr-32"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-neon text-sm px-4 py-2 relative z-10">
          Search
        </button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-500" />
          <span className="text-sm text-gray-500">Sort:</span>
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sort === opt.value ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-dark w-auto text-sm py-1.5"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={32} className="text-neon-blue animate-spin" />
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="text-gray-500 text-sm mb-6">{total} results for &quot;{currentQuery}&quot;</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((post) => (
              <ArticleCard key={post.id} post={post} variant="default" />
            ))}
          </div>
        </>
      ) : query ? (
        <div className="text-center py-20">
          <Search size={48} className="text-gray-700 mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-white mb-2">No results found</h2>
          <p className="text-gray-500">Try different keywords or browse our categories.</p>
        </div>
      ) : (
        <div className="text-center py-20">
          <Search size={48} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">Enter a search query to find articles.</p>
        </div>
      )}
    </div>
  )
}
