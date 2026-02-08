import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prismaInstance: PrismaClient | undefined

function getClient(): PrismaClient {
  if (prismaInstance) return prismaInstance
  
  // During build, if no DATABASE_URL, return a dummy client that throws on use
  if (!process.env.DATABASE_URL) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      // Return a proxy that throws when actually used during build
      return new Proxy({} as PrismaClient, {
        get() {
          throw new Error('DATABASE_URL not available during build')
        }
      })
    }
    throw new Error('DATABASE_URL environment variable is not set')
  }
  
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  prismaInstance = new PrismaClient({ adapter })
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance
  }
  
  return prismaInstance
}

// Export singleton - initialized on first access
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop: string | symbol) {
    const client = getClient()
    const value = client[prop as keyof PrismaClient]
    // Bind methods to preserve 'this' context
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})
