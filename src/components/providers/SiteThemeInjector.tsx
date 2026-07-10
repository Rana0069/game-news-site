'use client'

/**
 * SiteThemeInjector — runs client-side to apply all dynamic theme settings:
 * 1. Accent colors  → CSS custom properties (--accent-1/2/3)
 * 2. Button style   → data-btn-style attribute on <html>
 * 3. Card style     → data-card-style attribute on <html>
 * 4. Border radius  → data-radius attribute on <html>
 * 5. Nav style      → data-nav-style attribute on <html>
 * 6. Favicon        → dynamic <link rel="icon"> in <head>
 */
import { useEffect } from 'react'

export interface ThemeSettings {
  // Colors
  accentColor?:  string | null
  accentColor2?: string | null
  accentColor3?: string | null
  // Styles
  buttonStyle?:  string | null  // solid | gradient | outline | dark
  cardStyle?:    string | null  // glass | solid | bordered | minimal
  borderRadius?: string | null  // sharp | default | rounded | pill
  navStyle?:     string | null  // default | transparent | solid | blur
  // Branding
  favicon?:      string | null
  siteName?:     string | null
}

export default function SiteThemeInjector({ settings }: { settings: ThemeSettings | null }) {

  // ── Colors + style attributes ─────────────────────────────────────────────
  useEffect(() => {
    if (!settings) return
    const root = document.documentElement

    // Accent colors
    if (settings.accentColor)  root.style.setProperty('--accent-1', settings.accentColor)
    if (settings.accentColor2) root.style.setProperty('--accent-2', settings.accentColor2)
    if (settings.accentColor3) root.style.setProperty('--accent-3', settings.accentColor3)
    // Tailwind alias vars
    if (settings.accentColor)  { root.style.setProperty('--neon-blue', settings.accentColor);   root.style.setProperty('--color-neon-blue', settings.accentColor) }
    if (settings.accentColor2) { root.style.setProperty('--neon-purple', settings.accentColor2); root.style.setProperty('--color-neon-purple', settings.accentColor2) }
    if (settings.accentColor3) { root.style.setProperty('--neon-green', settings.accentColor3);  root.style.setProperty('--color-neon-green', settings.accentColor3) }

    // Button style
    const btn = settings.buttonStyle || 'solid'
    btn === 'solid' ? root.removeAttribute('data-btn-style') : root.setAttribute('data-btn-style', btn)

    // Card style
    const card = settings.cardStyle || 'glass'
    card === 'glass' ? root.removeAttribute('data-card-style') : root.setAttribute('data-card-style', card)

    // Border radius
    const radius = settings.borderRadius || 'default'
    const radiusMap: Record<string, string> = { sharp: '4px', default: '12px', rounded: '20px', pill: '9999px' }
    root.style.setProperty('--card-radius', radiusMap[radius] || '12px')
    root.style.setProperty('--btn-radius',  radius === 'pill' ? '9999px' : radius === 'rounded' ? '12px' : radius === 'sharp' ? '4px' : '8px')
    radius === 'default' ? root.removeAttribute('data-radius') : root.setAttribute('data-radius', radius)

    // Nav style
    const nav = settings.navStyle || 'default'
    nav === 'default' ? root.removeAttribute('data-nav-style') : root.setAttribute('data-nav-style', nav)

  }, [
    settings?.accentColor, settings?.accentColor2, settings?.accentColor3,
    settings?.buttonStyle, settings?.cardStyle, settings?.borderRadius, settings?.navStyle,
  ])

  // ── Favicon ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!settings?.favicon) return
    document.querySelectorAll("link[rel~='icon']").forEach((el) => el.remove())
    const link = document.createElement('link')
    link.rel  = 'icon'
    link.href = settings.favicon
    if (settings.favicon.endsWith('.png'))  link.type = 'image/png'
    if (settings.favicon.endsWith('.svg'))  link.type = 'image/svg+xml'
    if (settings.favicon.endsWith('.ico'))  link.type = 'image/x-icon'
    if (settings.favicon.endsWith('.webp')) link.type = 'image/webp'
    document.head.appendChild(link)
  }, [settings?.favicon])

  return null
}

