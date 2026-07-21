# 🎮 GamePulse — Gaming News Platform

<div align="center">

![GamePulse Banner](https://img.shields.io/badge/GamePulse-Red%20%26%20Black%20Neon-ff1a1a?style=for-the-badge&logo=gamepad&logoColor=white)

**Your ultimate source for gaming news, reviews, guides, and more.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2d3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

</div>

---

## ✨ Features

- 🔴 **Red & Black Neon Theme** — Vivid gaming aesthetic with neon glows, scanlines, animated gradient borders, and glassmorphism cards
- 📰 **Full CMS** — Create, edit, and publish articles with a rich Tiptap editor
- 🎮 **Game Database** — Track upcoming and released games with scores, platforms, and cover art
- 🔍 **Search** — Full-text search across all articles and games
- 📂 **Categories & Tags** — Organize content with nested categories and tags
- 🏆 **Trending & Featured** — Curate content via admin panel
- 🎬 **Hero Slider** — Animated featured article carousel with scanlines overlay
- 📺 **YouTube Integration** — Embed gaming videos and playlists
- 📧 **Newsletter** — Email subscription system
- 👤 **Auth** — Role-based access (Admin / Editor / Author) via NextAuth.js
- 🌗 **Dark / Light Mode** — Theme toggle with `next-themes`
- 🎨 **Dynamic Theme** — Accent colors, button style, card style, nav style configurable from admin
- 📊 **Analytics** — Vercel Analytics + Speed Insights built-in
- 🗺️ **SEO** — Sitemap, RSS feed, OG images, meta descriptions
- ♿ **Semantic HTML** — Full `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `<article>`, `<figure>` structure

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) + Custom CSS |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) · [Outfit](https://fonts.google.com/specimen/Outfit) · [Orbitron](https://fonts.google.com/specimen/Orbitron) (via `next/font`) |
| Database | [Turso](https://turso.tech/) (libSQL / SQLite edge DB) |
| ORM | [Prisma 5](https://prisma.io/) |
| Auth | [NextAuth.js v4](https://next-auth.js.org/) |
| Editor | [Tiptap](https://tiptap.dev/) (rich text) |
| Images | [Cloudinary](https://cloudinary.com/) + Next.js Image Optimization |
| Icons | [Lucide React](https://lucide.dev/) |
| Deployment | [Vercel](https://vercel.com/) |
| Analytics | [Vercel Analytics](https://vercel.com/analytics) + Speed Insights |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `18+`
- A [Turso](https://turso.tech/) database (free tier works)
- A [Cloudinary](https://cloudinary.com/) account (for image uploads)
- A [Google OAuth](https://console.cloud.google.com/) app (for admin login)

### 1. Clone the repo

```bash
git clone https://github.com/Rana0069/game-news-site.git
cd game-news-site
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
# Database (Turso)
DATABASE_URL="libsql://your-db.turso.io"
DATABASE_AUTH_TOKEN="your-turso-token"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 4. Push the database schema

```bash
npm run db:push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎮

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/           # Public-facing pages
│   │   ├── page.tsx        # Homepage
│   │   ├── article/        # Article reader
│   │   ├── category/       # Category listing
│   │   ├── games/          # Game database
│   │   ├── search/         # Search results
│   │   └── tag/            # Tag listing
│   ├── admin/              # Admin panel (auth-protected)
│   │   ├── posts/          # Post management
│   │   ├── categories/     # Category management
│   │   ├── games/          # Game management
│   │   ├── media/          # Media uploads
│   │   ├── settings/       # Site settings
│   │   └── theme/          # Theme customization
│   └── api/                # API routes
├── components/
│   ├── article/            # ArticleCard, ArticleReader
│   ├── home/               # HeroSlider
│   ├── layout/             # Navbar, Footer, Sidebar
│   ├── admin/              # Admin-specific components
│   ├── providers/          # ThemeProvider, SessionProvider, SiteThemeInjector
│   └── ui/                 # Shared UI components
├── lib/                    # Prisma client, utils, auth
├── styles/
│   └── globals.css         # Global styles & neon theme tokens
prisma/
└── schema.prisma           # Database schema
```

---

## 🎨 Theme System

GamePulse uses a **dynamic red & black neon** design system:

- **Primary accent:** `#ff1a1a` (vivid red)
- **Secondary accent:** `#cc0000` (deep red)
- **Tertiary accent:** `#ff4d6d` (red-pink)
- **Background:** `#000000` / `#0f0000` (pure black / dark red-black)
- **Glassmorphism cards** with red-tinted borders and neon hover glows
- **Orbitron** display font for gaming headings
- **Scanlines** overlay on hero slider (retro CRT effect)
- **Animated gradient borders** on featured sections

Theme tokens can be overridden via the Admin → Theme panel (accent colors, button style, card style, border radius, nav style).

---

## 🗄️ Database Scripts

```bash
npm run db:push       # Push schema to Turso
npm run db:generate   # Regenerate Prisma client
npm run db:studio     # Open Prisma Studio (visual DB browser)
npm run db:seed       # Seed sample data
npm run db:migrate    # Run theme column migration
```

---

## 🏗️ Build & Deploy

```bash
npm run build    # Production build
npm run start    # Start production server
```

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Rana0069/game-news-site)

---

## 📸 Screenshots

> Homepage with red & black neon hero slider, glassmorphism article cards, and neon section titles.

---

## 📄 License

MIT © [Rana0069](https://github.com/Rana0069)
