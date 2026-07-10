'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Youtube from '@tiptap/extension-youtube'
import { useCallback, useRef, useState } from 'react'
import {
  Bold, Italic, UnderlineIcon, Strikethrough, Code, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, Minus, Link as LinkIcon, Image as ImageIcon,
  Heading1, Heading2, Heading3, Table as TableIcon, Youtube as YoutubeIcon,
  Undo, Redo, Highlighter, Palette, Upload, Globe, X as XIcon
} from 'lucide-react'

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
  onImageUpload?: (url: string) => void
}

const ToolbarButton = ({
  onClick, active, title, children
}: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm ${
      active
        ? 'bg-neon-red/20 text-neon-red border border-neon-red/30'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {children}
  </button>
)

const ToolbarDivider = () => <div className="w-px h-6 bg-white/10 mx-1 self-center" />

export default function TiptapEditor({ content, onChange, onImageUpload }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showImagePanel, setShowImagePanel] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: { HTMLAttributes: { class: 'hljs' } } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-neon-red' } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-xl max-w-full' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder: 'Start writing your article...' }),
      CharacterCount,
      Youtube.configure({ controls: true }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'tiptap-editor min-h-[400px] focus:outline-none',
      },
    },
  })

  const addLink = useCallback(() => {
    const url = prompt('Enter URL:')
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }, [editor])

  const addYoutube = useCallback(() => {
    const url = prompt('Enter YouTube URL:')
    if (url && editor) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run()
    }
  }, [editor])

  const handleImageUpload = useCallback(async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'posts')
    setUploading(true)
    try {
      const res = await fetch('/api/media', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url && editor) {
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run()
        onImageUpload?.(data.url)
        setShowImagePanel(false)
      }
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }, [editor, onImageUpload])

  const insertImageByUrl = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl, alt: 'Inline image' }).run()
      setImageUrl('')
      setShowImagePanel(false)
      onImageUpload?.(imageUrl)
    }
  }, [editor, imageUrl, onImageUpload])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageUpload(file)
    e.target.value = ''
  }

  if (!editor) return <div className="h-96 skeleton rounded-xl" />

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-dark-800">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-white/5 bg-dark-900">
        {/* History */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo size={14} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={14} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Formatting */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <UnderlineIcon size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code">
          <Code size={14} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Color */}
        <div className="relative">
          <input
            type="color"
            className="absolute inset-0 opacity-0 w-8 h-8 cursor-pointer"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            title="Text color"
          />
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5">
            <Palette size={14} />
          </button>
        </div>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive('highlight')}
          title="Highlight"
        >
          <Highlighter size={14} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <AlignLeft size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <AlignCenter size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <AlignRight size={14} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
          <ListOrdered size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
          <Quote size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
          <Code size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <Minus size={14} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Media & Links */}
        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Add Link">
          <LinkIcon size={14} />
        </ToolbarButton>

        {/* Image button — opens inline panel */}
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowImagePanel(!showImagePanel)}
            active={showImagePanel}
            title="Insert Image into post"
          >
            <ImageIcon size={14} />
          </ToolbarButton>

          {/* Image insert panel */}
          {showImagePanel && (
            <div className="absolute top-10 left-0 z-50 w-72 bg-dark-900 border border-white/10 rounded-xl shadow-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">Insert Image</span>
                <button onClick={() => setShowImagePanel(false)} className="text-gray-500 hover:text-white">
                  <XIcon size={14} />
                </button>
              </div>

              {/* Upload from device */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-neon-red/10 border border-white/8 hover:border-neon-red/30 transition-all text-left mb-3"
              >
                <div className="w-8 h-8 rounded-lg bg-neon-red/15 flex items-center justify-center flex-shrink-0">
                  <Upload size={14} className="text-neon-red" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{uploading ? 'Uploading...' : 'Upload from device'}</p>
                  <p className="text-xs text-gray-500">JPG, PNG, GIF, WebP</p>
                </div>
              </button>

              {/* Paste URL */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Globe size={11} />
                  Or paste an image URL
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && insertImageByUrl()}
                    placeholder="https://example.com/image.jpg"
                    className="input-dark text-xs flex-1"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={insertImageByUrl}
                    disabled={!imageUrl}
                    className="px-3 py-1.5 rounded-lg bg-neon-red/15 text-neon-red text-xs font-medium hover:bg-neon-red/25 disabled:opacity-40 transition-colors"
                  >
                    Insert
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-3 text-center">💡 You can also drag &amp; drop images anywhere</p>
            </div>
          )}
        </div>

        <ToolbarButton onClick={addYoutube} title="Embed YouTube video">
          <YoutubeIcon size={14} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Table */}
        <ToolbarButton
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="Insert Table"
        >
          <TableIcon size={14} />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div
        className="relative"
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files?.[0]
          if (file?.type.startsWith('image/')) handleImageUpload(file)
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <EditorContent editor={editor} className="prose-gaming" />
      </div>

      {/* Footer: character/word count */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-dark-900">
        <span className="text-xs text-gray-600">
          📷 Click the image icon in toolbar to insert images &nbsp;·&nbsp; Drag &amp; drop also works
        </span>
        <span className="text-xs text-gray-600">
          {editor.storage.characterCount.words()} words · {editor.storage.characterCount.characters()} chars
        </span>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  )
}

