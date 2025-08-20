
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Configure postgres client with proper settings for Supabase
const client = postgres(process.env.DATABASE_URL, {
  max: 1, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  ssl: 'require', // Force SSL for Supabase
  prepare: false, // Disable prepared statements for serverless
})

export const db = drizzle(client)
