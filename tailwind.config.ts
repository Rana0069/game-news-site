import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Red neon accent palette
        neon: {
          red:    '#ff1a1a',
          blue:   '#00d4ff',  // kept for backwards compat
          purple: '#a855f7',  // kept for backwards compat
          green:  '#22c55e',
          pink:   '#ff4d6d',
        },
        // Pure black gaming backgrounds
        dark: {
          950: '#000000',
          900: '#080000',
          850: '#0f0000',
          800: '#140000',
          750: '#1a0000',
          700: '#220000',
          600: '#3d0000',
        },
        surface: {
          DEFAULT: '#0f0000',
          hover:   '#1a0000',
          border:  '#3d0000',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'neon-gradient':  'linear-gradient(135deg, #ff1a1a 0%, #cc0000 50%, #ff4d6d 100%)',
        'hero-gradient':  'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 60%, #000000 100%)',
        'card-gradient':  'linear-gradient(135deg, rgba(255,26,26,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
      boxShadow: {
        'neon-red':    '0 0 20px rgba(255,26,26,0.4), 0 0 60px rgba(255,26,26,0.15)',
        'neon-blue':   '0 0 20px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.1)',
        'neon-purple': '0 0 20px rgba(168,85,247,0.3), 0 0 40px rgba(168,85,247,0.1)',
        'neon-green':  '0 0 20px rgba(34,197,94,0.3), 0 0 40px rgba(34,197,94,0.1)',
        'glass':       '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card':        '0 4px 24px rgba(0,0,0,0.7)',
      },
      animation: {
        'gradient-x':  'gradient-x 15s ease infinite',
        'pulse-neon':  'pulse-neon 2s ease-in-out infinite',
        'slide-up':    'slide-up 0.5s ease-out',
        'fade-in':     'fade-in 0.3s ease-out',
        'shimmer':     'shimmer 2s linear infinite',
        'float':       'float 6s ease-in-out infinite',
        'glow':        'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(255,26,26,0.6)' },
          '50%':      { opacity: '0.8', boxShadow: '0 0 50px rgba(255,26,26,0.9)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%':   { filter: 'brightness(1)' },
          '100%': { filter: 'brightness(1.25)' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#e5e7eb',
            a:           { color: '#ff1a1a' },
            h1:          { color: '#f9fafb' },
            h2:          { color: '#f9fafb' },
            h3:          { color: '#f9fafb' },
            h4:          { color: '#f9fafb' },
            strong:      { color: '#f9fafb' },
            blockquote:  { color: '#9ca3af', borderLeftColor: '#ff1a1a' },
            code:        { color: '#ff4d6d', backgroundColor: '#140000', padding: '2px 6px', borderRadius: '4px' },
            pre:         { backgroundColor: '#0f0000' },
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
