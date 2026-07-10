'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Upload, Trash2, Search, Copy, X, Folder } from 'lucide-react'

export default function AdminMediaPage() {
  const [media, setMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const fetchMedia = async () => {
    setLoading(true)
    const res = await fetch('/api/media')
    const data = await res.json()
    setMedia(data)
    setLoading(false)
  }

  useEffect(() => { fetchMedia() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      await fetch('/api/media', { method: 'POST', body: formData })
    }
    await fetchMedia()
    setUploading(false)
  }

  const handleDelete = async (id: string) => {
    await fetch('/api/media', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchMedia()
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    alert('URL copied!')
  }

  const filtered = media.filter((m) => m.filename.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-black text-2xl text-white">Media Library</h1>
        <label className="btn-neon flex items-center gap-2 text-sm cursor-pointer relative z-10">
          {uploading ? <><Upload size={16} className="animate-bounce" /> Uploading...</> : <><Upload size={16} /> Upload Images</>}
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search media..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-dark pl-8"
        />
      </div>

      {/* Upload drop zone */}
      <label
        className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-neon-red/30 hover:bg-neon-red/5 transition-all"
        onDrop={(e) => {
          e.preventDefault()
          const files = e.dataTransfer.files
          if (files.length) {
            const fakeEvent = { target: { files } } as any
            handleUpload(fakeEvent)
          }
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <Upload size={28} className="text-gray-600 mb-2" />
        <span className="text-sm text-gray-500">Drag & drop images here, or click to upload</span>
        <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
      </label>

      {/* Media grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => <div key={i} className="aspect-square skeleton rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((item) => (
            <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-dark-800 border border-white/5">
              <Image src={item.url} alt={item.filename} fill className="object-cover" />
              <div className="absolute inset-0 bg-dark-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => copyUrl(item.url)} className="w-8 h-8 rounded-lg bg-neon-red/20 border border-neon-red/30 flex items-center justify-center text-neon-red hover:bg-neon-red/30 transition-all">
                  <Copy size={12} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-dark-950">
                <p className="text-xs text-gray-400 truncate">{item.filename}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Folder size={48} className="mx-auto mb-4 text-gray-700" />
          <p>No media found. Upload some images to get started.</p>
        </div>
      )}
    </div>
  )
}

