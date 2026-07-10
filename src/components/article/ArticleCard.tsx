'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Eye, Heart, MessageSquare, Bookmark, Gamepad2 } from 'lucide-react'
import { formatViewCount } from '@/lib/utils'
import RelativeTime from '@/components/ui/RelativeTime'

interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  featuredImage?: string | null
  publishedAt?: Date | null
  readingTime: number
  views: number
  likes: number
  trending: boolean
  featured: boolean
  author?: { name?: string | null; image?: string | null } | null
  category?: { name: string; slug: string; color?: string | null } | null
  _count?: { comments: number }
}

interface ArticleCardProps {
  post: Post
  variant?: 'default' | 'featured' | 'compact' | 'horizontal'
  priority?: boolean
}

/** Gradient placeholder shown when image is missing or fails to load */
function ImagePlaceholder({ color }: { color?: string | null }) {
  const c = color || '#00d4ff'
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${c}18 0%, ${c}08 50%, #0d1224 100%)`,
      }}
    >
      <Gamepad2 size={32} style={{ color: `${c}50` }} />
    </div>
  )
}

export default function ArticleCard({ post, variant = 'default', priority }: ArticleCardProps) {
  const catColor = post.category?.color || '#00d4ff'

  // ── FEATURED variant ───────────────────────────────────────────────────────
  if (variant === 'featured') {
    return (
      <Link href={`/article/${post.slug}`} className="group block relative overflow-hidden rounded-2xl h-full min-h-[320px]">
        <div className="absolute inset-0 bg-dark-800">
          <FallbackImage
            src={post.featuredImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 66vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            catColor={catColor}
            priority={priority}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent" />

          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            {post.category && (
              <span
                className="badge mb-3 self-start"
                style={{
                  background: `${catColor}22`,
                  color: catColor,
                  border: `1px solid ${catColor}44`,
                }}
              >
                {post.category.name}
              </span>
            )}
            <h2 className="font-display font-bold text-xl sm:text-2xl text-white leading-tight group-hover:text-neon-red transition-colors line-clamp-2">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-gray-300 text-sm mt-2 line-clamp-2">{post.excerpt}</p>
            )}
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
              {post.author?.name && <span>{post.author.name}</span>}
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {post.readingTime}m read
              </span>
              <span className="flex items-center gap-1">
                <Eye size={11} />
                {formatViewCount(post.views)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // ── COMPACT variant ────────────────────────────────────────────────────────
  if (variant === 'compact') {
    return (
      <Link href={`/article/${post.slug}`} className="flex gap-3 group">
        <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-dark-800">
          <FallbackImage
            src={post.featuredImage}
            alt={post.title}
            width={80}
            height={64}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            catColor={catColor}
            priority={priority}
          />
        </div>
        <div className="flex-1 min-w-0">
          {post.category && (
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: catColor }}>
              {post.category.name}
            </span>
          )}
          <h3 className="text-sm font-semibold text-gray-200 group-hover:text-neon-red transition-colors line-clamp-2 leading-tight mt-0.5">
            {post.title}
          </h3>
          <span className="text-xs text-gray-500">
            <RelativeTime date={post.publishedAt} />
          </span>
        </div>
      </Link>
    )
  }

  // ── HORIZONTAL variant ─────────────────────────────────────────────────────
  if (variant === 'horizontal') {
    return (
      <Link href={`/article/${post.slug}`} className="flex gap-3 sm:gap-4 group glass-card p-3 sm:p-4">
        <div className="w-24 h-20 sm:w-32 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-dark-800">
          <FallbackImage
            src={post.featuredImage}
            alt={post.title}
            width={128}
            height={96}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            catColor={catColor}
            priority={priority}
          />
        </div>
        <div className="flex-1 min-w-0">
          {post.category && (
            <span className="badge badge-neon text-xs mb-2 inline-block">{post.category.name}</span>
          )}
          <h3 className="font-semibold text-gray-100 group-hover:text-neon-red transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Eye size={10} />{formatViewCount(post.views)}</span>
            <span className="flex items-center gap-1"><Clock size={10} />{post.readingTime}m</span>
            {post.publishedAt && <RelativeTime date={post.publishedAt} />}
          </div>
        </div>
      </Link>
    )
  }

  // ── DEFAULT card ───────────────────────────────────────────────────────────
  return (
    <Link href={`/article/${post.slug}`} className="group flex flex-col h-full glass-card overflow-hidden">
      <div className="relative aspect-[16/9] w-full flex-shrink-0 overflow-hidden bg-dark-800">
        <FallbackImage
          src={post.featuredImage}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          catColor={catColor}
          priority={priority}
        />

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          {post.trending && (
            <span className="badge bg-neon-pink/15 text-neon-pink border border-neon-pink/30 text-xs">🔥 Trending</span>
          )}
          {post.featured && (
            <span className="badge badge-neon text-xs">⭐ Featured</span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {post.category && (
          <Link
            href={`/category/${post.category.slug}`}
            className="text-xs font-bold uppercase tracking-wider mb-2 inline-block hover:underline"
            style={{ color: catColor }}
            onClick={(e) => e.stopPropagation()}
          >
            {post.category.name}
          </Link>
        )}

        <h3 className="font-display font-bold text-gray-100 group-hover:text-neon-red transition-colors leading-snug line-clamp-2 mb-2">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
        )}

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {post.author?.image && (
              <Image src={post.author.image} alt={post.author.name || ''} width={20} height={20} className="rounded-full" />
            )}
            <span>{post.author?.name || 'GamePulse'}</span>
            <RelativeTime date={post.publishedAt} />
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Eye size={10} />{formatViewCount(post.views)}</span>
            <span className="flex items-center gap-1"><Heart size={10} />{formatViewCount(post.likes)}</span>
            {post._count && (
              <span className="flex items-center gap-1"><MessageSquare size={10} />{post._count.comments}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Helper: image with graceful fallback ────────────────────────────────────
interface FallbackImageProps {
  src?: string | null
  alt: string
  catColor: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
}

function FallbackImage({ src, alt, catColor, fill, width, height, sizes, className, priority }: FallbackImageProps) {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return <ImagePlaceholder color={catColor} />
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        priority={priority}
        onError={() => setErrored(true)}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width!}
      height={height!}
      className={className}
      priority={priority}
      onError={() => setErrored(true)}
    />
  )
}

