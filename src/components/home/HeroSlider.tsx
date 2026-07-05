'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Eye, Pause, Play } from 'lucide-react'
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
  category?: { name: string; slug: string; color?: string | null } | null
  author?: { name?: string | null } | null
}

export default function HeroSlider({ posts }: { posts: Post[] }) {
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({})

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % posts.length)
  }, [posts.length])

  const prev = () => {
    setCurrent((c) => (c - 1 + posts.length) % posts.length)
  }

  useEffect(() => {
    if (!playing) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [playing, next])

  if (!posts.length) return null

  const post = posts[current]

  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] min-h-[400px] sm:min-h-[500px] max-h-[800px] overflow-hidden rounded-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Background image */}
          <div className="absolute inset-0 bg-dark-900">
            {post.featuredImage && !imgErrors[current] ? (
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
                onError={() => setImgErrors((prev) => ({ ...prev, [current]: true }))}
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: `linear-gradient(135deg, ${post.category?.color || '#00d4ff'}22 0%, #0a0f1e 60%, #030712 100%)`,
                }}
              />
            )}
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950/95 via-dark-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-dark-950/20" />

          {/* Content */}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-16">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="max-w-2xl"
              >
                {post.category && (
                  <Link href={`/category/${post.category.slug}`}>
                    <span
                      className="badge mb-4 inline-block"
                      style={{
                        background: `${post.category.color || '#00d4ff'}22`,
                        color: post.category.color || '#00d4ff',
                        border: `1px solid ${post.category.color || '#00d4ff'}44`,
                      }}
                    >
                      {post.category.name}
                    </span>
                  </Link>
                )}

                <Link href={`/article/${post.slug}`}>
                  <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-4 hover:text-neon-blue transition-colors">
                    {post.title}
                  </h1>
                </Link>

                {post.excerpt && (
                  <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-6 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-6 text-sm text-gray-400 mb-6">
                  {post.author?.name && (
                    <span className="font-medium text-gray-300">{post.author.name}</span>
                  )}
                  {post.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      <RelativeTime date={post.publishedAt} />
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye size={13} />
                    {formatViewCount(post.views)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    {post.readingTime}min read
                  </span>
                </div>

                <Link
                  href={`/article/${post.slug}`}
                  className="btn-neon inline-flex items-center gap-2 text-sm px-6 py-3 relative z-10"
                >
                  Read Article
                  <ChevronRight size={16} />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide indicators */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-2 sm:gap-3 z-10">
        {/* Autoplay toggle */}
        <button
          onClick={() => setPlaying(!playing)}
          className="w-8 h-8 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          {playing ? <Pause size={12} /> : <Play size={12} />}
        </button>

        {/* Prev/Next */}
        <button
          onClick={prev}
          className="w-8 h-8 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={next}
          className="w-8 h-8 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
        {posts.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === current ? 'w-8 bg-neon-blue' : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
