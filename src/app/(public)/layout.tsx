// Cache site settings for 1 hour — avoids a DB round-trip on every page load.
// Settings rarely change, so 3600s is safe and dramatically improves TTFB.
export const revalidate = 3600

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SiteThemeInjector from '@/components/providers/SiteThemeInjector'
import prisma from '@/lib/db'

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
      {/* Injects dynamic accent colors + favicon from Settings into the DOM */}
      <SiteThemeInjector settings={settings} />
      <Navbar settings={settings || undefined} />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer settings={settings || undefined} />
    </div>
  )
}
