import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Flame, Star, Zap, Gamepad2, Tv, Trophy, Rocket } from 'lucide-react'
import prisma from '@/lib/db'
import HeroSlider from '@/components/home/HeroSlider'
import ArticleCard from '@/components/article/ArticleCard'
import Sidebar from '@/components/layout/Sidebar'
import { formatRelativeTime, safeJsonParse } from '@/lib/utils'

async function getHomeData() {
  try {
    const [featuredPosts, latestPosts, trendingPosts, popularPosts, games, upcomingGames, categories] = await Promise.all([
      prisma.post.findMany({
        where: { status: 'published', featured: true },
        orderBy: { publishedAt: 'desc' },
        take: 5,
        include: { author: { select: { name: true, image: true } }, category: true, _count: { select: { comments: true } } },
      }),
      prisma.post.findMany({
        where: { status: 'published' },
        orderBy: { publishedAt: 'desc' },
        take: 8,
        include: { author: { select: { name: true, image: true } }, category: true, _count: { select: { comments: true } } },
      }),
      prisma.post.findMany({
        where: { status: 'published', trending: true },
        orderBy: { views: 'desc' },
        take: 4,
        include: { author: { select: { name: true, image: true } }, category: true, _count: { select: { comments: true } } },
      }),
      prisma.post.findMany({
        where: { status: 'published' },
        orderBy: { views: 'desc' },
        take: 4,
        include: { author: { select: { name: true, image: true } }, category: true, _count: { select: { comments: true } } },
      }),
      prisma.game.findMany({
        where: { featured: true },
        orderBy: { releaseDate: 'desc' },
        take: 6,
      }),
      prisma.game.findMany({
        where: { upcoming: true },
        orderBy: { releaseDate: 'asc' },
        take: 4,
      }),
      prisma.category.findMany({
        include: { _count: { select: { posts: true } } },
        orderBy: { posts: { _count: 'desc' } },
        take: 12,
      }),
    ])
    return { featuredPosts, latestPosts, trendingPosts, popularPosts, games, upcomingGames, categories }
  } catch {
    return { featuredPosts: [], latestPosts: [], trendingPosts: [], popularPosts: [], games: [], upcomingGames: [], categories: [] }
  }
}

const categoryIcons: Record<string, typeof Zap> = {
  'gaming-news': Zap,
  'esports': Trophy,
  'upcoming-games': Rocket,
  'game-reviews': Star,
}

export default async function HomePage() {
  const { featuredPosts, latestPosts, trendingPosts, popularPosts, games, upcomingGames, categories } = await getHomeData()

  // YouTube videos section (mock — from posts with youtubeUrls)
  const videoPost = latestPosts.find((p) => p.youtubeUrls)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* ── HERO SLIDER ── */}
      <section className="mb-12">
        <Suspense fallback={<div className="w-full h-[70vh] skeleton rounded-2xl" />}>
          <HeroSlider posts={featuredPosts.length > 0 ? featuredPosts : latestPosts} />
        </Suspense>
      </section>

      {/* ── MAIN CONTENT + SIDEBAR ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
        <div>

          {/* ── LATEST GAMING NEWS ── */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">
                <Zap size={20} className="text-neon-blue" />
                Latest Gaming News
              </h2>
              <Link href="/category/gaming-news" className="flex items-center gap-1 text-sm text-neon-blue hover:underline">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestPosts.slice(0, 5).map((post, i) => (
                <div key={post.id} className={i === 0 ? 'md:col-span-2' : ''}>
                  <ArticleCard post={post} variant={i === 0 ? 'featured' : 'default'} />
                </div>
              ))}
            </div>
          </section>

          {/* ── TRENDING ── */}
          {trendingPosts.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title">
                  <Flame size={20} className="text-neon-pink" />
                  Trending Now
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trendingPosts.map((post, i) => (
                  <div key={post.id} className="flex gap-4 glass-card p-4 items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-lg"
                      style={{
                        background: i === 0 ? 'rgba(247,37,133,0.15)' : 'rgba(168,85,247,0.15)',
                        color: i === 0 ? '#f72585' : '#a855f7',
                      }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      {post.category && (
                        <Link href={`/category/${post.category.slug}`}>
                          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: post.category.color || '#00d4ff' }}>
                            {post.category.name}
                          </span>
                        </Link>
                      )}
                      <Link href={`/article/${post.slug}`}>
                        <h3 className="font-semibold text-gray-100 hover:text-neon-blue transition-colors leading-snug mt-1 line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        {post.publishedAt ? formatRelativeTime(post.publishedAt) : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── POPULAR BLOGS ── */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">
                <Star size={20} className="text-neon-purple" />
                Popular Articles
              </h2>
            </div>
            <div className="space-y-4">
              {popularPosts.map((post) => (
                <ArticleCard key={post.id} post={post} variant="horizontal" />
              ))}
            </div>
          </section>

          {/* ── GAME RELEASES ── */}
          {games.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title">
                  <Gamepad2 size={20} className="text-neon-green" />
                  New Game Releases
                </h2>
                <Link href="/games" className="flex items-center gap-1 text-sm text-neon-blue hover:underline">
                  All Games <ChevronRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {games.map((game) => {
                  const platforms = safeJsonParse<string[]>(game.platforms, [])
                  return (
                    <Link key={game.id} href={`/games/${game.slug}`} className="group glass-card overflow-hidden">
                      <div className="relative aspect-[3/4] bg-dark-800">
                        {game.coverImage ? (
                          <Image src={game.coverImage} alt={game.title} fill className="object-cover group-hover:scale-105 transition-transform duration-400" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 flex items-center justify-center">
                            <Gamepad2 size={40} className="text-neon-blue/20" />
                          </div>
                        )}
                        {game.reviewScore && (
                          <div className={`absolute top-2 right-2 score-badge ${game.reviewScore >= 8 ? 'score-high' : game.reviewScore >= 6 ? 'score-mid' : 'score-low'}`}>
                            {game.reviewScore.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm text-gray-200 group-hover:text-neon-blue transition-colors line-clamp-1">
                          {game.title}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {platforms.slice(0, 2).map((p) => (
                            <span key={p} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{p}</span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── UPCOMING GAMES ── */}
          {upcomingGames.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title">
                  <Rocket size={20} className="text-neon-blue" />
                  Upcoming Games
                </h2>
                <Link href="/games?filter=upcoming" className="flex items-center gap-1 text-sm text-neon-blue hover:underline">
                  View All <ChevronRight size={14} />
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingGames.map((game) => {
                  const platforms = safeJsonParse<string[]>(game.platforms, [])
                  const genres = safeJsonParse<string[]>(game.genres, [])
                  return (
                    <Link key={game.id} href={`/games/${game.slug}`} className="flex gap-4 glass-card p-4 group">
                      <div className="w-20 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-dark-800">
                        {game.coverImage ? (
                          <Image src={game.coverImage} alt={game.title} width={80} height={112} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-neon-blue/10 to-neon-purple/10" />
                        )}
                      </div>
                      <div>
                        <span className="badge badge-neon text-xs mb-2">Upcoming</span>
                        <h3 className="font-display font-bold text-gray-100 group-hover:text-neon-blue transition-colors">
                          {game.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {game.developer} · {game.releaseDate ? new Date(game.releaseDate).getFullYear() : 'TBA'}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {genres.slice(0, 3).map((g) => (
                            <span key={g} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{g}</span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {platforms.map((p) => (
                            <span key={p} className="badge badge-purple text-xs">{p}</span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── YOUTUBE VIDEOS ── */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">
                <Tv size={20} className="text-red-500" />
                Gaming Videos
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Featured video */}
              <div className="youtube-embed-wrapper sm:col-span-2 max-w-3xl mx-auto w-full">
                <iframe
                  src="https://www.youtube.com/embed/videoseries?list=PLREl6yOh7JkiprePJanCexkMC3Bn_O7fL"
                  title="Gaming Videos"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </section>

          {/* ── CATEGORIES ── */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">
                Browse Categories
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.slug] || Zap
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="glass-card p-4 text-center group hover:border-opacity-50 transition-all"
                    style={{ borderColor: `${cat.color || '#00d4ff'}20` }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl"
                      style={{ background: `${cat.color || '#00d4ff'}15` }}
                    >
                      {cat.icon || <Icon size={20} style={{ color: cat.color || '#00d4ff' }} />}
                    </div>
                    <h3 className="font-semibold text-sm text-gray-200 group-hover:text-white transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">{cat._count.posts} posts</p>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* ── NEWSLETTER CTA ── */}
          <section className="mb-12">
            <div className="relative overflow-hidden rounded-2xl p-6 sm:p-12 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(168,85,247,0.08) 100%)', border: '1px solid rgba(0,212,255,0.15)' }}
            >
              {/* Decorative orbs */}
              <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-neon-blue/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-neon-purple/10 blur-3xl pointer-events-none" />

              <div className="relative">
                <span className="badge badge-neon mb-4">📧 Newsletter</span>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-white mb-3">
                  Never Miss a Beat
                </h2>
                <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                  Join 50,000+ gamers who get the latest news, reviews, and exclusive deals delivered every week.
                </p>
                <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="input-dark flex-1"
                    required
                  />
                  <button type="submit" className="btn-neon whitespace-nowrap">
                    Join Free 🎮
                  </button>
                </form>
              </div>
            </div>
          </section>

        </div>

        {/* ── SIDEBAR ── */}
        <Suspense fallback={<div className="space-y-6"><div className="h-64 skeleton rounded-2xl" /><div className="h-64 skeleton rounded-2xl" /></div>}>
          <Sidebar />
        </Suspense>
      </div>
    </div>
  )
}
