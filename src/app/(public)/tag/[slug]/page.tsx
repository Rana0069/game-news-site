// Cache tag pages for 1 hour — reduces ISR writes significantly
export const revalidate = 3600

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
  return { title: `#${tag.name} articles`, description: `Articles tagged with ${tag.name}` }
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
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-neon-red">Home</Link>
        <ChevronRight size={14} />
        <span className="text-neon-red">#{tag.name}</span>
      </nav>

      <header className="mb-8">
        <h1 className="font-display font-black text-3xl text-white mb-2">#{tag.name}</h1>
        <p className="text-gray-500">{tag._count.posts} articles</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
        <section aria-label={`Articles tagged ${tag.name}`}>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {posts.map((post) => <li key={post.id}><ArticleCard post={post} variant="default" /></li>)}
            {posts.length === 0 && <li><p className="text-gray-500 py-16 text-center">No articles yet.</p></li>}
          </ul>
        </section>
        <Sidebar />
      </div>
    </div>
  )
}
