import nextDynamic from 'next/dynamic'
import Footer from '@/components/layout/Footer'
import prisma from '@/lib/db'

// Allow pages to opt-in to static generation or ISR.
// We handle build-time empty DBs gracefully via try/catch in fetch functions.

// Load Navbar without SSR to avoid session/theme hydration mismatches
const Navbar = nextDynamic(() => import('@/components/layout/Navbar'), { ssr: false })

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
