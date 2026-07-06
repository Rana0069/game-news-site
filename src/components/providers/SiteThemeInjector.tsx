'use client'

/**
 * SiteThemeInjector — runs client-side to apply dynamic settings from the DB:
 * 1. Injects accent colors as CSS custom properties (--accent-1/2/3)
 * 2. Swaps the browser favicon to the one uploaded in Settings
 *
 * This is a client component so it can update the DOM after hydration
 * without blocking the initial server render.
 */
import { useEffect } from 'react'

interface Settings {
  accentColor?:  string | null
  accentColor2?: string | null
  accentColor3?: string | null
  favicon?:      string | null
  siteName?:     string | null
  buttonStyle?:  string | null  // 'solid' | 'gradient' | 'outline' | 'dark'
}

export default function SiteThemeInjector({ settings }: { settings: Settings | null }) {
  useEffect(() => {
    if (!settings) return
    const root = document.documentElement

    // ── Accent colors ─────────────────────────────────────────────────────────
    if (settings.accentColor)  root.style.setProperty('--accent-1', settings.accentColor)
    if (settings.accentColor2) root.style.setProperty('--accent-2', settings.accentColor2)
    if (settings.accentColor3) root.style.setProperty('--accent-3', settings.accentColor3)

    // Also update the neon-blue / neon-purple Tailwind aliases used in components
    // These are CSS vars that map to Tailwind config, so setting them here
    // makes all btn-neon / badge-neon etc. also pick up the new color.
    if (settings.accentColor) {
      root.style.setProperty('--neon-blue', settings.accentColor)
      root.style.setProperty('--color-neon-blue', settings.accentColor)
    }
    if (settings.accentColor2) {
      root.style.setProperty('--neon-purple', settings.accentColor2)
      root.style.setProperty('--color-neon-purple', settings.accentColor2)
    }
    if (settings.accentColor3) {
      root.style.setProperty('--neon-green', settings.accentColor3)
      root.style.setProperty('--color-neon-green', settings.accentColor3)
    }

    // ── Button style ────────────────────────────────────────────────────────────────
    const style = settings.buttonStyle || 'solid'
    if (style === 'solid') {
      root.removeAttribute('data-btn-style')
    } else {
      root.setAttribute('data-btn-style', style)
    }
  }, [settings?.accentColor, settings?.accentColor2, settings?.accentColor3, settings?.buttonStyle])

  useEffect(() => {
    if (!settings?.favicon) return

    // ── Favicon ───────────────────────────────────────────────────────────────
    // Remove all existing favicon links first
    document.querySelectorAll("link[rel~='icon']").forEach((el) => el.remove())

    // Insert the dynamic favicon from Settings
    const link = document.createElement('link')
    link.rel  = 'icon'
    link.href = settings.favicon
    // Auto-detect type based on URL extension
    if (settings.favicon.endsWith('.png'))  link.type = 'image/png'
    if (settings.favicon.endsWith('.svg'))  link.type = 'image/svg+xml'
    if (settings.favicon.endsWith('.ico'))  link.type = 'image/x-icon'
    if (settings.favicon.endsWith('.webp')) link.type = 'image/webp'
    document.head.appendChild(link)
  }, [settings?.favicon])

  // This component renders nothing — it only manipulates <head> and <html>
  return null
}
