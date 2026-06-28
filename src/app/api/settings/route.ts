import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'site' } })
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await req.json()
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'site' },
    update: { ...data, updatedAt: new Date() },
    create: { id: 'site', ...data },
  })

  return NextResponse.json(settings)
}
