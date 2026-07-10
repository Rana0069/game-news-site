export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(req: NextRequest) {
  const { email, name } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { active: true },
    create: { email, name },
  })

  return NextResponse.json({ success: true, message: 'Subscribed!' })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  if (email) {
    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { active: false },
    })
    return NextResponse.json({ success: true, message: 'Unsubscribed' })
  }
  const subs = await prisma.newsletterSubscriber.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ subscribers: subs, total: subs.length })
}

