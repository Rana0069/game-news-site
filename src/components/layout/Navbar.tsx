'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Search, Menu, X, Sun, Moon, ChevronDown,
  Gamepad2, Monitor, Smartphone, Trophy, Star,
  BookOpen, HardDrive, Shuffle, Rocket, Zap, Settings
} from 'lucide-react'

const categories = [
  { name: 'Gaming News', slug: 'gaming-news', icon: Zap, color: '#00d4ff' },
  { name: 'PC Games', slug: 'pc-games', icon: Monitor, color: '#a855f7' },
  { name: 'PlayStation', slug: 'playstation', icon: Gamepad2, color: '#003791' },
  { name: 'Xbox', slug: 'xbox', icon: Gamepad2, color: '#107c10' },
  { name: 'Nintendo', slug: 'nintendo', icon: Gamepad2, color: '#e4000f' },
  { name: 'Mobile Games', slug: 'mobile-games', icon: Smartphone, color: '#f59e0b' },
  { name: 'Esports', slug: 'esports', icon: Trophy, color: '#f72585' },
  { name: 'Game Reviews', slug: 'game-reviews', icon: Star, color: '#22c55e' },
  { name: 'Game Guides', slug: 'game-guides', icon: BookOpen, color: '#06b6d4' },
  { name: 'Gaming Hardware', slug: 'gaming-hardware', icon: HardDrive, color: '#8b5cf6' },
  { name: 'Indie Games', slug: 'indie-games', icon: Shuffle, color: '#ec4899' },
  { name: 'Upcoming Games', slug: 'upcoming-games', icon: Rocket, color: '#14b8a6' },
]

interface SiteSettings {
  id?: string
  siteName?: string | null
  siteTagline?: string | null
  logo?: string | null
  favicon?: string | null
  accentColor?: string | null
  accentColor2?: string | null
  accentColor3?: string | null
  footerText?: string | null
  aboutText?: string | null
  twitterUrl?: string | null
  youtubeUrl?: string | null
  instagramUrl?: string | null
  facebookUrl?: string | null
  discordUrl?: string | null
  twitchUrl?: string | null
  contactEmail?: string | null
  googleAnalyticsId?: string | null
  [key: string]: any
}

export default function Navbar({ settings }: { settings?: SiteSettings }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  // mounted prevents SSR/client hydration mismatch for session-dependent UI
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const searchRef = useRef<HTMLInputElement>(null)
  const { data: session } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Only show Admin button after client mount AND user has admin role
  const isAdmin = mounted && session?.user &&
    ['admin', 'editor', 'author'].includes((session.user as any).role)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const siteName = settings?.siteName || 'GamePulse'

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-dark-900/95 backdrop-blur-xl border-b border-white/5 shadow-2xl'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              {settings?.logo ? (
                <Image src={settings.logo} alt={siteName} width={36} height={36} className="rounded-lg" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-neon-blue group-hover:shadow-neon-purple transition-all duration-300">
                  <Gamepad2 size={20} className="text-black" />
                </div>
              )}
              <span className="font-display font-black text-xl gradient-text hidden sm:block">
                {siteName}
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              <Link href="/" className="nav-link px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                Home
              </Link>

              {/* Categories mega menu */}
              <div
                className="relative"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <button
                  aria-expanded={megaMenuOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  Categories
                  <ChevronDown size={14} className={`transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Invisible bridge prevents gap from closing menu */}
                <div className="absolute top-full left-0 right-0 h-3" />

                <div
                  className={`absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[720px] glass-card p-6 rounded-2xl shadow-2xl border border-white/10 transition-all duration-200 ${
                    megaMenuOpen
                      ? 'opacity-100 pointer-events-auto translate-y-0'
                      : 'opacity-0 pointer-events-none -translate-y-2'
                  }`}
                  role="menu"
                  aria-label="Categories menu"
                >
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((cat) => {
                      const Icon = cat.icon
                      return (
                        <Link
                          key={cat.slug}
                          href={`/category/${cat.slug}`}
                          role="menuitem"
                          onClick={() => setMegaMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                            style={{ background: `${cat.color}22`, border: `1px solid ${cat.color}44` }}
                          >
                            <Icon size={14} style={{ color: cat.color }} />
                          </div>
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                            {cat.name}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>

              <Link href="/games" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                Games
              </Link>
              <Link href="/about" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                About
              </Link>
              <Link href="/contact" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                Contact
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* Theme toggle — rendered only after mount to avoid hydration mismatch */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              )}

              {/* Admin link — only visible after mount when logged in as admin/editor */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden sm:flex items-center gap-1.5 btn-neon text-xs px-4 py-2 rounded-lg font-bold relative z-10"
                >
                  <Settings size={13} />
                  Admin
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-dark-900/98 backdrop-blur-xl border-t border-white/5 max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              <Link href="/" className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5" onClick={() => setMobileOpen(false)}>Home</Link>
              <div className="px-3 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">Categories</div>
              {categories.slice(0, 8).map((cat) => (
                <Link key={cat.slug} href={`/category/${cat.slug}`} className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5" onClick={() => setMobileOpen(false)}>
                  {cat.name}
                </Link>
              ))}
              <Link href="/games" className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5" onClick={() => setMobileOpen(false)}>Games</Link>
              <Link href="/about" className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5" onClick={() => setMobileOpen(false)}>About</Link>
              <Link href="/contact" className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5" onClick={() => setMobileOpen(false)}>Contact</Link>
              {/* Admin link in mobile — only for admins, only after mount */}
              {isAdmin && (
                <Link href="/admin" className="block px-3 py-2 rounded-lg text-sm font-bold text-neon-blue" onClick={() => setMobileOpen(false)}>⚙ Admin Panel</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Search Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] bg-dark-950/90 backdrop-blur-xl flex items-start justify-center pt-24 px-4"
          onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
        >
          <div className="w-full max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, games, reviews..."
                className="w-full bg-dark-800 border border-neon-blue/30 rounded-2xl pl-12 pr-12 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-neon-blue focus:shadow-neon-blue"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </form>
            <p className="text-center text-gray-500 text-sm mt-4">Press ESC to close</p>
          </div>
        </div>
      )}
    </>
  )
}
