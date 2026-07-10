export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { generateSlug, calculateReadingTime } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const status = searchParams.get('status') || 'published'
    const featured = searchParams.get('featured')
    const trending = searchParams.get('trending')
    const sort = searchParams.get('sort') || 'latest'

    const session = await getServerSession(authOptions)
    const isAdmin = session?.user && ['admin', 'editor', 'author'].includes((session.user as any).role)

    const where: any = {}
    if (!isAdmin || status !== 'all') where.status = status === 'all' ? undefined : (status as any)
    if (category) where.category = { slug: category }
    if (tag) where.tags = { some: { tag: { slug: tag } } }
    if (featured === 'true') where.featured = true
    if (trending === 'true') where.trending = true

    const orderBy: any = sort === 'popular' ? { views: 'desc' } : sort === 'likes' ? { likes: 'desc' } : { publishedAt: 'desc' }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: { select: { id: true, name: true, image: true } },
          category: true,
          tags: { include: { tag: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({ posts, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (error: any) {
    console.error('GET /api/posts error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const authorId = (session.user as any).id
    if (!authorId) {
      return NextResponse.json({ error: 'Session missing user ID — please log out and back in' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title, content, excerpt, featuredImage, images, youtubeUrls,
      status, categoryId, tags, featured, trending,
      metaTitle, metaDescription, metaKeywords, ogImage, publishAt, relatedPosts,
    } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const slug = generateSlug(title)
    const readingTime = calculateReadingTime(content)

    // Check for slug collision and add suffix if needed
    const existing = await prisma.post.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const post = await prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        content,
        excerpt: excerpt || null,
        featuredImage: featuredImage || null,
        images: images ? JSON.stringify(images) : null,
        youtubeUrls: youtubeUrls ? JSON.stringify(youtubeUrls) : null,
        status: status || 'draft',
        publishedAt: status === 'published' ? new Date() : null,
        publishAt: publishAt ? new Date(publishAt) : null,
        readingTime,
        featured: featured || false,
        trending: trending || false,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        metaKeywords: metaKeywords || null,
        ogImage: ogImage || null,
        relatedPosts: relatedPosts ? JSON.stringify(relatedPosts) : null,
        authorId,
        categoryId: categoryId || null,
        tags: tags?.length
          ? { create: tags.map((tagId: string) => ({ tagId })) }
          : undefined,
      },
      include: { author: true, category: true, tags: { include: { tag: true } } },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/posts error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    )
  }
}

