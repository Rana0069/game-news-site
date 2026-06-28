import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category')
  const tag = searchParams.get('tag')
  const sort = searchParams.get('sort') || 'latest'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')

  if (!q && !category && !tag) {
    return NextResponse.json({ posts: [], total: 0 })
  }

  const where: any = {
    status: 'published',
    AND: [],
  }

  if (q) {
    where.AND.push({
      OR: [
        { title: { contains: q } },
        { excerpt: { contains: q } },
        { content: { contains: q } },
      ],
    })
  }
  if (category) where.AND.push({ category: { slug: category } })
  if (tag) where.AND.push({ tags: { some: { tag: { slug: tag } } } })

  const orderBy: any = sort === 'popular' ? { views: 'desc' } : sort === 'trending' ? { trending: 'desc' } : { publishedAt: 'desc' }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: { select: { name: true, image: true } },
        category: true,
        _count: { select: { comments: true } },
      },
    }),
    prisma.post.count({ where }),
  ])

  return NextResponse.json({ posts, total, pages: Math.ceil(total / limit) })
}
