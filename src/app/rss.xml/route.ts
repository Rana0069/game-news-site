export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { stripHtml } from '@/lib/utils'

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const posts = await prisma.post.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    take: 50,
    include: { author: { select: { name: true } }, category: true },
  }).catch(() => [])

  const settings = await prisma.siteSettings.findUnique({ where: { id: 'site' } }).catch(() => null)
  const siteName = settings?.siteName || 'GamePulse'

  const items = posts.map((post) => `
  <item>
    <title><![CDATA[${post.title}]]></title>
    <link>${baseUrl}/article/${post.slug}</link>
    <guid isPermaLink="true">${baseUrl}/article/${post.slug}</guid>
    <description><![CDATA[${post.excerpt || stripHtml(post.content).slice(0, 200)}]]></description>
    <pubDate>${new Date(post.publishedAt || post.createdAt).toUTCString()}</pubDate>
    ${post.author?.name ? `<author>${post.author.name}</author>` : ''}
    ${post.category ? `<category>${post.category.name}</category>` : ''}
    ${post.featuredImage ? `<enclosure url="${baseUrl}${post.featuredImage}" type="image/jpeg" />` : ''}
  </item>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${siteName}]]></title>
    <link>${baseUrl}</link>
    <description><![CDATA[Your Ultimate Gaming Destination]]></description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}

