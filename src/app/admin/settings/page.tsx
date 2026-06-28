'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Save, ImageIcon, Palette, X } from 'lucide-react'

const ACCENT_PRESETS = [
  { name: 'Neon Blue', value: '#00d4ff' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Pink', value: '#f72585' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Gold', value: '#eab308' },
  { name: 'Red', value: '#ef4444' },
]

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then(setSettings)
  }, [])

  const update = (key: string, value: string) => setSettings((s: any) => ({ ...s, [key]: value }))

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'branding')
    const res = await fetch('/api/media', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) update(field, data.url)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl text-white">Site Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Customize your website's name, branding, and colors.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-neon flex items-center gap-2 text-sm relative z-10"
        >
          <Save size={14} />
          {saved ? '✅ Saved!' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Branding */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-5 text-lg">🎮 Branding</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Site Name</label>
            <input
              type="text"
              value={settings.siteName || ''}
              onChange={(e) => update('siteName', e.target.value)}
              className="input-dark max-w-sm"
              placeholder="GamePulse"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Site Tagline</label>
            <input
              type="text"
              value={settings.siteTagline || ''}
              onChange={(e) => update('siteTagline', e.target.value)}
              className="input-dark max-w-md"
              placeholder="Your Ultimate Gaming Destination"
            />
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Logo</label>
            <div className="flex items-center gap-4">
              {settings.logo ? (
                <div className="relative">
                  <Image src={settings.logo} alt="Logo" width={60} height={60} className="rounded-xl" />
                  <button onClick={() => update('logo', '')} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white">
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-dark-700 border border-white/10 flex items-center justify-center">
                  <ImageIcon size={20} className="text-gray-600" />
                </div>
              )}
              <label className="btn-ghost text-sm cursor-pointer">
                Upload Logo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'logo')} />
              </label>
            </div>
          </div>

          {/* Favicon */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Favicon</label>
            <div className="flex items-center gap-4">
              {settings.favicon ? (
                <div className="relative">
                  <Image src={settings.favicon} alt="Favicon" width={32} height={32} className="rounded" />
                  <button onClick={() => update('favicon', '')} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white">
                    <X size={8} />
                  </button>
                </div>
              ) : (
                <div className="w-8 h-8 rounded bg-dark-700 border border-white/10 flex items-center justify-center">
                  <ImageIcon size={12} className="text-gray-600" />
                </div>
              )}
              <label className="btn-ghost text-sm cursor-pointer">
                Upload Favicon
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'favicon')} />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Accent Colors */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-5 text-lg flex items-center gap-2">
          <Palette size={18} className="text-neon-purple" />
          Accent Colors
        </h2>

        {/* Primary accent */}
        <div className="space-y-4">
          {[
            { label: 'Primary Accent', key: 'accentColor', desc: 'Main neon accent (nav, buttons, links)' },
            { label: 'Secondary Accent', key: 'accentColor2', desc: 'Secondary accent (tags, gradients)' },
            { label: 'Tertiary Accent', key: 'accentColor3', desc: 'Third accent (success, scores)' },
          ].map(({ label, key, desc }) => (
            <div key={key}>
              <label className="block text-sm text-gray-400 mb-2">{label}</label>
              <p className="text-xs text-gray-600 mb-2">{desc}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {ACCENT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => update(key, preset.value)}
                    title={preset.name}
                    className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${settings[key] === preset.value ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ background: preset.value }}
                  />
                ))}
                <label className="w-8 h-8 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer overflow-hidden relative">
                  <Palette size={12} className="text-gray-500" />
                  <input
                    type="color"
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    value={settings[key] || '#00d4ff'}
                    onChange={(e) => update(key, e.target.value)}
                  />
                </label>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg" style={{ background: settings[key] }} />
                <span className="text-sm font-mono text-gray-400">{settings[key]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-5 text-lg">🔗 Social Links</h2>
        <div className="space-y-3">
          {[
            { label: 'Twitter / X', key: 'twitterUrl', placeholder: 'https://twitter.com/yourhandle' },
            { label: 'YouTube', key: 'youtubeUrl', placeholder: 'https://youtube.com/yourchannel' },
            { label: 'Instagram', key: 'instagramUrl', placeholder: 'https://instagram.com/yourhandle' },
            { label: 'Facebook', key: 'facebookUrl', placeholder: 'https://facebook.com/yourpage' },
            { label: 'Discord', key: 'discordUrl', placeholder: 'https://discord.gg/yourinvite' },
            { label: 'Twitch', key: 'twitchUrl', placeholder: 'https://twitch.tv/yourchannel' },
            { label: 'Contact Email', key: 'contactEmail', placeholder: 'hello@yoursite.com' },
          ].map(({ label, key, placeholder }) => (
            <div key={key} className="flex items-center gap-4">
              <label className="text-sm text-gray-400 w-32 flex-shrink-0">{label}</label>
              <input
                type="text"
                value={settings[key] || ''}
                onChange={(e) => update(key, e.target.value)}
                placeholder={placeholder}
                className="input-dark flex-1"
              />
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white mb-5 text-lg">📝 About & Footer</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">About Text</label>
            <textarea
              value={settings.aboutText || ''}
              onChange={(e) => update('aboutText', e.target.value)}
              rows={4}
              className="input-dark resize-none"
              placeholder="Tell visitors about your site..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Footer Text</label>
            <input
              type="text"
              value={settings.footerText || ''}
              onChange={(e) => update('footerText', e.target.value)}
              className="input-dark"
              placeholder="© 2025 GamePulse. All rights reserved."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
