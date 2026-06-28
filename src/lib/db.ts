import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || ''

  // Use Turso/libsql adapter for cloud (production on Vercel)
  if (databaseUrl.startsWith('libsql://') || databaseUrl.startsWith('wss://')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createClient } = require('@libsql/client') as typeof import('@libsql/client')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaLibSQL } = require('@prisma/adapter-libsql') as typeof import('@prisma/adapter-libsql')

    const libsql = createClient({
      url: databaseUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })

    const adapter = new PrismaLibSQL(libsql)
    // @ts-expect-error adapter preview feature
    return new PrismaClient({ adapter })
  }

  // Local development — plain SQLite
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
