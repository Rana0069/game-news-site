import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { generateSlug } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const featured = searchParams.get('featured')
  const upcoming = searchParams.get('upcoming')
  const q = searchParams.get('q')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')

  const where: any = {}
  if (featured === 'true') where.featured = true
  if (upcoming === 'true') where.upcoming = true
  if (q) where.title = { contains: q }

  const [games, total] = await Promise.all([
    prisma.game.findMany({
      where,
      orderBy: { releaseDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.game.count({ where }),
  ])

  return NextResponse.json({ games, total, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const slug = generateSlug(body.title)
  const game = await prisma.game.create({
    data: {
      ...body,
      slug,
      platforms: body.platforms ? JSON.stringify(body.platforms) : null,
      genres: body.genres ? JSON.stringify(body.genres) : null,
      screenshots: body.screenshots ? JSON.stringify(body.screenshots) : null,
      systemRequirements: body.systemRequirements ? JSON.stringify(body.systemRequirements) : null,
      releaseDate: body.releaseDate ? new Date(body.releaseDate) : null,
    },
  })
  return NextResponse.json(game, { status: 201 })
}
