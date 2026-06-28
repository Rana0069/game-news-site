import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import prisma from '@/lib/db'
import ArticleCard from '@/components/article/ArticleCard'
import Sidebar from '@/components/layout/Sidebar'
import { ChevronRight } from 'lucide-react'

interface Props { params: { slug: string } }

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: { _count: { select: { posts: true } } },
  })
}

async function getCategoryPosts(categoryId: string) {
  return prisma.post.findMany({
    where: { status: 'published', categoryId },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    include: {
      author: { select: { name: true, image: true } },
      category: true,
      _count: { select: { comments: true } },
    },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await getCategory(params.slug)
  if (!cat) return {}
  return {
    title: `${cat.name} – Gaming News | GamePulse`,
    description: cat.description || `Latest ${cat.name} gaming news, reviews, and articles.`,
    openGraph: {
      title: `${cat.name} – Gaming News | GamePulse`,
      description: cat.description || `Latest ${cat.name} gaming news, reviews, and articles.`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${cat.name} – Gaming News | GamePulse`,
    }
  }
}

export default async function CategoryPage({ params }: Props) {
  const category = await getCategory(params.slug)
  if (!category) notFound()

  const posts = await getCategoryPosts(category.id)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-neon-blue">Home</Link>
        <ChevronRight size={14} />
        <span style={{ color: category.color || '#00d4ff' }}>{category.name}</span>
      </nav>

      {/* Category header */}
      <div className="mb-8 pb-6 border-b border-white/5">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${category.color || '#00d4ff'}15` }}>
            {category.icon || '🎮'}
          </div>
          <div>
            <h1 className="font-display font-black text-3xl text-white">{category.name}</h1>
            <p className="text-gray-500 text-sm">{category._count.posts} articles</p>
          </div>
        </div>
        {category.description && <p className="text-gray-400">{category.description}</p>}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
        <div>
          {posts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No articles in this category yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {posts.map((post) => (
                <ArticleCard key={post.id} post={post} variant="default" />
              ))}
            </div>
          )}
        </div>
        <Sidebar />
      </div>
    </div>
  )
}
