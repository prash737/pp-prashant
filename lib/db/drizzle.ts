import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

// Create the postgres client with optimized connection pooling
const client = postgres(process.env.DATABASE_URL, {
  max: 5,                    // Reduce max connections to prevent timeout
  idle_timeout: 60,          // Keep connections alive longer
  connect_timeout: 30,       // Increase connection timeout
  max_lifetime: 600,         // Connection max lifetime (10 minutes)
  prepare: false,            // Disable prepared statements for better compatibility
  transform: postgres.camel  // Convert to camelCase
})

// Create the drizzle instance
export const db = drizzle(client)

export type Database = typeof db;

// Graceful shutdown helper
export const closePool = async () => {
  await client.end();
  console.log('🛑 Database pool closed');
};