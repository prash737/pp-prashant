
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create connection with pooling and timeout configurations
const client = postgres(process.env.DATABASE_URL, {
  // Connection pool settings
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Close connections after 20 seconds of inactivity
  connect_timeout: 10, // Connection timeout in seconds
  
  // Query settings
  statement_timeout: 30000, // 30 second query timeout
  query_timeout: 25000, // 25 second query timeout
  
  // Retry settings
  max_lifetime: 60 * 30, // 30 minutes max connection lifetime
  
  // Performance settings
  prepare: false, // Disable prepared statements for better compatibility
  
  // Connection debugging
  debug: process.env.NODE_ENV === 'development',
  
  // Handle connection errors gracefully
  onnotice: () => {}, // Suppress notices in production
})

export const db = drizzle(client)

// Health check function
export async function checkDatabaseConnection() {
  try {
    await client`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection check failed:', error)
    return false
  }
}
