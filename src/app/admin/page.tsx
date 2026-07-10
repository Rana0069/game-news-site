'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Eye, MessageSquare, Mail, TrendingUp, Plus, Edit, Trash2, ExternalLink } from 'lucide-react'
import { formatViewCount, formatRelativeTime } from '@/lib/utils'

interface Analytics {
  totalPosts: number
  published: number
  drafts: number
  totalViews: number
  totalComments: number
  totalSubscribers: number
  recentPosts: any[]
}

const statColors = [
  { from: '#00d4ff', to: '#0891b2' },
  { from: '#a855f7', to: '#7c3aed' },
  { from: '#22c55e', to: '#16a34a' },
  { from: '#f72585', to: '#c2185b' },
]

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    loadData()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}
        </div>
        <div className="h-96 skeleton rounded-2xl" />
      </div>
    )
  }

  const stats = [
    { label: 'Total Posts', value: data?.totalPosts || 0, sub: `${data?.published} published`, icon: FileText, ...statColors[0] },
    { label: 'Total Views', value: formatViewCount(data?.totalViews || 0), sub: 'All time views', icon: Eye, ...statColors[1] },
    { label: 'Comments', value: data?.totalComments || 0, sub: 'Approved', icon: MessageSquare, ...statColors[2] },
    { label: 'Subscribers', value: data?.totalSubscribers || 0, sub: 'Newsletter', icon: Mail, ...statColors[3] },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-3xl text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <Link href="/admin/posts/new" className="btn-neon flex items-center gap-2 relative z-10">
          <Plus size={16} />
          New Post
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="glass-card p-5"
              style={{ borderColor: `${stat.from}20` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.from}18` }}
                >
                  <Icon size={18} style={{ color: stat.from }} />
                </div>
                <TrendingUp size={14} className="text-green-500" />
              </div>
              <div className="font-display font-black text-2xl text-white mb-1">{stat.value}</div>
              <div className="text-gray-500 text-xs">{stat.label}</div>
              <div className="text-gray-600 text-xs mt-1">{stat.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-neon-red">{data?.published}</div>
          <div className="text-xs text-gray-500 mt-1">Published</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{data?.drafts}</div>
          <div className="text-xs text-gray-500 mt-1">Drafts</div>
        </div>
        <div className="glass-card p-4 text-center col-span-2 sm:col-span-1">
          <div className="text-2xl font-bold text-neon-green">{data?.totalSubscribers}</div>
          <div className="text-xs text-gray-500 mt-1">Subscribers</div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="font-display font-bold text-lg text-white">Recent Posts</h2>
          <Link href="/admin/posts" className="text-sm text-neon-red hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-5 py-3">Title</th>
                <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Category</th>
                <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-5 py-3 hidden md:table-cell">Status</th>
                <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Views</th>
                <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Date</th>
                <th className="text-right text-xs text-gray-500 font-medium uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentPosts.map((post) => (
                <tr key={post.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-200 line-clamp-1">{post.title}</p>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    {post.category && (
                      <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${post.category.color}22`, color: post.category.color }}>
                        {post.category.name}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className={`badge text-xs ${post.status === 'published' ? 'badge-green' : post.status === 'draft' ? 'badge-neon' : 'badge-purple'}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell text-sm text-gray-400">
                    {formatViewCount(post.views)}
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell text-xs text-gray-500">
                    {post.publishedAt ? formatRelativeTime(new Date(post.publishedAt)) : 'Draft'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/posts/${post.id}/edit`} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-neon-red transition-colors" title="Edit">
                        <Edit size={12} />
                      </Link>
                      <Link href={`/article/${post.slug}`} target="_blank" className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-neon-green transition-colors" title="View">
                        <ExternalLink size={12} />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-display font-bold text-lg text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/admin/posts/new', label: 'Write Article', icon: Plus, color: '#00d4ff' },
            { href: '/admin/media', label: 'Upload Media', icon: Eye, color: '#a855f7' },
            { href: '/admin/categories', label: 'Categories', icon: FileText, color: '#22c55e' },
            { href: '/admin/settings', label: 'Site Settings', icon: MessageSquare, color: '#f72585' },
          ].map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className="glass-card p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform text-center"
                style={{ borderColor: `${action.color}20` }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${action.color}15` }}>
                  <Icon size={18} style={{ color: action.color }} />
                </div>
                <span className="text-sm font-medium text-gray-300">{action.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

