export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { generateSlug, calculateReadingTime } from '@/lib/utils'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const post = await prisma.post.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: {
      author: { select: { id: true, name: true, image: true, bio: true } },
      category: true,
      tags: { include: { tag: true } },
      _count: { select: { comments: true } },
    },
  })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, content, excerpt, featuredImage, images, youtubeUrls, status, categoryId, tags, featured, trending, metaTitle, metaDescription, metaKeywords, ogImage, publishAt, relatedPosts } = body

  const readingTime = content ? calculateReadingTime(content) : undefined
  const slug = title ? generateSlug(title) : undefined

  // Get current post to check if status is changing to published
  const current = await prisma.post.findUnique({ where: { id: params.id } })
  const publishedAt = status === 'published' && current?.status !== 'published' ? new Date() : current?.publishedAt

  // Handle tags update
  if (tags !== undefined) {
    await prisma.tagsOnPosts.deleteMany({ where: { postId: params.id } })
  }

  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      ...(title && { title, slug }),
      ...(content && { content, readingTime }),
      ...(excerpt !== undefined && { excerpt }),
      ...(featuredImage !== undefined && { featuredImage }),
      ...(images !== undefined && { images: JSON.stringify(images) }),
      ...(youtubeUrls !== undefined && { youtubeUrls: JSON.stringify(youtubeUrls) }),
      ...(status !== undefined && { status, publishedAt }),
      ...(publishAt !== undefined && { publishAt: publishAt ? new Date(publishAt) : null }),
      ...(categoryId !== undefined && { categoryId }),
      ...(featured !== undefined && { featured }),
      ...(trending !== undefined && { trending }),
      ...(metaTitle !== undefined && { metaTitle }),
      ...(metaDescription !== undefined && { metaDescription }),
      ...(metaKeywords !== undefined && { metaKeywords }),
      ...(ogImage !== undefined && { ogImage }),
      ...(relatedPosts !== undefined && { relatedPosts: JSON.stringify(relatedPosts) }),
      updatedAt: new Date(),
      ...(tags !== undefined && {
        tags: { create: tags.map((tagId: string) => ({ tagId })) },
      }),
    },
    include: { author: true, category: true, tags: { include: { tag: true } } },
  })

  return NextResponse.json(post)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.post.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
