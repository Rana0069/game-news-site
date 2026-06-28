'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart, Share2, Bookmark, Clock, Eye, MessageSquare, ChevronRight,
  Twitter, Facebook, Link as LinkIcon, User, Calendar, Tag
} from 'lucide-react'
import { formatDate, formatViewCount, safeJsonParse, buildYouTubeEmbedUrl } from '@/lib/utils'
import ArticleCard from './ArticleCard'

interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  content: string
  featuredImage?: string | null
  images?: string | null
  youtubeUrls?: string | null
  publishedAt?: Date | null
  updatedAt: Date
  readingTime: number
  views: number
  likes: number
  author: { id: string; name?: string | null; image?: string | null; bio?: string | null; twitter?: string | null }
  category?: { name: string; slug: string; color?: string | null } | null
  tags: { tag: { name: string; slug: string } }[]
  _count: { comments: number }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  guestName?: string | null
  author?: { name?: string | null; image?: string | null } | null
}

export default function ArticleReader({ post, relatedPosts }: { post: Post; relatedPosts: any[] }) {
  const [likes, setLikes] = useState(post.likes)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentForm, setCommentForm] = useState({ content: '', guestName: '', guestEmail: '' })
  const [submitting, setSubmitting] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const youtubeUrls = safeJsonParse<string[]>(post.youtubeUrls, [])
  const images = safeJsonParse<string[]>(post.images, [])

  // Reading progress
  useEffect(() => {
    const handleScroll = () => {
      const el = contentRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const contentHeight = el.offsetHeight
      const scrolled = -rect.top
      const progress = Math.min(Math.max(scrolled / contentHeight, 0), 1)
      setReadingProgress(progress * 100)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Bookmark & like from localStorage
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]')
    setBookmarked(bookmarks.includes(post.id))
    const likedPosts = JSON.parse(localStorage.getItem('liked') || '[]')
    setLiked(likedPosts.includes(post.id))
  }, [post.id])

  // Load comments
  useEffect(() => {
    fetch(`/api/comments?postId=${post.id}&status=approved`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {})
  }, [post.id])

  const handleLike = async () => {
    const newLiked = !liked
    setLiked(newLiked)
    setLikes((l) => l + (newLiked ? 1 : -1))

    const likedPosts = JSON.parse(localStorage.getItem('liked') || '[]')
    if (newLiked) {
      localStorage.setItem('liked', JSON.stringify([...likedPosts, post.id]))
    } else {
      localStorage.setItem('liked', JSON.stringify(likedPosts.filter((id: string) => id !== post.id)))
    }

    await fetch(`/api/posts/${post.id}/interact`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liked: newLiked }),
    })
  }

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]')
    let newBookmarks
    if (bookmarked) {
      newBookmarks = bookmarks.filter((id: string) => id !== post.id)
    } else {
      newBookmarks = [...bookmarks, post.id]
    }
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks))
    setBookmarked(!bookmarked)
  }

  const handleShare = async (platform?: string) => {
    const url = window.location.href
    const text = post.title
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)
    } else if (platform === 'facebook') {
      window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
    } else if (platform === 'copy') {
      await navigator.clipboard.writeText(url)
      alert('Link copied!')
    } else if (navigator.share) {
      await navigator.share({ title: text, url })
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, ...commentForm }),
      })
      if (res.ok) {
        const comment = await res.json()
        if (comment.status === 'approved') setComments((c) => [comment, ...c])
        setCommentForm({ content: '', guestName: '', guestEmail: '' })
        alert(comment.status === 'pending' ? 'Comment submitted for review!' : 'Comment posted!')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Reading progress bar */}
      <div className="reading-progress" style={{ width: `${readingProgress}%` }} />

      <article>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-neon-blue transition-colors">Home</Link>
          <ChevronRight size={14} />
          {post.category && (
            <>
              <Link href={`/category/${post.category.slug}`} className="hover:text-neon-blue transition-colors" style={{ color: post.category.color || undefined }}>
                {post.category.name}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-gray-600 line-clamp-1">{post.title}</span>
        </nav>

        {/* Category badge */}
        {post.category && (
          <Link href={`/category/${post.category.slug}`}>
            <span className="badge mb-4 inline-block" style={{ background: `${post.category.color}22`, color: post.category.color || '#00d4ff', border: `1px solid ${post.category.color}44` }}>
              {post.category.name}
            </span>
          </Link>
        )}

        {/* Title */}
        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-6">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6 pb-6 border-b border-white/5">
          {/* Author */}
          <Link href={`/author/${post.author.id}`} className="flex items-center gap-2 hover:text-white transition-colors">
            {post.author.image ? (
              <Image src={post.author.image} alt={post.author.name || ''} width={28} height={28} className="rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                <User size={14} className="text-black" />
              </div>
            )}
            <span className="font-medium">{post.author.name || 'GamePulse'}</span>
          </Link>

          <span className="flex items-center gap-1">
            <Calendar size={13} />
            {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} />
            {post.readingTime} min read
          </span>
          <span className="flex items-center gap-1">
            <Eye size={13} />
            {formatViewCount(post.views)} views
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={13} />
            {post._count.comments} comments
          </span>
        </div>

        {/* Featured image */}
        {post.featuredImage && (
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-8 border border-white/5">
            <Image src={post.featuredImage} alt={post.title} fill className="object-cover" priority />
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-gray-300 leading-relaxed mb-8 p-4 border-l-4 border-neon-blue/50 bg-neon-blue/5 rounded-r-xl">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div ref={contentRef}>
          <div
            className="prose-gaming mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* YouTube embeds */}
        {youtubeUrls.length > 0 && (
          <div className="mb-8 space-y-6">
            <h3 className="font-display font-bold text-xl text-white">📺 Related Videos</h3>
            {youtubeUrls.map((url, i) => (
              <div key={i} className="youtube-embed-wrapper">
                <iframe
                  src={buildYouTubeEmbedUrl(url)}
                  title={`Video ${i + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        )}

        {/* Image gallery */}
        {images.length > 0 && (
          <div className="mb-8">
            <h3 className="font-display font-bold text-xl text-white mb-4">📷 Image Gallery</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-white/5">
                  <Image src={img} alt={`Gallery ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Tag size={14} className="text-gray-500 mt-1" />
            {post.tags.map(({ tag }) => (
              <Link key={tag.slug} href={`/tag/${tag.slug}`} className="px-3 py-1 rounded-full text-sm bg-white/5 border border-white/10 text-gray-400 hover:bg-neon-blue/10 hover:border-neon-blue/30 hover:text-neon-blue transition-all">
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between py-6 border-y border-white/5 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${liked ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-white/10 bg-white/5 text-gray-400 hover:text-red-400 hover:border-red-500/30'}`}
            >
              <Heart size={16} className={liked ? 'fill-current' : ''} />
              <span className="text-sm font-medium">{formatViewCount(likes)}</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${bookmarked ? 'border-neon-blue/50 bg-neon-blue/10 text-neon-blue' : 'border-white/10 bg-white/5 text-gray-400 hover:text-neon-blue hover:border-neon-blue/30'}`}
            >
              <Bookmark size={16} className={bookmarked ? 'fill-current' : ''} />
              <span className="text-sm font-medium">{bookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 mr-1">Share:</span>
            <button onClick={() => handleShare('twitter')} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#1da1f2] hover:border-[#1da1f2]/30 transition-all" aria-label="Share on Twitter">
              <Twitter size={14} />
            </button>
            <button onClick={() => handleShare('facebook')} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#1877f2] hover:border-[#1877f2]/30 transition-all" aria-label="Share on Facebook">
              <Facebook size={14} />
            </button>
            <button onClick={() => handleShare('copy')} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-neon-blue hover:border-neon-blue/30 transition-all" aria-label="Copy link">
              <LinkIcon size={14} />
            </button>
          </div>
        </div>

        {/* Author bio */}
        {post.author.bio && (
          <div className="glass-card p-6 mb-8">
            <h3 className="font-display font-bold text-lg text-white mb-4">About the Author</h3>
            <div className="flex gap-4">
              {post.author.image ? (
                <Image src={post.author.image} alt={post.author.name || ''} width={60} height={60} className="rounded-full flex-shrink-0" />
              ) : (
                <div className="w-15 h-15 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center flex-shrink-0">
                  <User size={28} className="text-black" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-white">{post.author.name}</h4>
                <p className="text-gray-400 text-sm mt-1">{post.author.bio}</p>
                {post.author.twitter && (
                  <a href={`https://twitter.com/${post.author.twitter}`} className="text-neon-blue text-sm mt-2 inline-flex items-center gap-1 hover:underline" target="_blank">
                    <Twitter size={12} /> @{post.author.twitter}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="mb-8">
            <h2 className="section-title mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((p) => (
                <ArticleCard key={p.id} post={p} variant="default" />
              ))}
            </div>
          </section>
        )}

        {/* Comments */}
        <section>
          <h2 className="section-title mb-6">
            <MessageSquare size={20} className="text-neon-blue" />
            Comments ({comments.length})
          </h2>

          {/* Comment form */}
          <form onSubmit={handleComment} className="glass-card p-6 mb-6">
            <h3 className="font-semibold text-white mb-4">Leave a Comment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Your name"
                value={commentForm.guestName}
                onChange={(e) => setCommentForm((f) => ({ ...f, guestName: e.target.value }))}
                className="input-dark"
                required
              />
              <input
                type="email"
                placeholder="Your email"
                value={commentForm.guestEmail}
                onChange={(e) => setCommentForm((f) => ({ ...f, guestEmail: e.target.value }))}
                className="input-dark"
                required
              />
            </div>
            <textarea
              placeholder="Share your thoughts..."
              value={commentForm.content}
              onChange={(e) => setCommentForm((f) => ({ ...f, content: e.target.value }))}
              className="input-dark min-h-[100px] resize-none mb-4"
              required
            />
            <button type="submit" disabled={submitting} className="btn-neon relative z-10">
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>

          {/* Comments list */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="glass-card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-neon-blue" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-sm text-white">
                        {comment.author?.name || comment.guestName || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-gray-500 text-center py-8">No comments yet. Be the first!</p>
            )}
          </div>
        </section>
      </article>
    </>
  )
}
