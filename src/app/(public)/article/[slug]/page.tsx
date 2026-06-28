import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import prisma from '@/lib/db'
import ArticleReader from '@/components/article/ArticleReader'
import Sidebar from '@/components/layout/Sidebar'

interface Props {
  params: { slug: string }
}

async function getPost(slug: string) {
  try {
    const post = await prisma.post.findFirst({
      where: { slug, status: 'published' },
      include: {
        author: { select: { id: true, name: true, image: true, bio: true, twitter: true } },
        category: true,
        tags: { include: { tag: true } },
        _count: { select: { comments: true } },
      },
    })
    return post
  } catch {
    return null
  }
}

async function getRelatedPosts(post: any) {
  try {
    return await prisma.post.findMany({
      where: {
        status: 'published',
        id: { not: post.id },
        OR: [
          { categoryId: post.categoryId },
          { tags: { some: { tagId: { in: post.tags.map((t: any) => t.tagId) } } } },
        ],
      },
      take: 3,
      orderBy: { views: 'desc' },
      include: { category: true, author: { select: { name: true } }, _count: { select: { comments: true } } },
    })
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return {}
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || '',
    keywords: post.metaKeywords || '',
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      images: post.ogImage || post.featuredImage ? [{ url: post.ogImage || post.featuredImage || '' }] : [],
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.name || ''],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || '',
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  const relatedPosts = await getRelatedPosts(post)
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  // Increment views (fire and forget)
  prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => {})

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || '',
    image: post.featuredImage ? [`${baseUrl}${post.featuredImage}`] : [],
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name || 'GamePulse',
    },
    publisher: {
      '@type': 'Organization',
      name: 'GamePulse',
      url: baseUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/article/${post.slug}`,
    },
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
        <ArticleReader post={post} relatedPosts={relatedPosts} />
        <Suspense fallback={<div className="space-y-6"><div className="h-64 skeleton rounded-2xl" /></div>}>
          <Sidebar />
        </Suspense>
      </div>
    </div>
  )
}
