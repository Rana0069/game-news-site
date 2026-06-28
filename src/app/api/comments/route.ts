export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const postId = searchParams.get('postId')
  const status = searchParams.get('status') || 'approved'

  const where: any = {}
  if (postId) where.postId = postId
  if (status !== 'all') where.status = status

  const comments = await prisma.comment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true, image: true } } },
  })
  return NextResponse.json(comments)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const { postId, content, guestName, guestEmail } = await req.json()

  if (!postId || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const comment = await prisma.comment.create({
    data: {
      postId,
      content,
      authorId: session?.user ? (session.user as any).id : null,
      guestName: !session?.user ? guestName : null,
      guestEmail: !session?.user ? guestEmail : null,
      status: session?.user ? 'approved' : 'pending',
    },
    include: { author: { select: { name: true, image: true } } },
  })
  return NextResponse.json(comment, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status } = await req.json()
  const comment = await prisma.comment.update({ where: { id }, data: { status } })
  return NextResponse.json(comment)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await prisma.comment.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
