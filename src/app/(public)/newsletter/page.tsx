import { Mail, Zap, CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'Newsletter | GamePulse',
  description: 'Subscribe to the GamePulse newsletter for the latest gaming news, reviews, and deals.',
}

export default function NewsletterPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-12">
        <span className="badge badge-neon mb-4 inline-flex items-center gap-2">
          <Mail size={14} /> Weekly Newsletter
        </span>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-white mb-6">
          Level Up Your Inbox
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Join 50,000+ gamers who get the latest news, exclusive reviews, and hand-picked deals delivered every week. No spam, just gaming goodness.
        </p>
      </div>

      <div className="glass-card p-8 sm:p-12 relative overflow-hidden max-w-2xl mx-auto">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-red/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none" />
        
        <form className="relative z-10 flex flex-col gap-4" action="/api/newsletter" method="POST">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              className="input-dark w-full text-lg py-4"
              required
            />
          </div>
          <button type="submit" className="btn-neon w-full py-4 text-lg">
            Subscribe Free
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            By subscribing, you agree to our Privacy Policy and Terms of Service.
          </p>
        </form>

        <div className="mt-10 grid sm:grid-cols-2 gap-4 relative z-10">
          {[
            'Breaking gaming news & rumors',
            'In-depth game reviews',
            'Hardware & tech guides',
            'Exclusive deals & discounts',
          ].map((feature, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 size={18} className="text-neon-green flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

