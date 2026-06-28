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
        // Neon accent palette
        neon: {
          blue: '#00d4ff',
          purple: '#a855f7',
          green: '#22c55e',
          pink: '#f72585',
        },
        // Dark gaming backgrounds
        dark: {
          950: '#030712',
          900: '#0a0f1e',
          850: '#0d1224',
          800: '#111827',
          750: '#161d31',
          700: '#1f2937',
          600: '#374151',
        },
        // Surface colors
        surface: {
          DEFAULT: '#111827',
          hover: '#1f2937',
          border: '#1f2937',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #f72585 100%)',
        'hero-gradient': 'linear-gradient(180deg, transparent 0%, rgba(3,7,18,0.8) 60%, #030712 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.1)',
        'neon-purple': '0 0 20px rgba(168,85,247,0.3), 0 0 40px rgba(168,85,247,0.1)',
        'neon-green': '0 0 20px rgba(34,197,94,0.3), 0 0 40px rgba(34,197,94,0.1)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card': '0 4px 24px rgba(0,0,0,0.5)',
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0,212,255,0.5)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(0,212,255,0.8)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%': { filter: 'brightness(1)' },
          '100%': { filter: 'brightness(1.2)' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#e5e7eb',
            a: { color: '#00d4ff' },
            h1: { color: '#f9fafb' },
            h2: { color: '#f9fafb' },
            h3: { color: '#f9fafb' },
            h4: { color: '#f9fafb' },
            strong: { color: '#f9fafb' },
            blockquote: { color: '#9ca3af', borderLeftColor: '#a855f7' },
            code: { color: '#00d4ff', backgroundColor: '#1f2937', padding: '2px 6px', borderRadius: '4px' },
            pre: { backgroundColor: '#111827' },
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
