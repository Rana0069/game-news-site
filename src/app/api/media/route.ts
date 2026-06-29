export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// Convert file to base64 data URL for storage (works on serverless / Vercel)
// For production with many images, swap this for Cloudinary by adding:
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
// to your Vercel environment variables.

async function uploadToCloudinary(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (cloudName && apiKey && apiSecret) {
    // ── Cloudinary upload ────────────────────────────────────────────────────
    const base64 = buffer.toString('base64')
    const dataUri = `data:${mimeType};base64,${base64}`

    const formData = new FormData()
    formData.append('file', dataUri)
    formData.append('upload_preset', 'unsigned_upload') // create this in Cloudinary dashboard
    formData.append('folder', 'gamepulse')

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      const data = await res.json()
      return data.secure_url
    }
  }

  // ── Fallback: base64 data URL stored in DB ──────────────────────────────
  // Works on Vercel without any external service.
  // Note: large images increase DB size — for production use Cloudinary.
  const base64 = buffer.toString('base64')
  return `data:${mimeType};base64,${base64}`
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'general'
    const altText = (formData.get('altText') as string) || ''

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, GIF, WebP or SVG.' }, { status: 400 })
    }

    // Limit to 5MB to keep base64 data URLs manageable
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const url = await uploadToCloudinary(buffer, file.name, file.type)

    const media = await prisma.media.create({
      data: {
        filename: file.name,
        url,
        mimeType: file.type,
        size: file.size,
        folder,
        altText,
      },
    })

    return NextResponse.json(media, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/media error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const folder = searchParams.get('folder')
    const q = searchParams.get('q')

    const where: any = {}
    if (folder) where.folder = folder
    if (q) where.filename = { contains: q }

    const media = await prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(media)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch media' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await req.json()
    const media = await prisma.media.findUnique({ where: { id } })
    if (!media) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.media.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Delete failed' }, { status: 500 })
  }
}
