// Cache sidebar DB queries for 1 hour — sidebar data is not time-critical
export const revalidate = 3600

import Link from 'next/link'
import Image from 'next/image'
import { Clock, Eye, Tag, TrendingUp, Bookmark, ChevronRight } from 'lucide-react'
import prisma from '@/lib/db'
import { formatRelativeTime, formatViewCount } from '@/lib/utils'

async function getSidebarData() {
  try {
    const [recentPosts, popularPosts, popularTags] = await Promise.all([
      prisma.post.findMany({
        where: { status: 'published' },
        orderBy: { publishedAt: 'desc' },
        take: 5,
        select: { id: true, title: true, slug: true, featuredImage: true, publishedAt: true, readingTime: true, category: { select: { name: true, slug: true } } },
      }),
      prisma.post.findMany({
        where: { status: 'published' },
        orderBy: { views: 'desc' },
        take: 5,
        select: { id: true, title: true, slug: true, featuredImage: true, views: true, category: { select: { name: true, slug: true } } },
      }),
      prisma.tag.findMany({
        take: 20,
        include: { _count: { select: { posts: true } } },
        orderBy: { posts: { _count: 'desc' } },
      }),
    ])
    return { recentPosts, popularPosts, popularTags }
  } catch {
    return { recentPosts: [], popularPosts: [], popularTags: [] }
  }
}

export default async function Sidebar() {
  const { recentPosts, popularPosts, popularTags } = await getSidebarData()

  return (
    <aside className="space-y-6">
      {/* Recent Posts */}
      <section className="glass-card p-5">
        <h3 className="font-orbitron font-bold text-lg text-white mb-4 flex items-center gap-2">
          <Clock size={16} className="text-neon-red" />
          Recent Posts
        </h3>
        <ol className="space-y-4">
          {recentPosts.map((post) => (
            <li key={post.id}>
              <Link href={`/article/${post.slug}`} className="flex gap-3 group">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-dark-700">
                  {post.featuredImage ? (
                    <Image src={post.featuredImage} alt={post.title} width={64} height={64} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neon-red/20 to-red-700/20 flex items-center justify-center">
                      <Bookmark size={16} className="text-neon-red" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-200 group-hover:text-neon-red transition-colors line-clamp-2 leading-tight">
                    {post.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    <time dateTime={post.publishedAt?.toISOString()}>
                      {post.publishedAt ? formatRelativeTime(post.publishedAt) : 'Draft'}
                    </time>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Popular Posts */}
      <section className="glass-card p-5">
        <h3 className="font-orbitron font-bold text-lg text-white mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-neon-red" />
          Popular Posts
        </h3>
        <ol className="space-y-4">
          {popularPosts.map((post, index) => (
            <li key={post.id}>
              <Link href={`/article/${post.slug}`} className="flex gap-3 group">
                <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center font-display font-black text-sm"
                  style={{
                    background: index === 0
                      ? 'rgba(255,26,26,0.20)'
                      : index === 1
                      ? 'rgba(255,77,109,0.15)'
                      : 'rgba(255,255,255,0.05)',
                    color: index === 0
                      ? '#ff1a1a'
                      : index === 1
                      ? '#ff4d6d'
                      : '#6b7280',
                  }}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-200 group-hover:text-neon-red transition-colors line-clamp-2 leading-tight">
                    {post.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Eye size={10} />
                    {formatViewCount(post.views)} views
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Popular Tags */}
      <section className="glass-card p-5">
        <h3 className="font-orbitron font-bold text-lg text-white mb-4 flex items-center gap-2">
          <Tag size={16} className="text-neon-red" />
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="px-3 py-1 rounded-full text-xs font-medium bg-neon-red/5 border border-neon-red/15 text-gray-400 hover:bg-neon-red/15 hover:border-neon-red/40 hover:text-neon-red transition-all"
            >
              #{tag.name}
              <span className="ml-1 text-gray-600">({tag._count.posts})</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter mini */}
      <section className="glass-card p-5 neon-border-animated" style={{ background: 'linear-gradient(135deg, rgba(255,26,26,0.06) 0%, rgba(0,0,0,0.95) 100%)' }}>
        <h3 className="font-orbitron font-bold text-lg text-white mb-2">🎮 Stay Updated</h3>
        <p className="text-gray-400 text-sm mb-4">Get gaming news in your inbox weekly.</p>
        <form action="/api/newsletter" method="POST">
          <label htmlFor="sidebar-email" className="sr-only">Email address</label>
          <input id="sidebar-email" type="email" name="email" placeholder="your@email.com" className="input-dark mb-3" required />
          <button type="submit" className="btn-neon w-full text-sm relative z-10">Subscribe Free</button>
        </form>
      </section>
    </aside>
  )
}


