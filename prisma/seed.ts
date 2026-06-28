import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create site settings
  await prisma.siteSettings.upsert({
    where: { id: 'site' },
    update: {},
    create: {
      id: 'site',
      siteName: 'GamePulse',
      siteTagline: 'Your Ultimate Gaming Destination',
      accentColor: '#00d4ff',
      accentColor2: '#a855f7',
      accentColor3: '#22c55e',
      footerText: '© 2025 GamePulse. All rights reserved.',
      twitterUrl: 'https://twitter.com/gamepulse',
      youtubeUrl: 'https://youtube.com/gamepulse',
      discordUrl: 'https://discord.gg/gamepulse',
      contactEmail: 'hello@gamepulse.com',
      aboutText: 'GamePulse is your ultimate source for gaming news, reviews, guides, and more.',
    },
  })

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@1234', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gamepulse.com' },
    update: {},
    create: {
      email: 'admin@gamepulse.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'admin',
      bio: 'Site administrator and chief gaming journalist.',
    },
  })

  // Create categories
  const categories = [
    { name: 'Gaming News', slug: 'gaming-news', icon: '🎮', color: '#00d4ff' },
    { name: 'PC Games', slug: 'pc-games', icon: '🖥️', color: '#a855f7' },
    { name: 'PlayStation', slug: 'playstation', icon: '🎯', color: '#003791' },
    { name: 'Xbox', slug: 'xbox', icon: '🟩', color: '#107c10' },
    { name: 'Nintendo', slug: 'nintendo', icon: '🔴', color: '#e4000f' },
    { name: 'Mobile Games', slug: 'mobile-games', icon: '📱', color: '#f59e0b' },
    { name: 'Esports', slug: 'esports', icon: '🏆', color: '#f72585' },
    { name: 'Game Reviews', slug: 'game-reviews', icon: '⭐', color: '#22c55e' },
    { name: 'Game Guides', slug: 'game-guides', icon: '📖', color: '#06b6d4' },
    { name: 'Gaming Hardware', slug: 'gaming-hardware', icon: '🖱️', color: '#8b5cf6' },
    { name: 'Gaming Deals', slug: 'gaming-deals', icon: '💰', color: '#f97316' },
    { name: 'Indie Games', slug: 'indie-games', icon: '🎨', color: '#ec4899' },
    { name: 'Upcoming Games', slug: 'upcoming-games', icon: '🚀', color: '#14b8a6' },
  ]

  const createdCategories: Record<string, string> = {}
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    createdCategories[cat.slug] = c.id
  }

  // Create tags
  const tags = [
    'Action', 'RPG', 'FPS', 'Strategy', 'Simulation', 'Horror',
    'Adventure', 'Sports', 'Racing', 'Multiplayer', 'Open World',
    'Indie', 'AAA', 'Early Access', 'Free to Play', 'Battle Royale',
    'MOBA', 'Roguelike', 'Puzzle', 'Platformer',
  ]
  const createdTags: Record<string, string> = {}
  for (const tagName of tags) {
    const slug = tagName.toLowerCase().replace(/\s+/g, '-')
    const t = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name: tagName, slug },
    })
    createdTags[tagName] = t.id
  }

  // Create sample posts
  const posts = [
    {
      title: 'GTA 6 Release Date Confirmed: Everything You Need to Know',
      slug: 'gta-6-release-date-confirmed',
      excerpt: 'Rockstar Games has finally confirmed the GTA 6 release date alongside a brand new trailer showcasing Vice City in stunning detail.',
      content: `<h2>The Wait Is Almost Over</h2><p>After years of anticipation, Rockstar Games has officially confirmed the release date for Grand Theft Auto VI. The game will launch on PlayStation 5 and Xbox Series X/S, with a PC version expected to follow.</p><h2>What We Know So Far</h2><p>The game returns to Vice City with a massive open world that dwarfs anything Rockstar has created before. Players will take on the roles of two protagonists in a story inspired by real-life crimes and modern American culture.</p><blockquote><p>"This is the most ambitious game we have ever made," — Rockstar Games</p></blockquote><h2>Features Confirmed</h2><ul><li>Largest open world in GTA history</li><li>Dual protagonists (male and female)</li><li>Dynamic weather and ecosystem</li><li>Enhanced GTA Online at launch</li><li>Ray tracing and 4K 60fps support</li></ul>`,
      featuredImage: '/uploads/placeholder-gta6.jpg',
      status: 'published',
      publishedAt: new Date(),
      featured: true,
      trending: true,
      readingTime: 5,
      views: 15420,
      likes: 892,
      categoryId: createdCategories['gaming-news'],
      authorId: admin.id,
      metaTitle: 'GTA 6 Release Date Confirmed | GamePulse',
      metaDescription: 'Rockstar Games confirms GTA 6 release date. Everything you need to know about Grand Theft Auto VI.',
    },
    {
      title: 'Best Gaming PCs of 2025: Our Top Picks for Every Budget',
      slug: 'best-gaming-pcs-2025',
      excerpt: 'From budget-friendly options to ultimate powerhouses, we round up the best gaming PCs you can buy right now.',
      content: `<h2>Finding Your Perfect Gaming PC</h2><p>Whether you're a casual gamer or a competitive esports player, there's a gaming PC for every need and budget in 2025. We've tested dozens of machines to bring you the definitive guide.</p><h2>Best Overall: Alienware Aurora R16</h2><p>The Alienware Aurora R16 continues to dominate with its latest generation hardware and exceptional build quality. Powered by an RTX 4090 and Intel Core i9, this machine handles everything you throw at it.</p><h2>Best Budget Pick: HP Omen 45L</h2><p>At under $1,200, the HP Omen 45L delivers incredible value with its RTX 4070 and Ryzen 7 processor combination.</p>`,
      featuredImage: '/uploads/placeholder-pc.jpg',
      status: 'published',
      publishedAt: new Date(Date.now() - 86400000),
      featured: true,
      trending: false,
      readingTime: 8,
      views: 8920,
      likes: 341,
      categoryId: createdCategories['gaming-hardware'],
      authorId: admin.id,
      metaTitle: 'Best Gaming PCs 2025 | GamePulse',
      metaDescription: 'Our top picks for the best gaming PCs in 2025, covering every budget from $800 to $5000+.',
    },
    {
      title: 'Elden Ring: Shadow of the Erdtree Review – A Masterpiece DLC',
      slug: 'elden-ring-shadow-erdtree-review',
      excerpt: 'FromSoftware\'s expansion is everything fans hoped for and more — a sprawling new world that rivals the base game.',
      content: `<h2>Score: 10/10</h2><p>Shadow of the Erdtree is not just a great piece of DLC — it's one of the greatest expansions in gaming history. FromSoftware has delivered a massive, content-rich journey that expands on everything that made the base game extraordinary.</p><h2>A World Worth Exploring</h2><p>The Land of Shadow is a hauntingly beautiful realm, filled with secrets around every corner. New environments range from sun-drenched plains to oppressive swamps and towering fortresses.</p><h2>Verdict</h2><p>If you loved Elden Ring, Shadow of the Erdtree is an essential purchase. If you've never played the base game, this is the perfect time to start.</p>`,
      featuredImage: '/uploads/placeholder-elden.jpg',
      status: 'published',
      publishedAt: new Date(Date.now() - 172800000),
      featured: false,
      trending: true,
      readingTime: 10,
      views: 22100,
      likes: 1204,
      categoryId: createdCategories['game-reviews'],
      authorId: admin.id,
      metaTitle: 'Elden Ring: Shadow of the Erdtree Review | GamePulse',
      metaDescription: 'Our full review of Elden Ring: Shadow of the Erdtree DLC. Is it worth buying?',
    },
    {
      title: 'PlayStation 6 Leaked Specs: 4K 120fps and 3TB SSD',
      slug: 'playstation-6-leaked-specs',
      excerpt: 'Industry sources have revealed what Sony is planning for the PlayStation 6, and the specs are mind-blowing.',
      content: `<h2>PS6 Spec Leak Breakdown</h2><p>According to multiple industry insiders, Sony's next-generation PlayStation console will feature hardware that leapfrogs the current generation significantly.</p><h2>Rumored Specs</h2><ul><li>Custom AMD GPU equivalent to RX 8900 XT</li><li>AMD Zen 5-based CPU</li><li>3TB NVMe SSD at 14GB/s</li><li>32GB GDDR7 RAM</li><li>4K 120fps native, 8K upscaling</li></ul>`,
      featuredImage: '/uploads/placeholder-ps6.jpg',
      status: 'published',
      publishedAt: new Date(Date.now() - 259200000),
      featured: false,
      trending: true,
      readingTime: 4,
      views: 31500,
      likes: 1876,
      categoryId: createdCategories['playstation'],
      authorId: admin.id,
      metaTitle: 'PlayStation 6 Leaked Specs | GamePulse',
      metaDescription: 'Leaked PlayStation 6 specs reveal 4K 120fps gaming, 3TB SSD, and more incredible features.',
    },
    {
      title: 'Top 10 Most Anticipated Games of 2025',
      slug: 'top-10-anticipated-games-2025',
      excerpt: 'From massive sequels to brand-new IPs, 2025 is shaping up to be one of the best years for gaming ever.',
      content: `<h2>2025: The Year Gaming Gets Serious</h2><p>With so many incredible titles on the horizon, 2025 is looking like a landmark year for the gaming industry. Here are our top 10 most anticipated games.</p><ol><li><strong>GTA VI</strong> – The most anticipated game in history finally arrives</li><li><strong>Hollow Knight: Silksong</strong> – The long-awaited sequel</li><li><strong>Fable</strong> – Playground Games reinvents a classic</li><li><strong>Avowed</strong> – Obsidian's next RPG epic</li><li><strong>Monster Hunter Wilds</strong> – The next evolution of the series</li></ol>`,
      featuredImage: '/uploads/placeholder-anticipated.jpg',
      status: 'published',
      publishedAt: new Date(Date.now() - 345600000),
      featured: false,
      trending: false,
      readingTime: 6,
      views: 9800,
      likes: 445,
      categoryId: createdCategories['upcoming-games'],
      authorId: admin.id,
      metaTitle: 'Top 10 Most Anticipated Games of 2025 | GamePulse',
      metaDescription: 'The 10 most exciting upcoming games of 2025 that every gamer needs to play.',
    },
  ]

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    })
  }

  // Create sample games
  const games = [
    {
      title: 'GTA VI',
      slug: 'gta-vi',
      description: 'Return to Vice City in the most ambitious open-world game ever created.',
      coverImage: '/uploads/placeholder-gta6.jpg',
      releaseDate: new Date('2025-05-26'),
      developer: 'Rockstar Games',
      publisher: 'Rockstar Games',
      platforms: JSON.stringify(['PS5', 'Xbox Series X/S']),
      genres: JSON.stringify(['Action', 'Adventure', 'Open World']),
      rating: 'M',
      reviewScore: 10.0,
      featured: true,
      upcoming: false,
    },
    {
      title: 'Monster Hunter Wilds',
      slug: 'monster-hunter-wilds',
      description: 'Hunt massive creatures across living ecosystems that breathe and change.',
      coverImage: '/uploads/placeholder-mhw.jpg',
      releaseDate: new Date('2025-02-28'),
      developer: 'Capcom',
      publisher: 'Capcom',
      platforms: JSON.stringify(['PS5', 'Xbox Series X/S', 'PC']),
      genres: JSON.stringify(['Action', 'RPG']),
      rating: 'T',
      reviewScore: 9.2,
      featured: true,
      upcoming: false,
    },
    {
      title: 'Hollow Knight: Silksong',
      slug: 'hollow-knight-silksong',
      description: 'Play as Hornet and explore an all-new kingdom filled with wild creatures.',
      coverImage: '/uploads/placeholder-silksong.jpg',
      releaseDate: new Date('2025-06-15'),
      developer: 'Team Cherry',
      publisher: 'Team Cherry',
      platforms: JSON.stringify(['PC', 'Nintendo Switch', 'PS5', 'Xbox Series X/S']),
      genres: JSON.stringify(['Metroidvania', 'Platformer', 'Indie']),
      rating: 'T',
      reviewScore: 9.8,
      featured: false,
      upcoming: true,
    },
    {
      title: 'Fable',
      slug: 'fable-2025',
      description: 'A bold, new beginning for the beloved RPG franchise.',
      coverImage: '/uploads/placeholder-fable.jpg',
      releaseDate: new Date('2025-09-01'),
      developer: 'Playground Games',
      publisher: 'Xbox Game Studios',
      platforms: JSON.stringify(['Xbox Series X/S', 'PC']),
      genres: JSON.stringify(['RPG', 'Action', 'Adventure']),
      rating: 'M',
      featured: false,
      upcoming: true,
    },
  ]

  for (const game of games) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: {},
      create: game,
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log('📧 Admin login: admin@gamepulse.com')
  console.log('🔑 Admin password: Admin@1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
