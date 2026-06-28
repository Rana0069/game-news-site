'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, ExternalLink, Eye, Search, Filter } from 'lucide-react'
import { formatRelativeTime, formatViewCount } from '@/lib/utils'

interface Post {
  id: string
  title: string
  slug: string
  status: string
  views: number
  publishedAt?: string | null
  category?: { name: string; color?: string | null } | null
  author?: { name?: string | null }
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<string[]>([])

  const fetchPosts = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    params.set('limit', '50')
    const res = await fetch(`/api/posts?${params}`)
    const data = await res.json()
    setPosts(data.posts || [])
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [statusFilter])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    fetchPosts()
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} posts?`)) return
    await Promise.all(selected.map((id) => fetch(`/api/posts/${id}`, { method: 'DELETE' })))
    setSelected([])
    fetchPosts()
  }

  const handleBulkPublish = async () => {
    await Promise.all(
      selected.map((id) =>
        fetch(`/api/posts/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'published' }),
        })
      )
    )
    setSelected([])
    fetchPosts()
  }

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSelect = (id: string) => {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display font-black text-2xl text-white">Posts</h1>
        <Link href="/admin/posts/new" className="btn-neon flex items-center gap-2 text-sm relative z-10">
          <Plus size={16} />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark pl-8"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-dark w-auto"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
        </select>

        {selected.length > 0 && (
          <div className="flex gap-2">
            <button onClick={handleBulkPublish} className="px-3 py-1.5 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-bold">
              Publish {selected.length}
            </button>
            <button onClick={handleBulkDelete} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
              Delete {selected.length}
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    onChange={(e) => setSelected(e.target.checked ? filtered.map((p) => p.id) : [])}
                    checked={selected.length === filtered.length && filtered.length > 0}
                    className="rounded"
                  />
                </th>
                <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-4 py-3">Title</th>
                <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Category</th>
                <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-4 py-3 hidden md:table-cell">Status</th>
                <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Views</th>
                <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Date</th>
                <th className="text-right text-xs text-gray-500 font-medium uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-6 skeleton rounded" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">No posts found</td>
                </tr>
              ) : (
                filtered.map((post) => (
                  <tr key={post.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(post.id)}
                        onChange={() => toggleSelect(post.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-200 line-clamp-1">{post.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{post.author?.name}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {post.category && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${post.category.color || '#00d4ff'}22`, color: post.category.color || '#00d4ff' }}>
                          {post.category.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`badge text-xs ${post.status === 'published' ? 'badge-green' : post.status === 'draft' ? 'badge-neon' : 'badge-purple'}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-400">
                      <span className="flex items-center gap-1"><Eye size={12} />{formatViewCount(post.views)}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">
                      {post.publishedAt ? formatRelativeTime(new Date(post.publishedAt)) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Link href={`/admin/posts/${post.id}/edit`} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-neon-blue transition-colors">
                          <Edit size={12} />
                        </Link>
                        <Link href={`/article/${post.slug}`} target="_blank" className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-neon-green transition-colors">
                          <ExternalLink size={12} />
                        </Link>
                        <button onClick={() => handleDelete(post.id)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
