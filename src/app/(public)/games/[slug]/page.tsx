import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import prisma from '@/lib/db'
import { safeJsonParse, buildYouTubeEmbedUrl } from '@/lib/utils'
import { Gamepad2, Star, Calendar, Monitor, User, Building2 } from 'lucide-react'

interface Props { params: { slug: string } }

async function getGame(slug: string) {
  return prisma.game.findUnique({ where: { slug } })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const game = await getGame(params.slug)
  if (!game) return {}
  return {
    title: `${game.title} | GamePulse`,
    description: game.description || `Discover ${game.title} on GamePulse. Developer: ${game.developer || 'Unknown'}.`,
    openGraph: {
      title: `${game.title} | GamePulse`,
      description: game.description || '',
      images: game.coverImage ? [{ url: game.coverImage }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${game.title} | GamePulse`,
      description: game.description || '',
    }
  }
}

export default async function GameDetailPage({ params }: Props) {
  const game = await getGame(params.slug)
  if (!game) notFound()

  const platforms = safeJsonParse<string[]>(game.platforms, [])
  const genres = safeJsonParse<string[]>(game.genres, [])
  const screenshots = safeJsonParse<string[]>(game.screenshots, [])
  const sysReq = safeJsonParse<Record<string, string>>(game.systemRequirements, {})
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.title,
    description: game.description || '',
    image: game.coverImage ? [`${baseUrl}${game.coverImage}`] : [],
    gamePlatform: platforms,
    genre: genres,
    publisher: game.publisher || game.developer || 'Unknown',
    datePublished: game.releaseDate ? new Date(game.releaseDate).toISOString() : undefined,
    aggregateRating: game.reviewScore ? {
      '@type': 'AggregateRating',
      ratingValue: game.reviewScore,
      bestRating: '10',
      worstRating: '1',
      ratingCount: '1'
    } : undefined
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Left: Cover + Info */}
        <div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-dark-800 mb-6 border border-white/5">
            {game.coverImage ? (
              <Image src={game.coverImage} alt={game.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 flex items-center justify-center">
                <Gamepad2 size={64} className="text-neon-blue/20" />
              </div>
            )}
            {game.reviewScore && (
              <div className={`absolute top-3 right-3 score-badge text-lg ${game.reviewScore >= 8 ? 'score-high' : game.reviewScore >= 6 ? 'score-mid' : 'score-low'}`}>
                {game.reviewScore.toFixed(1)}
              </div>
            )}
          </div>

          {/* Meta info */}
          <div className="glass-card p-4 space-y-3">
            {game.releaseDate && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={14} className="text-gray-500 flex-shrink-0" />
                <span className="text-gray-400">Release: <span className="text-gray-200">{new Date(game.releaseDate).toLocaleDateString()}</span></span>
              </div>
            )}
            {game.developer && (
              <div className="flex items-center gap-3 text-sm">
                <User size={14} className="text-gray-500 flex-shrink-0" />
                <span className="text-gray-400">Developer: <span className="text-gray-200">{game.developer}</span></span>
              </div>
            )}
            {game.publisher && (
              <div className="flex items-center gap-3 text-sm">
                <Building2 size={14} className="text-gray-500 flex-shrink-0" />
                <span className="text-gray-400">Publisher: <span className="text-gray-200">{game.publisher}</span></span>
              </div>
            )}
            {game.rating && (
              <div className="flex items-center gap-3 text-sm">
                <Star size={14} className="text-gray-500 flex-shrink-0" />
                <span className="text-gray-400">Rating: <span className="badge badge-neon">{game.rating}</span></span>
              </div>
            )}

            {/* Platforms */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Monitor size={14} className="text-gray-500" />
                <span className="text-xs text-gray-500">Platforms</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {platforms.map((p) => (
                  <span key={p} className="badge badge-purple text-xs">{p}</span>
                ))}
              </div>
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div>
                <span className="text-xs text-gray-500 block mb-2">Genres</span>
                <div className="flex flex-wrap gap-1">
                  {genres.map((g) => (
                    <span key={g} className="badge badge-neon text-xs">{g}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Details */}
        <div>
          <h1 className="font-display font-black text-4xl text-white mb-4">{game.title}</h1>

          {game.description && (
            <p className="text-gray-300 leading-relaxed mb-6">{game.description}</p>
          )}

          {/* Trailer */}
          {game.trailerUrl && (
            <div className="mb-8">
              <h2 className="font-display font-bold text-xl text-white mb-4">🎬 Trailer</h2>
              <div className="youtube-embed-wrapper">
                <iframe
                  src={buildYouTubeEmbedUrl(game.trailerUrl)}
                  title={`${game.title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Screenshots */}
          {screenshots.length > 0 && (
            <div className="mb-8">
              <h2 className="font-display font-bold text-xl text-white mb-4">📷 Screenshots</h2>
              <div className="grid grid-cols-2 gap-3">
                {screenshots.map((img, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-white/5">
                    <Image src={img} alt={`Screenshot ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Requirements */}
          {Object.keys(sysReq).length > 0 && (
            <div className="glass-card p-5">
              <h2 className="font-display font-bold text-lg text-white mb-4">⚙️ System Requirements</h2>
              <div className="space-y-2">
                {Object.entries(sysReq).map(([key, val]) => (
                  <div key={key} className="flex gap-4 text-sm">
                    <span className="text-gray-500 w-24 flex-shrink-0 capitalize">{key}:</span>
                    <span className="text-gray-300">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
