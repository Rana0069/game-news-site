// prisma/add-theme-columns.mjs
// Adds the new Theme Studio columns to SiteSettings in Turso
// Run with: node prisma/add-theme-columns.mjs
import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !url.startsWith('libsql://')) {
  console.error('❌ TURSO_DATABASE_URL must be a libsql:// URL')
  process.exit(1)
}

const db = createClient({ url, authToken })

// Each ALTER TABLE is separate — SQLite/Turso can't do multiple columns in one stmt
const migrations = [
  `ALTER TABLE SiteSettings ADD COLUMN buttonStyle  TEXT NOT NULL DEFAULT 'solid'`,
  `ALTER TABLE SiteSettings ADD COLUMN cardStyle    TEXT NOT NULL DEFAULT 'glass'`,
  `ALTER TABLE SiteSettings ADD COLUMN borderRadius TEXT NOT NULL DEFAULT 'default'`,
  `ALTER TABLE SiteSettings ADD COLUMN navStyle     TEXT NOT NULL DEFAULT 'default'`,
  `ALTER TABLE SiteSettings ADD COLUMN googleAnalyticsId TEXT`,
]

console.log('🚀 Adding Theme Studio columns to SiteSettings...')
for (const sql of migrations) {
  try {
    await db.execute(sql)
    const col = sql.match(/ADD COLUMN (\w+)/)?.[1]
    console.log(`  ✅ Added column: ${col}`)
  } catch (err) {
    // "duplicate column name" is expected if column already exists — safe to skip
    if (err?.message?.includes('duplicate column') || err?.message?.includes('already exists')) {
      const col = sql.match(/ADD COLUMN (\w+)/)?.[1]
      console.log(`  ⏭  Column already exists, skipping: ${col}`)
    } else {
      console.error(`  ❌ Failed: ${err?.message}`)
    }
  }
}

console.log('✅ Migration complete!')
process.exit(0)
