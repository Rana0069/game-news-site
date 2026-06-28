import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Increment view count
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.post.update({
    where: { id: params.id },
    data: { views: { increment: 1 } },
  })
  return NextResponse.json({ success: true })
}

// Toggle like
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const delta = body.liked ? 1 : -1
  const post = await prisma.post.update({
    where: { id: params.id },
    data: { likes: { increment: delta } },
    select: { likes: true },
  })
  return NextResponse.json({ likes: post.likes })
}
