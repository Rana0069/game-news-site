'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Save, Eye, Send, X, Plus, ImageIcon, Youtube, Clock, Search } from 'lucide-react'
import TiptapEditor from '@/components/admin/TiptapEditor'
import { generateSlug, extractYouTubeId } from '@/lib/utils'

interface Category {
  id: string
  name: string
  color?: string | null
}

interface Tag {
  id: string
  name: string
}

interface PostEditorProps {
  postId?: string
  initialData?: any
}

export default function PostEditor({ postId, initialData }: PostEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [tagSearch, setTagSearch] = useState('')

  const [form, setForm] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    featuredImage: initialData?.featuredImage || '',
    status: initialData?.status || 'draft',
    categoryId: initialData?.categoryId || '',
    featured: initialData?.featured || false,
    trending: initialData?.trending || false,
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    metaKeywords: initialData?.metaKeywords || '',
    publishAt: initialData?.publishAt ? new Date(initialData.publishAt).toISOString().slice(0, 16) : '',
    youtubeUrls: (initialData?.youtubeUrls ? JSON.parse(initialData.youtubeUrls) : []) as string[],
    selectedTags: (initialData?.tags?.map((t: any) => t.tagId) || []) as string[],
  })

  const updateForm = (key: string, value: any) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  // Auto-generate slug from title
  useEffect(() => {
    if (!postId && form.title) {
      updateForm('slug', generateSlug(form.title))
    }
  }, [form.title, postId])

  // Load categories and tags
  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories)
    fetch('/api/tags').then((r) => r.json()).then(setAllTags)
  }, [])

  // Auto-save drafts every 30 seconds
  useEffect(() => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer)
    const timer = setTimeout(() => {
      if (form.title && form.content && form.status === 'draft') {
        handleSave('draft', true)
      }
    }, 30000)
    setAutoSaveTimer(timer)
    return () => clearTimeout(timer)
  }, [form.title, form.content])

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'featured')
    const res = await fetch('/api/media', { method: 'POST', body: formData })
    const data = await res.json()
    return data.url || ''
  }

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await handleImageUpload(file)
    if (url) updateForm('featuredImage', url)
  }

  const handleSave = useCallback(async (status?: string, silent?: boolean) => {
    if (!form.title) {
      if (!silent) alert('Title is required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        status: status || form.status,
        tags: form.selectedTags,
        youtubeUrls: form.youtubeUrls.filter(Boolean),
        publishAt: form.publishAt || null,
      }

      const url = postId ? `/api/posts/${postId}` : '/api/posts'
      const method = postId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Server error ${res.status}`)
      }

      const data = await res.json()
      setLastSaved(new Date())

      if (!silent) {
        if (!postId) {
          router.push(`/admin/posts/${data.id}/edit`)
        }
      }
    } catch (err: any) {
      if (!silent) alert(`Failed to save post: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }, [form, postId, router])


  const addYoutubeUrl = () => {
    const url = prompt('Enter YouTube URL:')
    if (url) updateForm('youtubeUrls', [...form.youtubeUrls, url])
  }

  const filteredTags = allTags.filter((t) =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  )

  const toggleTag = (tagId: string) => {
    const selected = form.selectedTags.includes(tagId)
      ? form.selectedTags.filter((id) => id !== tagId)
      : [...form.selectedTags, tagId]
    updateForm('selectedTags', selected)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-black text-2xl text-white">
            {postId ? 'Edit Post' : 'New Post'}
          </h1>
          {lastSaved && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Clock size={10} />
              Auto-saved {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <a href={form.slug ? `/article/${form.slug}` : '#'} target="_blank" className="btn-ghost flex items-center gap-2 text-sm">
            <Eye size={14} />
            Preview
          </a>
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <Save size={14} />
            Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="btn-neon flex items-center gap-2 text-sm relative z-10"
          >
            <Send size={14} />
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Main content */}
        <div className="space-y-6">
          {/* Title */}
          <div className="glass-card p-6">
            <input
              type="text"
              placeholder="Post title..."
              value={form.title}
              onChange={(e) => updateForm('title', e.target.value)}
              className="w-full bg-transparent text-3xl font-display font-black text-white placeholder-gray-600 outline-none border-b border-white/5 pb-3 mb-3"
            />
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Slug:</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateForm('slug', e.target.value)}
                className="flex-1 bg-transparent text-gray-400 outline-none border-b border-white/5 pb-1"
              />
            </div>
          </div>

          {/* Rich text editor */}
          <div className="glass-card overflow-hidden p-0">
            <TiptapEditor
              content={form.content}
              onChange={(html) => updateForm('content', html)}
              onImageUpload={(url) => {}}
            />
          </div>

          {/* Excerpt */}
          <div className="glass-card p-5">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Excerpt (Short Description)</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => updateForm('excerpt', e.target.value)}
              placeholder="Brief summary of this article..."
              rows={3}
              className="input-dark resize-none"
            />
          </div>

          {/* YouTube URLs */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Youtube size={16} className="text-red-500" />
                YouTube Videos
              </label>
              <button
                type="button"
                onClick={addYoutubeUrl}
                className="flex items-center gap-1 text-xs text-neon-blue hover:underline"
              >
                <Plus size={12} />
                Add Video
              </button>
            </div>
            {form.youtubeUrls.map((url, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2 flex-1 bg-dark-700 border border-white/10 rounded-lg px-3 py-2">
                  <Youtube size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-sm text-gray-400 truncate">{url}</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateForm('youtubeUrls', form.youtubeUrls.filter((_, j) => j !== i))}
                  className="text-gray-500 hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* SEO */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              🔍 SEO Settings
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Meta title (leave empty to use post title)"
                value={form.metaTitle}
                onChange={(e) => updateForm('metaTitle', e.target.value)}
                className="input-dark"
              />
              <textarea
                placeholder="Meta description..."
                value={form.metaDescription}
                onChange={(e) => updateForm('metaDescription', e.target.value)}
                rows={2}
                className="input-dark resize-none"
              />
              <input
                type="text"
                placeholder="Keywords (comma separated)"
                value={form.metaKeywords}
                onChange={(e) => updateForm('metaKeywords', e.target.value)}
                className="input-dark"
              />
            </div>
            {/* SEO score indicator */}
            <div className="mt-4 flex items-center gap-3">
              <div className="text-xs text-gray-500">SEO Score:</div>
              <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (
                      (form.metaTitle ? 25 : 0) +
                      (form.metaDescription ? 25 : 0) +
                      (form.metaKeywords ? 20 : 0) +
                      (form.featuredImage ? 15 : 0) +
                      (form.excerpt ? 15 : 0)
                    ))}%`,
                    background: 'linear-gradient(90deg, #22c55e, #00d4ff)',
                  }}
                />
              </div>
              <div className="text-xs text-gray-500">
                {Math.min(100, (form.metaTitle ? 25 : 0) + (form.metaDescription ? 25 : 0) + (form.metaKeywords ? 20 : 0) + (form.featuredImage ? 15 : 0) + (form.excerpt ? 15 : 0))}%
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar panel */}
        <div className="space-y-5">
          {/* Publish settings */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4">Publish Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => updateForm('status', e.target.value)}
                  className="input-dark"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              {form.status === 'scheduled' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Schedule Date</label>
                  <input
                    type="datetime-local"
                    value={form.publishAt}
                    onChange={(e) => updateForm('publishAt', e.target.value)}
                    className="input-dark"
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Featured</label>
                <button
                  type="button"
                  onClick={() => updateForm('featured', !form.featured)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${form.featured ? 'bg-neon-blue' : 'bg-dark-600'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Trending</label>
                <button
                  type="button"
                  onClick={() => updateForm('trending', !form.trending)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${form.trending ? 'bg-neon-purple' : 'bg-dark-600'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.trending ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Featured image */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <ImageIcon size={16} className="text-neon-blue" />
              Featured Image
            </h3>
            {form.featuredImage ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.featuredImage} alt="Featured" className="w-full rounded-xl object-cover max-h-48" />
                <button
                  type="button"
                  onClick={() => updateForm('featuredImage', '')}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-neon-blue/30 hover:bg-neon-blue/5 transition-all">
                <ImageIcon size={24} className="text-gray-600 mb-2" />
                <span className="text-sm text-gray-500">Upload image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFeaturedImageUpload} />
              </label>
            )}
            {/* URL paste option */}
            <div className="mt-3 flex gap-2">
              <input
                type="url"
                placeholder="Or paste image URL..."
                className="input-dark text-xs flex-1"
                onBlur={(e) => { if (e.target.value) { updateForm('featuredImage', e.target.value); e.target.value = '' } }}
                onKeyDown={(e) => { if (e.key === 'Enter') { const v = (e.target as HTMLInputElement).value; if (v) { updateForm('featuredImage', v);(e.target as HTMLInputElement).value = '' } } }}
              />
            </div>
          </div>

          {/* Category */}
          <div className="glass-card p-5">
            <label className="block text-sm font-semibold text-gray-300 mb-3">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => updateForm('categoryId', e.target.value)}
              className="input-dark"
            >
              <option value="">Select category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="glass-card p-5">
            <label className="block text-sm font-semibold text-gray-300 mb-3">Tags</label>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search tags..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="input-dark pl-8 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {filteredTags.map((tag) => {
                const selected = form.selectedTags.includes(tag.id)
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                      selected
                        ? 'bg-neon-blue/20 border-neon-blue/40 text-neon-blue'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-neon-blue/20'
                    }`}
                  >
                    #{tag.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
