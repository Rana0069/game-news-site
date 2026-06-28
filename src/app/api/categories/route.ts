import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { generateSlug } from '@/lib/utils'

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description, icon, color, parentId } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const slug = generateSlug(name)
  const category = await prisma.category.create({
    data: { name, slug, description, icon, color, parentId },
  })
  return NextResponse.json(category, { status: 201 })
}
