import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const game = await prisma.game.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
  })
  if (!game) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(game)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const game = await prisma.game.update({
    where: { id: params.id },
    data: {
      ...body,
      platforms: body.platforms ? JSON.stringify(body.platforms) : undefined,
      genres: body.genres ? JSON.stringify(body.genres) : undefined,
      screenshots: body.screenshots ? JSON.stringify(body.screenshots) : undefined,
      releaseDate: body.releaseDate ? new Date(body.releaseDate) : undefined,
    },
  })
  return NextResponse.json(game)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await prisma.game.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
