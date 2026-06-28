'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } catch {}
    setStatus('sent')
    form.reset()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Name</label>
        <input type="text" name="name" placeholder="Your name" className="input-dark" required />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Email</label>
        <input type="email" name="email" placeholder="your@email.com" className="input-dark" required />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Subject</label>
        <input type="text" name="subject" placeholder="What's this about?" className="input-dark" required />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Message</label>
        <textarea name="message" placeholder="Your message..." rows={5} className="input-dark resize-none" required />
      </div>
      {status === 'sent' ? (
        <div className="p-4 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green text-sm text-center">
          ✅ Message sent! We&apos;ll get back to you soon.
        </div>
      ) : (
        <button
          type="submit"
          disabled={status === 'sending'}
          className="btn-neon w-full relative z-10"
        >
          {status === 'sending' ? 'Sending...' : 'Send Message 🚀'}
        </button>
      )}
    </form>
  )
}
