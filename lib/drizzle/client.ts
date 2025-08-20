import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

// Enhanced connection configuration with pooling and timeouts
const client = postgres(process.env.DATABASE_URL, {
  max: 10, // Maximum connections in pool
  idle_timeout: 20, // Close idle connections after 20s
  connect_timeout: 10, // Connection timeout in seconds
  prepare: false, // Disable prepared statements for compatibility
  onnotice: () => {}, // Suppress notices
  transform: {
    undefined: null
  }
})

export const db = drizzle(client, { schema })

// Utility function to execute queries with retry logic
export async function executeWithRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn()
    } catch (error) {
      lastError = error as Error

      // Check if it's a connection timeout
      if (error && typeof error === 'object' && 'code' in error &&
          (error.code === 'CONNECT_TIMEOUT' || error.code === 'CONNECTION_CLOSED')) {

        if (attempt < maxRetries) {
          console.log(`🔄 DB connection attempt ${attempt} failed, retrying in ${delayMs}ms...`)
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
          continue
        }
      }

      // If it's not a connection error or we've exhausted retries, throw immediately
      throw error
    }
  }

  throw lastError!
}