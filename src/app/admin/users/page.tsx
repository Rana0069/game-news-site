'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
  Users, UserPlus, Shield, Edit2, Trash2, X, Check,
  Eye, EyeOff, Crown, Feather, BookOpen, MessageSquare,
  FileText, Loader, AlertTriangle, Search
} from 'lucide-react'

const ROLES = [
  {
    value: 'admin',
    label: 'Admin',
    desc: 'Full access — manage team, settings, all content',
    icon: Crown,
    color: '#00d4ff',
    badge: 'badge-neon',
  },
  {
    value: 'editor',
    label: 'Editor',
    desc: 'Publish, edit, and delete any post — manage categories',
    icon: Shield,
    color: '#a855f7',
    badge: 'badge-purple',
  },
  {
    value: 'author',
    label: 'Author',
    desc: 'Create and manage their own posts only',
    icon: Feather,
    color: '#22c55e',
    badge: 'badge-green',
  },
  {
    value: 'moderator',
    label: 'Moderator',
    desc: 'Approve, reject, and delete comments',
    icon: MessageSquare,
    color: '#f59e0b',
    badge: 'badge-yellow',
  },
]

function getRoleConfig(role: string) {
  return ROLES.find((r) => r.value === role) ?? ROLES[2]
}

interface User {
  id: string
  name: string | null
  email: string
  role: string
  bio: string | null
  createdAt: string
  isOwner: boolean
  _count: { posts: number }
}

interface InviteForm {
  name: string
  email: string
  password: string
  role: string
  bio: string
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === 'admin'
  const currentUserId = (session?.user as any)?.id

  const [users, setUsers]         = useState<User[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [editingId, setEditingId]  = useState<string | null>(null)
  const [editRole, setEditRole]    = useState('')
  const [saving, setSaving]        = useState(false)
  const [deleteId, setDeleteId]    = useState<string | null>(null)
  const [deleting, setDeleting]    = useState(false)
  const [toast, setToast]          = useState<{ msg: string; ok: boolean } | null>(null)
  const [showPwd, setShowPwd]      = useState(false)

  const [form, setForm] = useState<InviteForm>({
    name: '', email: '', password: '', role: 'author', bio: '',
  })

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (Array.isArray(data)) setUsers(data)
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // --- Invite ---
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Failed to create user', false); return }
      showToast(`${form.name} added as ${form.role}!`)
      setForm({ name: '', email: '', password: '', role: 'author', bio: '' })
      setShowInvite(false)
      load()
    } finally { setSaving(false) }
  }

  // --- Role change ---
  const startEdit = (user: User) => { setEditingId(user.id); setEditRole(user.role) }

  const saveRole = async (userId: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editRole }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Failed', false); return }
      showToast('Role updated!')
      setEditingId(null)
      load()
    } finally { setSaving(false) }
  }

  // --- Delete ---
  const confirmDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/users/${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Failed to delete', false); setDeleteId(null); return }
      showToast('Team member removed')
      setDeleteId(null)
      load()
    } finally { setDeleting(false) }
  }

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  )

  const deleteTarget = users.find((u) => u.id === deleteId)

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all ${
          toast.ok
            ? 'bg-dark-900 border-green-500/30 text-green-400'
            : 'bg-dark-900 border-red-500/30 text-red-400'
        }`}>
          {toast.ok ? <Check size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
            <Users size={24} className="text-neon-red" />
            Team Members
          </h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} member{users.length !== 1 ? 's' : ''} • Manage who can access the CMS</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowInvite(true)}
            className="btn-neon flex items-center gap-2 sm:ml-auto"
          >
            <UserPlus size={16} />
            Add Team Member
          </button>
        )}
      </div>

      {/* Role guide */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ROLES.map((r) => {
          const Icon = r.icon
          return (
            <div key={r.value} className="glass-card p-4" style={{ borderColor: `${r.color}20` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${r.color}18` }}>
                  <Icon size={14} style={{ color: r.color }} />
                </div>
                <span className="font-semibold text-sm text-white">{r.label}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{r.desc}</p>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or role..."
          className="input-dark pl-9 py-2 text-sm w-full sm:w-80"
        />
      </div>

      {/* Users table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size={24} className="text-neon-red animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Users size={36} className="mx-auto mb-3 text-gray-700" />
            <p>{search ? 'No members match your search.' : 'No team members yet.'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-5 py-3">Member</th>
                <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-5 py-3 hidden md:table-cell">Email</th>
                <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-5 py-3">Role</th>
                <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Posts</th>
                <th className="text-left text-xs text-gray-500 font-medium uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Joined</th>
                {isAdmin && <th className="text-right text-xs text-gray-500 font-medium uppercase tracking-wider px-5 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const rc = getRoleConfig(user.role)
                const Icon = rc.icon
                const isMe = user.id === currentUserId
                const isEditing = editingId === user.id

                return (
                  <tr key={user.id} className={`border-b border-white/5 transition-colors hover:bg-white/2 ${isMe ? 'bg-neon-red/3' : ''}`}>
                    {/* Member */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                          style={{ background: `${rc.color}20`, color: rc.color }}
                        >
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-200 flex items-center gap-1.5">
                            {user.name || 'Unnamed'}
                            {isMe && <span className="text-xs text-neon-red">(you)</span>}
                            {user.isOwner && (
                              <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md" style={{ background: '#f59e0b18', color: '#f59e0b', border: '1px solid #f59e0b30' }}>
                                <Crown size={9} />
                                Owner
                              </span>
                            )}
                          </p>
                          {user.bio && <p className="text-xs text-gray-600 line-clamp-1 max-w-[160px]">{user.bio}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 hidden md:table-cell text-sm text-gray-400">{user.email}</td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      {isEditing && isAdmin ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="input-dark text-xs py-1 px-2 w-28"
                            autoFocus
                          >
                            {ROLES.map((r) => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => saveRole(user.id)}
                            disabled={saving}
                            className="w-7 h-7 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 flex items-center justify-center transition-colors"
                          >
                            {saving ? <Loader size={12} className="animate-spin" /> : <Check size={12} />}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="w-7 h-7 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 flex items-center justify-center transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className={`badge text-xs flex items-center gap-1 w-fit ${rc.badge}`}>
                          <Icon size={10} />
                          {rc.label}
                        </span>
                      )}
                    </td>

                    {/* Posts */}
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-400 flex items-center gap-1">
                        <FileText size={12} className="text-gray-600" />
                        {user._count.posts}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 hidden lg:table-cell text-xs text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    {/* Actions */}
                    {isAdmin && (
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          {/* Owner is fully protected — hide all action buttons */}
                          {user.isOwner ? (
                            <span className="text-xs text-gray-700 pr-1" title="Site owner — protected">🔒</span>
                          ) : (
                            <>
                              {!isMe && !isEditing && (
                                <button
                                  onClick={() => startEdit(user)}
                                  title="Change role"
                                  className="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-neon-red/15 hover:text-neon-red flex items-center justify-center transition-colors"
                                >
                                  <Edit2 size={13} />
                                </button>
                              )}
                              {!isMe && (
                                <button
                                  onClick={() => setDeleteId(user.id)}
                                  title="Remove member"
                                  className="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/15 hover:text-red-400 flex items-center justify-center transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                              {isMe && <span className="text-xs text-gray-700 pr-1">—</span>}
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add Team Member Modal ── */}
      {showInvite && (
        <div
          className="fixed inset-0 z-50 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowInvite(false)}
        >
          <div className="w-full max-w-lg glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                <UserPlus size={20} className="text-neon-red" />
                Add Team Member
              </h2>
              <button onClick={() => setShowInvite(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Full Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Alex Chen"
                    className="input-dark w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="alex@example.com"
                    className="input-dark w-full"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs text-gray-500 mb-1">Password *</label>
                <input
                  required
                  minLength={8}
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 8 characters"
                  className="input-dark w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-7 text-gray-500 hover:text-gray-300"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Role picker */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Role *</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => {
                    const Icon = r.icon
                    const selected = form.role === r.value
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setForm({ ...form, role: r.value })}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                          selected
                            ? 'border-current bg-current/10'
                            : 'border-white/8 bg-white/3 hover:border-white/15'
                        }`}
                        style={selected ? { color: r.color, borderColor: `${r.color}50` } : {}}
                      >
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: `${r.color}20` }}
                        >
                          <Icon size={12} style={{ color: r.color }} />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${selected ? '' : 'text-gray-300'}`}>{r.label}</p>
                          <p className="text-xs text-gray-600 leading-tight mt-0.5">{r.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Bio (optional)</label>
                <textarea
                  rows={2}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Short bio shown on their author profile..."
                  className="input-dark w-full resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowInvite(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-gray-400 hover:bg-white/8 text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 btn-neon flex items-center justify-center gap-2 text-sm">
                  {saving ? <Loader size={15} className="animate-spin" /> : <UserPlus size={15} />}
                  {saving ? 'Creating...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setDeleteId(null)}
        >
          <div className="w-full max-w-sm glass-card p-6 rounded-2xl border border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white">Remove Member?</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              <span className="text-white font-medium">{deleteTarget?.name || deleteTarget?.email}</span>
              {' '}will lose access to the CMS. Their posts will remain.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-gray-400 hover:bg-white/8 text-sm font-medium">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 text-sm font-medium flex items-center justify-center gap-2 border border-red-500/20"
              >
                {deleting ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleting ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

