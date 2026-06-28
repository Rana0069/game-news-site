/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Add your own image CDN here if needed
    ],
    formats: ['image/avif', 'image/webp'],
    // Allow unoptimized local uploads (use Cloudinary in production)
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Prisma and bcrypt must run in Node.js runtime, not Edge
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
}

module.exports = nextConfig
