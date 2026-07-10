'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Save, ShieldX, Check, Palette, Sparkles } from 'lucide-react'

// ─── Preset full themes ────────────────────────────────────────────────────
const PRESETS = [
  {
    name: 'Neon Blue',
    emoji: '🔵',
    accentColor: '#00d4ff', accentColor2: '#a855f7', accentColor3: '#22c55e',
    buttonStyle: 'solid', cardStyle: 'glass', borderRadius: 'default', navStyle: 'default',
  },
  {
    name: 'Purple Galaxy',
    emoji: '🟣',
    accentColor: '#a855f7', accentColor2: '#ec4899', accentColor3: '#6366f1',
    buttonStyle: 'solid', cardStyle: 'glass', borderRadius: 'rounded', navStyle: 'blur',
  },
  {
    name: 'Red Rage',
    emoji: '🔴',
    accentColor: '#ef4444', accentColor2: '#f97316', accentColor3: '#eab308',
    buttonStyle: 'gradient', cardStyle: 'solid', borderRadius: 'default', navStyle: 'solid',
  },
  {
    name: 'Green Matrix',
    emoji: '🟢',
    accentColor: '#22c55e', accentColor2: '#16a34a', accentColor3: '#4ade80',
    buttonStyle: 'outline', cardStyle: 'bordered', borderRadius: 'sharp', navStyle: 'default',
  },
  {
    name: 'Cyberpunk',
    emoji: '🟡',
    accentColor: '#eab308', accentColor2: '#f97316', accentColor3: '#ec4899',
    buttonStyle: 'gradient', cardStyle: 'glass', borderRadius: 'sharp', navStyle: 'blur',
  },
  {
    name: 'Midnight',
    emoji: '⚫',
    accentColor: '#6366f1', accentColor2: '#8b5cf6', accentColor3: '#06b6d4',
    buttonStyle: 'dark', cardStyle: 'minimal', borderRadius: 'rounded', navStyle: 'transparent',
  },
  {
    name: 'Hot Pink',
    emoji: '🩷',
    accentColor: '#ec4899', accentColor2: '#f43f5e', accentColor3: '#a855f7',
    buttonStyle: 'solid', cardStyle: 'glass', borderRadius: 'pill', navStyle: 'blur',
  },
  {
    name: 'Ocean',
    emoji: '🌊',
    accentColor: '#06b6d4', accentColor2: '#0ea5e9', accentColor3: '#22c55e',
    buttonStyle: 'outline', cardStyle: 'glass', borderRadius: 'rounded', navStyle: 'default',
  },
]

const COLOR_SWATCHES = [
  '#00d4ff', '#a855f7', '#22c55e', '#ec4899', '#f97316',
  '#06b6d4', '#eab308', '#ef4444', '#6366f1', '#f43f5e',
  '#16a34a', '#8b5cf6', '#0ea5e9', '#d946ef', '#84cc16',
]

type SelectionGrid<T extends string> = {
  value: T
  label: string
  desc: string
  preview: React.ReactNode
}

// OptionGrid MUST be defined outside AdminThemePage.
// Defining components inside components causes React to create a new
// component type on every render — this unmounts/remounts children and
// triggers "Application error" client-side exceptions.
function OptionGrid<T extends string>({
  currentValue, defaultValue = '', options, onChange,
}: {
  currentValue: string | undefined | null
  defaultValue?: string
  options: SelectionGrid<T>[]
  onChange: (v: T) => void
}) {
  const active = currentValue || defaultValue
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {options.map(({ value, label, desc, preview }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
            active === value
              ? 'border-white/40 bg-white/5'
              : 'border-transparent bg-white/[0.03] hover:border-white/15'
          }`}
        >
          <div className="w-full flex items-center justify-center h-10">{preview}</div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
          </div>
          {active === value && (
            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

export default function AdminThemePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  // ALL hooks must be called before any conditional return
  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then(setSettings)
  }, [])

  const role = (session?.user as any)?.role

  const up = (key: string, value: any) => setSettings((s: any) => ({ ...s, [key]: value }))
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setSettings((s: any) => ({ ...s, ...preset }))
    showToast(`Applied "${preset.name}" preset`)
    const root = document.documentElement
    root.style.setProperty('--accent-1', preset.accentColor)
    root.style.setProperty('--accent-2', preset.accentColor2)
    root.style.setProperty('--accent-3', preset.accentColor3)
    preset.buttonStyle === 'solid'   ? root.removeAttribute('data-btn-style')  : root.setAttribute('data-btn-style',  preset.buttonStyle)
    preset.cardStyle   === 'glass'   ? root.removeAttribute('data-card-style') : root.setAttribute('data-card-style', preset.cardStyle)
    preset.navStyle    === 'default' ? root.removeAttribute('data-nav-style')  : root.setAttribute('data-nav-style',  preset.navStyle)
    const radMap: any = { sharp: '4px', default: '12px', rounded: '20px', pill: '9999px' }
    root.style.setProperty('--card-radius', radMap[preset.borderRadius] || '12px')
    preset.borderRadius === 'default' ? root.removeAttribute('data-radius') : root.setAttribute('data-radius', preset.borderRadius)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      showToast('Theme saved!')
    } finally {
      setSaving(false)
    }
  }

  // Guard after hooks — never before
  if (session && role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center">
          <ShieldX size={28} className="text-red-400" />
        </div>
        <h2 className="font-display font-bold text-xl text-white">Access Denied</h2>
        <button onClick={() => router.push('/admin')} className="btn-neon text-sm px-5 py-2">Back</button>
      </div>
    )
  }

  const c1 = settings.accentColor  || '#00d4ff'
  const c2 = settings.accentColor2 || '#a855f7'

  return (
    <div className="max-w-3xl space-y-8">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl bg-dark-900 border border-green-500/30 text-green-400 text-sm font-medium shadow-2xl">
          <Check size={15} /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
            <Palette size={22} className="text-red-400" /> Theme Studio
          </h1>
          <p className="text-gray-400 text-sm mt-1">Customize colors, styles, and layout across your entire site.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-neon flex items-center gap-2 text-sm">
          <Save size={14} /> {saving ? 'Saving...' : 'Save Theme'}
        </button>
      </div>

      {/* ── Presets ─────────────────────────────────────────────────────────── */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-1 text-lg flex items-center gap-2">
          <Sparkles size={16} className="text-yellow-400" /> Quick Presets
        </h2>
        <p className="text-sm text-gray-500 mb-5">One-click full theme — sets all options below automatically.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-white/6 bg-white/3 hover:border-white/20 hover:bg-white/6 transition-all"
            >
              {/* Color swatch row */}
              <div className="flex gap-1.5">
                {[preset.accentColor, preset.accentColor2, preset.accentColor3].map((c, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border border-white/10" style={{ background: c }} />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">{preset.emoji} {preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Accent Colors ────────────────────────────────────────────────────── */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-5 text-lg flex items-center gap-2">
          <Palette size={16} className="text-red-400" /> Accent Colors
        </h2>
        <div className="space-y-6">
          {[
            { label: 'Primary Accent', key: 'accentColor',  desc: 'Nav, buttons, links, glow effects' },
            { label: 'Secondary Accent', key: 'accentColor2', desc: 'Gradients, badges, tags' },
            { label: 'Tertiary Accent', key: 'accentColor3', desc: 'Success states, scores, highlights' },
          ].map(({ label, key, desc }) => (
            <div key={key}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: settings[key] || '#00d4ff' }} />
                <span className="text-sm font-medium text-white">{label}</span>
                <span className="text-xs text-gray-600 font-mono">{settings[key] || '—'}</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">{desc}</p>
              <div className="flex flex-wrap gap-2">
                {COLOR_SWATCHES.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => up(key, color)}
                    title={color}
                    className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${
                      settings[key] === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                    }`}
                    style={{ background: color }}
                  />
                ))}
                {/* Custom color picker */}
                <label className="w-7 h-7 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer relative overflow-hidden hover:border-white/40 transition-all">
                  <span className="text-gray-500 text-xs">+</span>
                  <input
                    type="color"
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    value={settings[key] || '#00d4ff'}
                    onChange={(e) => up(key, e.target.value)}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Button Style ─────────────────────────────────────────────────────── */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-1 text-lg">🖱 Button Style</h2>
        <p className="text-sm text-gray-500 mb-5">How buttons look across the entire site.</p>
        <OptionGrid
          currentValue={settings.buttonStyle}
          defaultValue="solid"
          onChange={(v) => up('buttonStyle', v)}
          options={[
            {
              value: 'solid' as const,
              label: 'Solid', desc: 'Filled accent',
              preview: <span className="px-4 py-1.5 rounded-lg text-xs font-bold" style={{ background: c1, color: '#000' }}>Button</span>,
            },
            {
              value: 'gradient' as const,
              label: 'Gradient', desc: 'Color blend',
              preview: <span className="px-4 py-1.5 rounded-lg text-xs font-bold" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, color: '#000' }}>Button</span>,
            },
            {
              value: 'outline' as const,
              label: 'Outline', desc: 'Border only',
              preview: <span className="px-4 py-1.5 rounded-lg text-xs font-bold border" style={{ color: c1, borderColor: c1 }}>Button</span>,
            },
            {
              value: 'dark' as const,
              label: 'Dark', desc: 'Stealth black',
              preview: <span className="px-4 py-1.5 rounded-lg text-xs font-bold border" style={{ background: '#090e1f', color: c1, borderColor: `${c1}44` }}>Button</span>,
            },
          ]}
        />
      </div>

      {/* ── Card Style ───────────────────────────────────────────────────────── */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-1 text-lg">🃏 Card Style</h2>
        <p className="text-sm text-gray-500 mb-5">How content cards and panels look.</p>
        <OptionGrid
          currentValue={settings.cardStyle}
          defaultValue="glass"
          onChange={(v) => up('cardStyle', v)}
          options={[
            {
              value: 'glass' as const,
              label: 'Glassmorphism', desc: 'Frosted blur bg',
              preview: <div className="w-full h-8 rounded-lg border" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.1)' }} />,
            },
            {
              value: 'solid' as const,
              label: 'Solid Dark', desc: 'Opaque dark bg',
              preview: <div className="w-full h-8 rounded-lg border" style={{ background: '#090e1f', borderColor: 'rgba(255,255,255,0.08)' }} />,
            },
            {
              value: 'bordered' as const,
              label: 'Bordered', desc: 'Transparent + border',
              preview: <div className="w-full h-8 rounded-lg border" style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.2)' }} />,
            },
            {
              value: 'minimal' as const,
              label: 'Minimal', desc: 'No border',
              preview: <div className="w-full h-8 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }} />,
            },
          ]}
        />
      </div>

      {/* ── Border Radius ────────────────────────────────────────────────────── */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-1 text-lg">⬛ Border Radius</h2>
        <p className="text-sm text-gray-500 mb-5">Controls the roundness of cards, buttons, and badges.</p>
        <OptionGrid
          currentValue={settings.borderRadius}
          defaultValue="default"
          onChange={(v) => up('borderRadius', v)}
          options={[
            {
              value: 'sharp' as const,
              label: 'Sharp', desc: 'Straight corners',
              preview: <div className="w-20 h-8 bg-white/10 border border-white/20" style={{ borderRadius: '4px' }} />,
            },
            {
              value: 'default' as const,
              label: 'Default', desc: 'Balanced',
              preview: <div className="w-20 h-8 bg-white/10 border border-white/20" style={{ borderRadius: '8px' }} />,
            },
            {
              value: 'rounded' as const,
              label: 'Rounded', desc: 'Soft edges',
              preview: <div className="w-20 h-8 bg-white/10 border border-white/20" style={{ borderRadius: '20px' }} />,
            },
            {
              value: 'pill' as const,
              label: 'Pill', desc: 'Fully rounded',
              preview: <div className="w-20 h-8 bg-white/10 border border-white/20" style={{ borderRadius: '9999px' }} />,
            },
          ]}
        />
      </div>

      {/* ── Nav Style ────────────────────────────────────────────────────────── */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-1 text-lg">🔝 Navigation Style</h2>
        <p className="text-sm text-gray-500 mb-5">How the top navigation bar appears.</p>
        <OptionGrid
          currentValue={settings.navStyle}
          defaultValue="default"
          onChange={(v) => up('navStyle', v)}
          options={[
            {
              value: 'default' as const,
              label: 'Default', desc: 'Glass with blur',
              preview: <div className="w-full h-8 rounded-lg border border-white/10" style={{ background: 'rgba(6,11,24,0.7)', backdropFilter: 'blur(12px)' }} />,
            },
            {
              value: 'solid' as const,
              label: 'Solid', desc: 'Opaque dark',
              preview: <div className="w-full h-8 rounded-lg border border-white/10" style={{ background: '#060b18' }} />,
            },
            {
              value: 'transparent' as const,
              label: 'Transparent', desc: 'No background',
              preview: <div className="w-full h-8 rounded-lg border border-white/10" style={{ background: 'transparent' }} />,
            },
            {
              value: 'blur' as const,
              label: 'Heavy Blur', desc: 'Frosted glass',
              preview: <div className="w-full h-8 rounded-lg border border-white/10" style={{ background: 'rgba(6,11,24,0.4)', backdropFilter: 'blur(28px)' }} />,
            },
          ]}
        />
      </div>

      {/* Save bottom */}
      <div className="flex justify-end pb-8">
        <button onClick={handleSave} disabled={saving} className="btn-neon flex items-center gap-2">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Theme'}
        </button>
      </div>
    </div>
  )
}

