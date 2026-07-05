export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

interface Params { params: { id: string } }

/**
 * Finds the site owner — the oldest admin account ever created.
 * This user is protected: nobody (not even other admins) can change
 * their role or delete them. The owner can optionally be pinned via
 * the OWNER_EMAIL env var for extra safety.
 */
async function getOwnerId(): Promise<string | null> {
  // Env-var override: if OWNER_EMAIL is set, that user is always the owner
  if (process.env.OWNER_EMAIL) {
    const pinned = await prisma.user.findUnique({
      where: { email: process.env.OWNER_EMAIL },
      select: { id: true },
    })
    if (pinned) return pinned.id
  }

  // Fallback: the earliest-created admin account is the owner
  const oldest = await prisma.user.findFirst({
    where: { role: 'admin' },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  })
  return oldest?.id ?? null
}

// PATCH — update role, name, bio, or password
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const callerRole = (session.user as any).role
  const callerId   = (session.user as any).id

  if (callerRole !== 'admin' && callerId !== params.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const { name, bio, role, password } = body

    // Only admins can change roles, and cannot demote themselves
    if (role !== undefined && callerRole !== 'admin')
      return NextResponse.json({ error: 'Only admins can change roles' }, { status: 403 })
    if (role !== undefined && callerId === params.id)
      return NextResponse.json({ error: 'You cannot change your own role' }, { status: 400 })

    // 🔒 Owner protection — no one can change the original owner's role
    if (role !== undefined) {
      const ownerId = await getOwnerId()
      if (ownerId && params.id === ownerId) {
        return NextResponse.json(
          { error: 'The site owner\'s role is protected and cannot be changed.' },
          { status: 403 }
        )
      }
    }

    const validRoles = ['admin', 'editor', 'author', 'moderator']
    if (role !== undefined && !validRoles.includes(role))
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })

    const data: any = {}
    if (name !== undefined) data.name = name
    if (bio  !== undefined) data.bio  = bio
    if (role !== undefined) data.role = role
    if (password) {
      if (password.length < 8)
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
      data.password = await bcrypt.hash(password, 12)
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, email: true, role: true, bio: true, createdAt: true },
    })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE — remove a team member (admin only, cannot delete self or owner)
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const callerRole = (session.user as any).role
  const callerId   = (session.user as any).id

  if (callerRole !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  if (callerId === params.id)
    return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })

  // 🔒 Owner protection — no one can delete the original owner account
  const ownerId = await getOwnerId()
  if (ownerId && params.id === ownerId) {
    return NextResponse.json(
      { error: 'The site owner account cannot be deleted.' },
      { status: 403 }
    )
  }

  try {
    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
