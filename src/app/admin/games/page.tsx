'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Gamepad2, Calendar } from 'lucide-react'
import Image from 'next/image'
import { safeJsonParse } from '@/lib/utils'

export default function AdminGamesPage() {
  const [games, setGames] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '', description: '', coverImage: '', releaseDate: '',
    developer: '', publisher: '', platforms: '', genres: '',
    rating: '', reviewScore: '', featured: false, upcoming: false, trailerUrl: '',
  })

  const fetch_ = async () => {
    const res = await fetch('/api/games')
    const data = await res.json()
    setGames(data.games || [])
  }

  useEffect(() => { fetch_() }, [])

  const handleSave = async () => {
    const payload = {
      ...form,
      platforms: form.platforms ? form.platforms.split(',').map((s: string) => s.trim()) : [],
      genres: form.genres ? form.genres.split(',').map((s: string) => s.trim()) : [],
      reviewScore: form.reviewScore ? parseFloat(form.reviewScore) : null,
      releaseDate: form.releaseDate || null,
    }
    const method = editId ? 'PUT' : 'POST'
    const url = editId ? `/api/games/${editId}` : '/api/games'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setShowForm(false)
    setEditId(null)
    setForm({ title: '', description: '', coverImage: '', releaseDate: '', developer: '', publisher: '', platforms: '', genres: '', rating: '', reviewScore: '', featured: false, upcoming: false, trailerUrl: '' })
    fetch_()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-black text-2xl text-white">Game Database</h1>
        <button onClick={() => setShowForm(true)} className="btn-neon flex items-center gap-2 text-sm relative z-10">
          <Plus size={16} /> Add Game
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4">{editId ? 'Edit Game' : 'Add New Game'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Game title *" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} className="input-dark" />
            <input type="text" placeholder="Cover image URL" value={form.coverImage} onChange={(e) => setForm(f => ({ ...f, coverImage: e.target.value }))} className="input-dark" />
            <input type="date" placeholder="Release date" value={form.releaseDate} onChange={(e) => setForm(f => ({ ...f, releaseDate: e.target.value }))} className="input-dark" />
            <input type="text" placeholder="Developer" value={form.developer} onChange={(e) => setForm(f => ({ ...f, developer: e.target.value }))} className="input-dark" />
            <input type="text" placeholder="Publisher" value={form.publisher} onChange={(e) => setForm(f => ({ ...f, publisher: e.target.value }))} className="input-dark" />
            <input type="text" placeholder="Platforms (comma separated: PS5, Xbox, PC)" value={form.platforms} onChange={(e) => setForm(f => ({ ...f, platforms: e.target.value }))} className="input-dark" />
            <input type="text" placeholder="Genres (comma separated: RPG, Action)" value={form.genres} onChange={(e) => setForm(f => ({ ...f, genres: e.target.value }))} className="input-dark" />
            <input type="text" placeholder="Rating (M, T, E)" value={form.rating} onChange={(e) => setForm(f => ({ ...f, rating: e.target.value }))} className="input-dark" />
            <input type="number" step="0.1" min="0" max="10" placeholder="Review score (0-10)" value={form.reviewScore} onChange={(e) => setForm(f => ({ ...f, reviewScore: e.target.value }))} className="input-dark" />
            <input type="text" placeholder="Trailer YouTube URL" value={form.trailerUrl} onChange={(e) => setForm(f => ({ ...f, trailerUrl: e.target.value }))} className="input-dark" />
            <div className="flex items-center gap-6 sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm(f => ({ ...f, featured: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-400">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.upcoming} onChange={(e) => setForm(f => ({ ...f, upcoming: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-400">Upcoming</span>
              </label>
            </div>
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input-dark resize-none sm:col-span-2" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="btn-neon flex items-center gap-2 text-sm relative z-10"><Save size={14} />Save Game</button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-sm"><X size={14} />Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {games.map((game) => {
          const platforms = safeJsonParse<string[]>(game.platforms, [])
          return (
            <div key={game.id} className="group glass-card overflow-hidden relative">
              <div className="relative aspect-[3/4] bg-dark-800">
                {game.coverImage ? (
                  <Image src={game.coverImage} alt={game.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 flex items-center justify-center">
                    <Gamepad2 size={24} className="text-neon-blue/30" />
                  </div>
                )}
                {game.reviewScore && (
                  <div className={`absolute top-1 right-1 text-xs px-1.5 py-0.5 rounded-md font-bold ${game.reviewScore >= 8 ? 'score-high' : game.reviewScore >= 6 ? 'score-mid' : 'score-low'}`}>
                    {game.reviewScore.toFixed(1)}
                  </div>
                )}
                {/* Hover actions */}
                <div className="absolute inset-0 bg-dark-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      const plats = safeJsonParse<string[]>(game.platforms, [])
                      const gens = safeJsonParse<string[]>(game.genres, [])
                      setForm({ title: game.title, description: game.description || '', coverImage: game.coverImage || '', releaseDate: game.releaseDate ? game.releaseDate.slice(0, 10) : '', developer: game.developer || '', publisher: game.publisher || '', platforms: plats.join(', '), genres: gens.join(', '), rating: game.rating || '', reviewScore: game.reviewScore?.toString() || '', featured: game.featured, upcoming: game.upcoming, trailerUrl: game.trailerUrl || '' })
                      setEditId(game.id)
                      setShowForm(true)
                    }}
                    className="w-8 h-8 rounded-lg bg-neon-blue/20 flex items-center justify-center text-neon-blue"
                  >
                    <Edit size={12} />
                  </button>
                  <button onClick={async () => { if (confirm('Delete?')) { await fetch(`/api/games/${game.id}`, { method: 'DELETE' }); fetch_() } }} className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <h3 className="text-xs font-semibold text-gray-200 line-clamp-1">{game.title}</h3>
                <div className="flex flex-wrap gap-0.5 mt-1">
                  {platforms.slice(0, 2).map((p: string) => (
                    <span key={p} className="text-xs text-gray-600 bg-white/5 px-1 rounded">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
