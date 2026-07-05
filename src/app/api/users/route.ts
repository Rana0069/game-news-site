export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET all users — any logged-in admin/editor can view
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any).role
  if (!['admin', 'editor'].includes(role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      image: true, bio: true, createdAt: true,
      _count: { select: { posts: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(users)
}

// POST — create a new team member (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any).role
  if (role !== 'admin') return NextResponse.json({ error: 'Only admins can add team members' }, { status: 403 })

  try {
    const body = await req.json()
    const { name, email, password, role: newRole, bio } = body

    if (!email || !password || !name)
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })

    const validRoles = ['admin', 'editor', 'author', 'moderator']
    if (!validRoles.includes(newRole))
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: newRole, bio: bio || null },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    return NextResponse.json(user, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
