'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import {
  LayoutDashboard, FileText, Image, Tag, MessageSquare, Users,
  Gamepad2, Settings, LogOut, Menu, X, ChevronRight,
  Plus, Zap, Crown, Shield, Feather, MessageCircle, Palette,
} from 'lucide-react'

// Role definitions — controls what each member sees in the sidebar
// and maps to access rules on individual pages
const ROLE_META: Record<string, { label: string; color: string; Icon: typeof Crown }> = {
  admin:     { label: 'Admin',     color: '#00d4ff', Icon: Crown },
  editor:    { label: 'Editor',    color: '#a855f7', Icon: Shield },
  author:    { label: 'Author',    color: '#22c55e', Icon: Feather },
  moderator: { label: 'Moderator', color: '#f59e0b', Icon: MessageCircle },
}

interface NavItem {
  href: string
  label: string
  icon: typeof Zap
  exact?: boolean
  indent?: boolean
  /** Roles that can see and access this nav item. Omit = all roles. */
  roles?: string[]
}

const NAV_ITEMS: NavItem[] = [
  // ─ Everyone ─
  { href: '/admin',            label: 'Dashboard',  icon: LayoutDashboard, exact: true },

  // ─ Posts — Admin / Editor see all; Author sees only their own (handled server-side) ─
  { href: '/admin/posts',      label: 'Posts',      icon: FileText,       roles: ['admin', 'editor', 'author'] },
  { href: '/admin/posts/new',  label: 'New Post',   icon: Plus,           roles: ['admin', 'editor', 'author'], indent: true },

  // ─ Media — Admin, Editor, Author ─
  { href: '/admin/media',      label: 'Media',      icon: Image,          roles: ['admin', 'editor', 'author'] },

  // ─ Categories / Games — Admin + Editor only ─
  { href: '/admin/categories', label: 'Categories', icon: Tag,            roles: ['admin', 'editor'] },
  { href: '/admin/games',      label: 'Games',      icon: Gamepad2,       roles: ['admin', 'editor'] },

  // ─ Comments — Admin, Editor, Moderator ─
  { href: '/admin/comments',   label: 'Comments',   icon: MessageSquare,  roles: ['admin', 'editor', 'moderator'] },

  // ─ Users / Settings — Admin only ─
  { href: '/admin/users',      label: 'Team',       icon: Users,          roles: ['admin'] },
  { href: '/admin/theme',      label: 'Theme',      icon: Palette,        roles: ['admin'] },
  { href: '/admin/settings',   label: 'Settings',   icon: Settings,       roles: ['admin'] },
]

interface AdminSidebarProps {
  user: { name?: string; email?: string; role?: string; image?: string }
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const role = user.role || 'author'
  const roleMeta = ROLE_META[role] ?? ROLE_META.author
  const RoleIcon = roleMeta.Icon

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  // Filter nav items by role
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role)
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-dark-900 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-dark-950/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-dark-900 border-r border-white/5 flex flex-col z-40 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/5 flex-shrink-0">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
              <Zap size={16} className="text-black" />
            </div>
            <span className="font-display font-black gradient-text">GamePulse CMS</span>
          </Link>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: `${roleMeta.color}20`, color: roleMeta.color }}
          >
            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name || 'User'}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <RoleIcon size={10} style={{ color: roleMeta.color }} />
              <span className="text-xs capitalize" style={{ color: roleMeta.color }}>
                {roleMeta.label}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-0.5" aria-label="Admin navigation">
          {visibleItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`admin-nav-item ${item.indent ? 'ml-4 text-xs' : ''} ${
                  active
                    ? 'active bg-neon-blue/8 text-neon-blue border-l-2 border-neon-blue'
                    : ''
                }`}
              >
                <Icon size={item.indent ? 14 : 16} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={12} />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-white/5 space-y-1 flex-shrink-0">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-nav-item text-xs text-gray-500 hover:text-gray-300"
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
