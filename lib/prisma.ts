import { PrismaClient } from '@prisma/client'
import 'server-only'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Query logging disabled to reduce console noise
// if (process.env.NODE_ENV === 'development') {
//   prisma.$use(async (params, next) => {
//     const before = Date.now()
//     const result = await next(params)
//     const after = Date.now()
//     console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)
//     return result
//   })
// }