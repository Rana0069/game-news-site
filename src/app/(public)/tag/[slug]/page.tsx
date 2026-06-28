import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import prisma from '@/lib/db'
import ArticleCard from '@/components/article/ArticleCard'
import Sidebar from '@/components/layout/Sidebar'
import { ChevronRight } from 'lucide-react'

interface Props { params: { slug: string } }

async function getTag(slug: string) {
  return prisma.tag.findUnique({
    where: { slug },
    include: { _count: { select: { posts: true } } },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = await getTag(params.slug)
  if (!tag) return {}
  return {
    title: `#${tag.name} | GamePulse`,
    description: `Articles and news tagged with #${tag.name} on GamePulse.`,
    openGraph: {
      title: `#${tag.name} | GamePulse`,
      description: `Articles and news tagged with #${tag.name} on GamePulse.`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `#${tag.name} | GamePulse`,
    }
  }
}

export default async function TagPage({ params }: Props) {
  const tag = await getTag(params.slug)
  if (!tag) notFound()

  const posts = await prisma.post.findMany({
    where: { status: 'published', tags: { some: { tag: { slug: params.slug } } } },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    include: { author: { select: { name: true, image: true } }, category: true, _count: { select: { comments: true } } },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-neon-blue">Home</Link>
        <ChevronRight size={14} />
        <span className="text-neon-blue">#{tag.name}</span>
      </nav>

      <h1 className="font-display font-black text-3xl text-white mb-2">#{tag.name}</h1>
      <p className="text-gray-500 mb-8">{tag._count.posts} articles</p>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {posts.map((post) => <ArticleCard key={post.id} post={post} variant="default" />)}
          {posts.length === 0 && <p className="text-gray-500 sm:col-span-2 py-16 text-center">No articles yet.</p>}
        </div>
        <Sidebar />
      </div>
    </div>
  )
}
