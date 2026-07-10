'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Trash2, AlertOctagon, MessageSquare } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  const fetch_ = async () => {
    setLoading(true)
    const res = await fetch(`/api/comments?status=${filter}`)
    setComments(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetch_() }, [filter])

  const handleAction = async (id: string, status: string) => {
    await fetch('/api/comments', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    fetch_()
  }

  const handleDelete = async (id: string) => {
    await fetch('/api/comments', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetch_()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-black text-2xl text-white">Comments</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['pending', 'approved', 'spam'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === s ? 'bg-neon-red/20 text-neon-red border border-neon-red/30' : 'bg-white/5 text-gray-400'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)
        ) : comments.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-700" />
            <p>No {filter} comments.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="glass-card p-4 flex gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium text-sm text-white">
                    {comment.author?.name || comment.guestName || 'Anonymous'}
                  </span>
                  {comment.guestEmail && <span className="text-xs text-gray-500">{comment.guestEmail}</span>}
                  <span className="text-xs text-gray-600">{formatRelativeTime(new Date(comment.createdAt))}</span>
                </div>
                <p className="text-sm text-gray-400">{comment.content}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {filter !== 'approved' && (
                  <button onClick={() => handleAction(comment.id, 'approved')} className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 hover:bg-green-500/20">
                    <CheckCircle size={14} />
                  </button>
                )}
                {filter !== 'spam' && (
                  <button onClick={() => handleAction(comment.id, 'spam')} className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 hover:bg-yellow-500/20">
                    <AlertOctagon size={14} />
                  </button>
                )}
                <button onClick={() => handleDelete(comment.id)} className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

