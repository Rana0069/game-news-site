import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  // If no session, just render children (login page handles its own layout)
  if (!session?.user) {
    return <>{children}</>
  }

  const role = (session.user as any).role as string | undefined

  // If logged in but not an admin/editor/author, redirect to homepage
  if (!role || !['admin', 'editor', 'author'].includes(role)) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <AdminSidebar user={session.user as any} />
      <div className="flex-1 flex flex-col min-h-screen ml-0 lg:ml-64">
        {/* Admin header */}
        <header className="sticky top-0 z-30 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-white/5 flex items-center px-6 gap-4">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
              <span className="text-black font-bold text-xs">
                {((session.user as any).name || 'A').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">{(session.user as any).name || 'Admin'}</p>
              <p className="text-xs text-gray-500 capitalize">{role || 'admin'}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
