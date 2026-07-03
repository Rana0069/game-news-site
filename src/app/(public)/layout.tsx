// Cache site settings for 1 hour — avoids a DB round-trip on every page load.
// Settings rarely change, so 3600s is safe and dramatically improves TTFB.
export const revalidate = 3600

import nextDynamic from 'next/dynamic'
import Footer from '@/components/layout/Footer'
import prisma from '@/lib/db'

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
