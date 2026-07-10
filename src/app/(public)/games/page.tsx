// Cache games list for 5 minutes
export const revalidate = 300

import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import prisma from '@/lib/db'
import { safeJsonParse } from '@/lib/utils'
import { Gamepad2, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Game Database',
  description: 'Browse our complete database of games with ratings, reviews, and release dates.',
}

async function getGames(filter?: string) {
  const where: any = {}
  if (filter === 'upcoming') where.upcoming = true
  if (filter === 'featured') where.featured = true
  try {
    return await prisma.game.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { releaseDate: 'desc' }],
      take: 50,
    })
  } catch { return [] }
}

export default async function GamesPage({ searchParams }: { searchParams: { filter?: string } }) {
  const games = await getGames(searchParams.filter)

  const tabs = [
    { label: 'All Games', value: undefined },
    { label: 'Featured', value: 'featured' },
    { label: 'Upcoming', value: 'upcoming' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="font-display font-black text-4xl text-white mb-2">Game Database</h1>
        <p className="text-gray-400">Browse {games.length}+ games with ratings, reviews, and release dates.</p>
      </header>

      {/* Filter tabs */}
      <nav aria-label="Filter games" className="flex gap-2 mb-8">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/games?filter=${tab.value}` : '/games'}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              searchParams.filter === tab.value
                ? 'bg-neon-red/20 text-neon-red border border-neon-red/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {/* Games grid */}
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {games.map((game) => {
          const platforms = safeJsonParse<string[]>(game.platforms, [])
          return (
            <li key={game.id}>
              <Link href={`/games/${game.slug}`} className="group block glass-card overflow-hidden">
                <div className="relative aspect-[3/4] bg-dark-800">
                  {game.coverImage ? (
                    <Image
                      src={game.coverImage}
                      alt={`${game.title} cover art`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-400"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neon-red/10 to-red-700/10 flex items-center justify-center">
                      <Gamepad2 size={32} className="text-neon-red/20" />
                    </div>
                  )}
                  {game.reviewScore && (
                    <div className={`absolute top-2 right-2 score-badge text-sm ${game.reviewScore >= 8 ? 'score-high' : game.reviewScore >= 6 ? 'score-mid' : 'score-low'}`}>
                      {game.reviewScore.toFixed(1)}
                    </div>
                  )}
                  {game.upcoming && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-dark-950 to-transparent p-2">
                      <span className="badge badge-purple text-xs">Upcoming</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h2 className="font-semibold text-sm text-gray-200 group-hover:text-neon-red transition-colors line-clamp-1 mb-1">
                    {game.title}
                  </h2>
                  {game.releaseDate && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={10} aria-hidden="true" />
                      <time dateTime={new Date(game.releaseDate).toISOString()}>{new Date(game.releaseDate).getFullYear()}</time>
                    </p>
                  )}
                  {platforms.length > 0 && (
                    <ul className="flex flex-wrap gap-1 mt-1">
                      {platforms.slice(0, 2).map((p) => (
                        <li key={p}><span className="text-xs text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">{p}</span></li>
                      ))}
                    </ul>
                  )}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      {games.length === 0 && (
        <div className="text-center py-20" role="status">
          <Gamepad2 size={48} className="text-gray-700 mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-500">No games found. Add some from the admin panel.</p>
        </div>
      )}
    </div>
  )
}

