// Cache sidebar DB queries for 5 minutes — prevents 3 extra DB round-trips on every page
export const revalidate = 300

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
        <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
          <Clock size={16} className="text-neon-blue" />
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
                    <div className="w-full h-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
                      <Bookmark size={16} className="text-neon-blue" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-200 group-hover:text-neon-blue transition-colors line-clamp-2 leading-tight">
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
        <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-neon-purple" />
          Popular Posts
        </h3>
        <ol className="space-y-4">
          {popularPosts.map((post, index) => (
            <li key={post.id}>
              <Link href={`/article/${post.slug}`} className="flex gap-3 group">
                <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center font-display font-black text-sm"
                  style={{
                    background: index === 0 ? 'rgba(0,212,255,0.15)' : index === 1 ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.05)',
                    color: index === 0 ? '#00d4ff' : index === 1 ? '#a855f7' : '#6b7280',
                  }}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-200 group-hover:text-neon-blue transition-colors line-clamp-2 leading-tight">
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
        <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
          <Tag size={16} className="text-neon-green" />
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-gray-400 hover:bg-neon-blue/10 hover:border-neon-blue/30 hover:text-neon-blue transition-all"
            >
              #{tag.name}
              <span className="ml-1 text-gray-600">({tag._count.posts})</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter mini */}
      <section className="glass-card p-5 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5">
        <h3 className="font-display font-bold text-lg text-white mb-2">🎮 Stay Updated</h3>
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

