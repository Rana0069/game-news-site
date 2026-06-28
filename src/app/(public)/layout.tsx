import dynamic from 'next/dynamic'
import Footer from '@/components/layout/Footer'
import prisma from '@/lib/db'

// Prevent static generation — all public pages are rendered on-demand
// so Prisma queries only run when a real user visits, not at build time
export const dynamic = 'force-dynamic'

// Load Navbar without SSR to avoid session/theme hydration mismatches
const Navbar = dynamic(() => import('@/components/layout/Navbar'), { ssr: false })

async function getSettings() {
  try {
    return await prisma.siteSettings.findUnique({ where: { id: 'site' } })
  } catch {
    return null
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar settings={settings || undefined} />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer settings={settings || undefined} />
    </div>
  )
}
