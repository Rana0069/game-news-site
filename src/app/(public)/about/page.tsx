// Cache about page for 1 hour (rarely changes)
export const revalidate = 3600

import type { Metadata } from 'next'
import prisma from '@/lib/db'
import { Gamepad2, Users, Target, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about GamePulse — your ultimate gaming news and review destination.',
}

async function getSettings() {
  try { return await prisma.siteSettings.findUnique({ where: { id: 'site' } }) } catch { return null }
}

const team = [
  { name: 'Alex Chen', role: 'Editor in Chief', specialty: 'RPGs & Strategy', emoji: '🎯' },
  { name: 'Jordan Smith', role: 'Senior Writer', specialty: 'FPS & Esports', emoji: '🏆' },
  { name: 'Sam Rivera', role: 'Hardware Editor', specialty: 'PC & Hardware', emoji: '🖥️' },
  { name: 'Taylor Kim', role: 'Mobile Editor', specialty: 'Mobile & Indie', emoji: '📱' },
]

export default async function AboutPage() {
  const settings = await getSettings()
  const siteName = settings?.siteName || 'GamePulse'

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <header className="text-center mb-16">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-red to-red-700 flex items-center justify-center mx-auto mb-6 shadow-neon-red" aria-hidden="true">
          <Gamepad2 size={40} className="text-black" />
        </div>
        <h1 className="font-display font-black text-5xl gradient-text mb-4">{siteName}</h1>
        <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
          {settings?.aboutText || `${siteName} is your ultimate source for gaming news, reviews, guides, and more. We cover everything from AAA blockbusters to hidden indie gems.`}
        </p>
      </header>

      {/* Mission */}
      <section className="mb-16" aria-labelledby="mission-heading">
        <h2 id="mission-heading" className="sr-only">Our Mission</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Target, title: 'Our Mission', desc: 'To deliver accurate, engaging, and timely gaming content that helps players make informed decisions.', color: '#00d4ff' },
            { icon: Globe, title: 'Global Coverage', desc: 'We cover gaming news from around the world — PC, console, mobile, and esports.', color: '#a855f7' },
            { icon: Users, title: 'Community First', desc: 'Built by gamers, for gamers. Our community of readers drives everything we do.', color: '#22c55e' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <li key={title} className="glass-card p-6 text-center" style={{ borderColor: `${color}20` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: `${color}15` }} aria-hidden="true">
                <Icon size={24} style={{ color }} />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Team */}
      <section className="mb-16" aria-labelledby="team-heading">
        <h2 id="team-heading" className="section-title mb-8">Meet the Team</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {team.map((member) => (
            <li key={member.name} className="glass-card p-5 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-red/20 to-red-700/20 flex items-center justify-center mx-auto mb-3 text-3xl" aria-hidden="true">
                {member.emoji}
              </div>
              <h3 className="font-semibold text-white text-sm">{member.name}</h3>
              <p className="text-neon-red text-xs mt-1">{member.role}</p>
              <p className="text-gray-600 text-xs mt-1">{member.specialty}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Stats */}
      <section className="glass-card p-8 text-center" aria-labelledby="stats-heading" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(168,85,247,0.05))' }}>
        <h2 id="stats-heading" className="font-display font-bold text-2xl text-white mb-8">By the Numbers</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { value: '50K+', label: 'Monthly Readers' },
            { value: '1,200+', label: 'Articles Published' },
            { value: '500+', label: 'Games Reviewed' },
            { value: '15K+', label: 'Newsletter Subscribers' },
          ].map(({ value, label }) => (
            <li key={label}>
              <div className="font-display font-black text-3xl gradient-text">{value}</div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

