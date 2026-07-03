'use client'

import Link from 'next/link'
import { Gamepad2, Twitter, Youtube, Instagram, Facebook, MessageCircle, Twitch, Mail, Rss } from 'lucide-react'

interface SiteSettings {
  siteName?: string | null
  footerText?: string | null
  twitterUrl?: string | null
  youtubeUrl?: string | null
  instagramUrl?: string | null
  facebookUrl?: string | null
  discordUrl?: string | null
  twitchUrl?: string | null
  contactEmail?: string | null
  logo?: string | null
  accentColor?: string | null
  [key: string]: any
}

const footerLinks = {
  categories: [
    { label: 'Gaming News', href: '/category/gaming-news' },
    { label: 'Game Reviews', href: '/category/game-reviews' },
    { label: 'PC Games', href: '/category/pc-games' },
    { label: 'PlayStation', href: '/category/playstation' },
    { label: 'Xbox', href: '/category/xbox' },
    { label: 'Esports', href: '/category/esports' },
    { label: 'Indie Games', href: '/category/indie-games' },
    { label: 'Upcoming Games', href: '/category/upcoming-games' },
  ],
  site: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Game Database', href: '/games' },
    { label: 'Newsletter', href: '/newsletter' },
    { label: 'RSS Feed', href: '/rss.xml' },
    { label: 'Sitemap', href: '/sitemap.xml' },
  ],
}

export default function Footer({ settings }: { settings?: SiteSettings }) {
  const siteName = settings?.siteName || 'GamePulse'
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: Twitter, href: settings?.twitterUrl, label: 'Twitter' },
    { icon: Youtube, href: settings?.youtubeUrl, label: 'YouTube' },
    { icon: Instagram, href: settings?.instagramUrl, label: 'Instagram' },
    { icon: Facebook, href: settings?.facebookUrl, label: 'Facebook' },
    { icon: MessageCircle, href: settings?.discordUrl, label: 'Discord' },
    { icon: Twitch, href: settings?.twitchUrl, label: 'Twitch' },
  ].filter((s): s is { icon: typeof Twitter; href: string; label: string } => !!s.href)

  return (
    <footer className="bg-dark-900 border-t border-white/5 mt-20">
      {/* Newsletter section */}
      <section className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display font-bold text-2xl text-white">Stay in the Game</h3>
              <p className="text-gray-400 mt-1">Get the latest gaming news delivered to your inbox.</p>
            </div>
            <form
              className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0"
              onSubmit={(e) => {
                e.preventDefault()
                const input = e.currentTarget.querySelector('input')
                if (input?.value) {
                  fetch('/api/newsletter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: input.value }),
                  })
                  input.value = ''
                  alert('Subscribed! 🎮')
                }
              }}
            >
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <input
                id="footer-email"
                type="email"
                placeholder="Enter your email"
                className="input-dark w-full sm:w-64"
                required
              />
              <button type="submit" className="btn-neon w-full sm:w-auto whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-12 lg:col-span-5">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                <Gamepad2 size={22} className="text-black" />
              </div>
              <span className="font-display font-black text-xl gradient-text">{siteName}</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Your ultimate source for gaming news, reviews, guides, and exclusive content.
            </p>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-neon-blue hover:border-neon-blue/30 hover:bg-neon-blue/5 transition-all"
                    aria-label={label}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-neon-blue transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Site links */}
          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4">Site</h4>
            <ul className="space-y-2">
              {footerLinks.site.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-neon-blue transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4">Contact</h4>
            {settings?.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-neon-blue transition-colors mb-4"
              >
                <Mail size={14} />
                {settings.contactEmail}
              </a>
            )}
            <a href="/rss.xml" className="flex items-center gap-2 text-sm text-gray-500 hover:text-neon-blue transition-colors">
              <Rss size={14} />
              RSS Feed
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            {settings?.footerText || `© ${currentYear} ${siteName}. All rights reserved.`}
          </p>
          <div className="flex gap-4 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
