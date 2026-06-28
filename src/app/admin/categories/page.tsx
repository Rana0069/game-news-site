'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  color?: string | null
  icon?: string | null
  description?: string | null
  _count?: { posts: number }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', color: '#00d4ff', icon: '', description: '' })
  const [showForm, setShowForm] = useState(false)

  const fetch_ = async () => {
    const res = await fetch('/api/categories')
    setCategories(await res.json())
  }

  useEffect(() => { fetch_() }, [])

  const handleSubmit = async () => {
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `/api/categories/${editing}` : '/api/categories'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowForm(false)
    setEditing(null)
    setForm({ name: '', color: '#00d4ff', icon: '', description: '' })
    fetch_()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    fetch_()
  }

  const startEdit = (cat: Category) => {
    setEditing(cat.id)
    setForm({ name: cat.name, color: cat.color || '#00d4ff', icon: cat.icon || '', description: cat.description || '' })
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-black text-2xl text-white">Categories</h1>
        <button onClick={() => { setShowForm(true); setEditing(null) }} className="btn-neon flex items-center gap-2 text-sm relative z-10">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4">{editing ? 'Edit Category' : 'New Category'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Category name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="input-dark" />
            <input type="text" placeholder="Icon emoji (e.g. 🎮)" value={form.icon} onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))} className="input-dark" />
            <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="input-dark" />
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-400">Color:</label>
              <input type="color" value={form.color} onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer" />
              <span className="text-sm font-mono text-gray-400">{form.color}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSubmit} className="btn-neon flex items-center gap-2 text-sm relative z-10"><Save size={14} />Save</button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white text-sm"><X size={14} />Cancel</button>
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-5 py-3">Category</th>
              <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Posts</th>
              <th className="text-right text-xs text-gray-500 font-medium uppercase tracking-wider px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: `${cat.color}15` }}>
                      {cat.icon || '📁'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-200 text-sm">{cat.name}</div>
                      <div className="text-xs text-gray-600">/category/{cat.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 hidden sm:table-cell">
                  <span className="text-sm text-gray-400">{cat._count?.posts || 0} posts</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => startEdit(cat)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-neon-blue">
                      <Edit size={12} />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-400">
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
  )
}
