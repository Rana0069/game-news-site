'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import {
  LayoutDashboard, FileText, Image, Tag, MessageSquare, Users,
  Gamepad2, Settings, LogOut, Menu, X, BarChart2, ChevronRight,
  Plus, Zap
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/posts/new', label: 'New Post', icon: Plus, indent: true },
  { href: '/admin/media', label: 'Media', icon: Image },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/games', label: 'Games', icon: Gamepad2 },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

interface AdminSidebarProps {
  user: { name?: string; email?: string; role?: string; image?: string }
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-dark-900 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-dark-950/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-dark-900 border-r border-white/5 flex flex-col z-40 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
              <Zap size={16} className="text-black" />
            </div>
            <span className="font-display font-black gradient-text">GamePulse CMS</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`admin-nav-item ${item.indent ? 'ml-4' : ''} ${active ? 'active bg-neon-blue/8 text-neon-blue border-l-2 border-neon-blue' : ''}`}
              >
                <Icon size={16} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={12} />}
              </Link>
            )
          })}
        </nav>

        {/* User + Signout */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="admin-nav-item text-xs text-gray-500"
          >
            <Zap size={12} />
            View Site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="admin-nav-item w-full text-left text-red-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
