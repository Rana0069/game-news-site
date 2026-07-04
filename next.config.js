/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint runs locally via `npm run lint` — skip during Vercel builds
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    unoptimized: process.env.NODE_ENV === 'development',
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  // Reduce JS bundle size — tree-shakes large icon/animation libraries
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // Security headers fix Lighthouse Best Practices red !
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
