import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [totalPosts, published, drafts, totalViews, totalComments, totalSubscribers, recentPosts] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'published' } }),
    prisma.post.count({ where: { status: 'draft' } }),
    prisma.post.aggregate({ _sum: { views: true } }),
    prisma.comment.count({ where: { status: 'approved' } }),
    prisma.newsletterSubscriber.count({ where: { active: true } }),
    prisma.post.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true, title: true, slug: true, status: true, views: true,
        publishedAt: true, updatedAt: true,
        author: { select: { name: true } },
        category: { select: { name: true, color: true } },
      },
    }),
  ])

  return NextResponse.json({
    totalPosts,
    published,
    drafts,
    totalViews: totalViews._sum.views || 0,
    totalComments,
    totalSubscribers,
    recentPosts,
  })
}
