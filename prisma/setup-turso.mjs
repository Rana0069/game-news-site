// prisma/setup-turso.mjs
// Direct Turso setup: creates tables from migration SQL, then seeds admin + categories
import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'

const url = process.env.DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !url.startsWith('libsql://')) {
  console.error('❌ DATABASE_URL must be a libsql:// URL')
  process.exit(1)
}

const db = createClient({ url, authToken })

// ── 1. Run migration SQL ────────────────────────────────────────────────────
console.log('📦 Creating tables in Turso...')

const raw = readFileSync('./prisma/migration.sql', 'utf8')

// Normalize line endings, then split on semicolons that end a statement
// We split on ";\n" and keep only lines that contain actual SQL (not just comments)
const statements = raw
  .replace(/\r\n/g, '\n')
  .split('\n')
  // Remove pure comment lines
  .filter(line => !line.trim().startsWith('--'))
  .join('\n')
  // Split on semicolons
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 5) // filter empty/whitespace chunks

console.log(`Found ${statements.length} SQL statements to execute`)

let created = 0, skipped = 0, failed = 0
for (const stmt of statements) {
  try {
    await db.execute(stmt + ';')
    created++
  } catch (e) {
    const msg = e.message || ''
    if (msg.includes('already exists') || msg.includes('duplicate')) {
      skipped++
    } else {
      failed++
      console.error('❌ Failed:', stmt.slice(0, 80))
      console.error('   Error:', msg)
    }
  }
}

console.log(`✅ Tables: ${created} created, ${skipped} already existed, ${failed} failed`)

if (failed > 0) {
  console.error('Some statements failed — check errors above')
  process.exit(1)
}

// ── 2. Seed admin user ──────────────────────────────────────────────────────
const bcrypt = await import('bcryptjs')
const adminEmail = process.env.ADMIN_EMAIL || 'admin@gamepulse.com'
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234'
const hashedPassword = await bcrypt.default.hash(adminPassword, 12)
const adminId = 'admin-' + Date.now()

console.log('\n🌱 Seeding admin user...')
try {
  await db.execute({
    sql: `INSERT OR IGNORE INTO "User" (id, name, email, password, role, createdAt, updatedAt)
          VALUES (?, 'Admin', ?, ?, 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    args: [adminId, adminEmail, hashedPassword],
  })
  console.log('✅ Admin user created!')
} catch (e) {
  console.error('❌ Admin user failed:', e.message)
}

// ── 3. Seed site settings ───────────────────────────────────────────────────
console.log('⚙️  Seeding site settings...')
try {
  await db.execute({
    sql: `INSERT OR IGNORE INTO "SiteSettings" (id, siteName, siteTagline, accentColor, accentColor2, accentColor3, updatedAt)
          VALUES ('site', 'GamePulse', 'Your Ultimate Gaming Destination', '#00d4ff', '#a855f7', '#22c55e', CURRENT_TIMESTAMP)`,
    args: [],
  })
  console.log('✅ Site settings created!')
} catch (e) {
  console.error('❌ Settings failed:', e.message)
}

// ── 4. Seed categories ──────────────────────────────────────────────────────
console.log('🏷️  Seeding categories...')
const categories = [
  { id: 'cat-1', name: 'Gaming News',    slug: 'gaming-news',    color: '#00d4ff', icon: '📰' },
  { id: 'cat-2', name: 'PC Games',       slug: 'pc-games',       color: '#a855f7', icon: '💻' },
  { id: 'cat-3', name: 'PlayStation',    slug: 'playstation',    color: '#3b82f6', icon: '🎮' },
  { id: 'cat-4', name: 'Xbox',           slug: 'xbox',           color: '#22c55e', icon: '🟢' },
  { id: 'cat-5', name: 'Nintendo',       slug: 'nintendo',       color: '#ef4444', icon: '🔴' },
  { id: 'cat-6', name: 'Mobile Games',   slug: 'mobile-games',   color: '#f59e0b', icon: '📱' },
  { id: 'cat-7', name: 'Esports',        slug: 'esports',        color: '#ec4899', icon: '🏆' },
  { id: 'cat-8', name: 'Game Reviews',   slug: 'game-reviews',   color: '#8b5cf6', icon: '⭐' },
  { id: 'cat-9', name: 'Upcoming Games', slug: 'upcoming-games', color: '#06b6d4', icon: '🚀' },
]

let catOk = 0
for (const cat of categories) {
  try {
    await db.execute({
      sql: `INSERT OR IGNORE INTO "Category" (id, name, slug, color, icon, createdAt)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [cat.id, cat.name, cat.slug, cat.color, cat.icon],
    })
    catOk++
  } catch (e) {
    console.error('❌ Category failed:', cat.name, e.message)
  }
}
console.log(`✅ ${catOk}/${categories.length} categories seeded!`)

console.log('\n🎉 Turso setup complete!')
console.log('🔐 Admin login:', adminEmail)
console.log('🔑 Admin password:', adminPassword)
console.log('🌐 Login at: /admin/login')
