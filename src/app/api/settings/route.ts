export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// Whitelist of every column that exists in SiteSettings.
// Any field NOT in this list will be stripped before upsert to avoid
// Prisma "Unknown arg" runtime errors when the schema has new fields
// that haven't been deployed yet (or vice-versa).
const ALLOWED_FIELDS = new Set([
  'siteName', 'siteTagline', 'logo', 'favicon',
  'accentColor', 'accentColor2', 'accentColor3',
  'buttonStyle', 'cardStyle', 'borderRadius', 'navStyle',
  'footerText',
  'twitterUrl', 'facebookUrl', 'instagramUrl',
  'youtubeUrl', 'discordUrl', 'twitchUrl',
  'contactEmail', 'aboutText', 'googleAnalyticsId',
])

function sanitize(data: Record<string, any>) {
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(data)) {
    if (ALLOWED_FIELDS.has(k)) out[k] = v
  }
  return out
}

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'site' } })
    return NextResponse.json(settings ?? {})
  } catch {
    return NextResponse.json({})
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const raw  = await req.json()
    const data = sanitize(raw)
    const settings = await prisma.siteSettings.upsert({
      where:  { id: 'site' },
      update: { ...data, updatedAt: new Date() },
      create: { id: 'site', ...data },
    })
    return NextResponse.json(settings)
  } catch (err: any) {
    console.error('[settings PUT]', err)
    return NextResponse.json({ error: 'Save failed', detail: err?.message }, { status: 500 })
  }
}

