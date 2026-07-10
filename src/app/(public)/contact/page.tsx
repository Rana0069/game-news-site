import type { Metadata } from 'next'
import { Mail, Twitter, Youtube, MessageCircle } from 'lucide-react'
import prisma from '@/lib/db'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the GamePulse team.',
}

async function getSettings() {
  try { return await prisma.siteSettings.findUnique({ where: { id: 'site' } }) } catch { return null }
}

export default async function ContactPage() {
  const settings = await getSettings()

  const socials = [
    { icon: Twitter, label: 'Twitter / X', href: settings?.twitterUrl, color: '#1da1f2' },
    { icon: Youtube, label: 'YouTube', href: settings?.youtubeUrl, color: '#ff0000' },
    { icon: MessageCircle, label: 'Discord', href: settings?.discordUrl, color: '#5865f2' },
  ].filter((s) => s.href)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-display font-black text-4xl text-white mb-3">Contact Us</h1>
        <p className="text-gray-400 text-lg">Have a question, tip, or want to collaborate? We'd love to hear from you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form — client component */}
        <div className="glass-card p-8">
          <h2 className="font-display font-bold text-xl text-white mb-6">Send a Message</h2>
          <ContactForm />
        </div>

        {/* Info — server rendered */}
        <div className="space-y-6">
          {settings?.contactEmail && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Mail size={18} className="text-neon-red" />
                Email Us
              </h3>
              <a href={`mailto:${settings.contactEmail}`} className="text-neon-red hover:underline">
                {settings.contactEmail}
              </a>
            </div>
          )}

          {socials.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Follow Us</h3>
              <div className="space-y-3">
                {socials.map(({ icon: Icon, label, href, color }) => (
                  <a key={label} href={href || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-3">📰 Press & Partnerships</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              For press inquiries, review copies, or partnership opportunities, please reach out via email with the subject line "Press" or "Partnership".
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

