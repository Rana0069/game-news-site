// Cache games detail for 1 hour (games rarely change)
export const revalidate = 3600

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import prisma from '@/lib/db'
import { safeJsonParse, buildYouTubeEmbedUrl } from '@/lib/utils'
import { Gamepad2, Star, Calendar, Monitor, User, Building2, ChevronRight } from 'lucide-react'

interface Props { params: { slug: string } }

async function getGame(slug: string) {
  try {
    return await prisma.game.findUnique({ where: { slug } })
  } catch { return null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const game = await getGame(params.slug)
  if (!game) return {}
  return {
    title: game.title,
    description: game.description || `${game.title} — ${game.developer}`,
    openGraph: {
      title: game.title,
      description: game.description || '',
      images: game.coverImage ? [{ url: game.coverImage }] : [],
      type: 'website',
    },
  }
}

export default async function GameDetailPage({ params }: Props) {
  const game = await getGame(params.slug)
  if (!game) notFound()

  const platforms = safeJsonParse<string[]>(game.platforms, [])
  const genres = safeJsonParse<string[]>(game.genres, [])
  const screenshots = safeJsonParse<string[]>(game.screenshots, [])
  const sysReq = safeJsonParse<Record<string, string>>(game.systemRequirements, {})

  // JSON-LD structured data for game
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.title,
    description: game.description || '',
    image: game.coverImage || '',
    datePublished: game.releaseDate ? new Date(game.releaseDate).toISOString() : undefined,
    author: { '@type': 'Organization', name: game.developer || 'Unknown' },
    publisher: { '@type': 'Organization', name: game.publisher || 'Unknown' },
    applicationCategory: 'Game',
    ...(game.reviewScore && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: game.reviewScore,
        bestRating: 10,
      },
    }),
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-neon-red transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link href="/games" className="hover:text-neon-red transition-colors">Games</Link>
        <ChevronRight size={14} />
        <span className="text-gray-400 line-clamp-1">{game.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Left: Cover + Info */}
        <aside>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-dark-800 mb-6 border border-white/5">
            {game.coverImage ? (
              <Image src={game.coverImage} alt={`${game.title} cover art`} fill priority className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neon-red/10 to-red-700/10 flex items-center justify-center">
                <Gamepad2 size={64} className="text-neon-red/20" />
              </div>
            )}
            {game.reviewScore && (
              <div className={`absolute top-3 right-3 score-badge text-lg ${game.reviewScore >= 8 ? 'score-high' : game.reviewScore >= 6 ? 'score-mid' : 'score-low'}`}>
                {game.reviewScore.toFixed(1)}
              </div>
            )}
          </div>

          {/* Meta info */}
          <section className="glass-card p-4 space-y-3" aria-label="Game details">
            {game.releaseDate && (
              <dl className="flex items-center gap-3 text-sm">
                <Calendar size={14} className="text-gray-500 flex-shrink-0" aria-hidden="true" />
                <dt className="sr-only">Release Date</dt>
                <dd className="text-gray-400">Release: <span className="text-gray-200"><time dateTime={new Date(game.releaseDate).toISOString()}>{new Date(game.releaseDate).toLocaleDateString()}</time></span></dd>
              </dl>
            )}
            {game.developer && (
              <dl className="flex items-center gap-3 text-sm">
                <User size={14} className="text-gray-500 flex-shrink-0" aria-hidden="true" />
                <dt className="sr-only">Developer</dt>
                <dd className="text-gray-400">Developer: <span className="text-gray-200">{game.developer}</span></dd>
              </dl>
            )}
            {game.publisher && (
              <dl className="flex items-center gap-3 text-sm">
                <Building2 size={14} className="text-gray-500 flex-shrink-0" aria-hidden="true" />
                <dt className="sr-only">Publisher</dt>
                <dd className="text-gray-400">Publisher: <span className="text-gray-200">{game.publisher}</span></dd>
              </dl>
            )}
            {game.rating && (
              <dl className="flex items-center gap-3 text-sm">
                <Star size={14} className="text-gray-500 flex-shrink-0" aria-hidden="true" />
                <dt className="sr-only">Rating</dt>
                <dd className="text-gray-400">Rating: <span className="badge badge-neon">{game.rating}</span></dd>
              </dl>
            )}

            {/* Platforms */}
            {platforms.length > 0 && (
              <div>
                <p className="flex items-center gap-2 mb-2">
                  <Monitor size={14} className="text-gray-500" aria-hidden="true" />
                  <span className="text-xs text-gray-500">Platforms</span>
                </p>
                <ul className="flex flex-wrap gap-1">
                  {platforms.map((p) => (
                    <li key={p}><span className="badge badge-purple text-xs">{p}</span></li>
                  ))}
                </ul>
              </div>
            )}

            {/* Genres */}
            {genres.length > 0 && (
              <div>
                <span className="text-xs text-gray-500 block mb-2">Genres</span>
                <ul className="flex flex-wrap gap-1">
                  {genres.map((g) => (
                    <li key={g}><span className="badge badge-neon text-xs">{g}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </aside>

        {/* Right: Main Content */}
        <main>
          <h1 className="font-display font-black text-4xl text-white mb-4">{game.title}</h1>

          {game.description && (
            <p className="text-gray-300 leading-relaxed mb-6">{game.description}</p>
          )}

          {/* Trailer */}
          {game.trailerUrl && (
            <section className="mb-8" aria-label="Game Trailer">
              <h2 className="font-display font-bold text-xl text-white mb-4">🎬 Trailer</h2>
              <div className="youtube-embed-wrapper">
                <iframe
                  src={buildYouTubeEmbedUrl(game.trailerUrl)}
                  title={`${game.title} Official Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          )}

          {/* Screenshots */}
          {screenshots.length > 0 && (
            <section className="mb-8" aria-label="Screenshots">
              <h2 className="font-display font-bold text-xl text-white mb-4">📷 Screenshots</h2>
              <ul className="grid grid-cols-2 gap-3">
                {screenshots.map((img, i) => (
                  <li key={i} className="relative aspect-video rounded-xl overflow-hidden border border-white/5">
                    <Image src={img} alt={`${game.title} screenshot ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform" />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* System Requirements */}
          {Object.keys(sysReq).length > 0 && (
            <section className="glass-card p-5" aria-label="System Requirements">
              <h2 className="font-display font-bold text-lg text-white mb-4">⚙️ System Requirements</h2>
              <dl className="space-y-2">
                {Object.entries(sysReq).map(([key, val]) => (
                  <div key={key} className="flex gap-4 text-sm">
                    <dt className="text-gray-500 w-24 flex-shrink-0 capitalize">{key}:</dt>
                    <dd className="text-gray-300">{val}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
