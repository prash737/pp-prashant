import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

// Create the postgres client with highly optimized connection pooling
const client = postgres(process.env.DATABASE_URL, {
  max: 20,                   // Increase max connections for better performance
  idle_timeout: 20,          // Faster cleanup of idle connections
  connect_timeout: 10,       // Reduce connection timeout for faster fails
  max_lifetime: 1800,        // 30 minutes connection lifetime
  prepare: true,             // Enable prepared statements for performance
  transform: postgres.camel, // Convert to camelCase
  connection: {
    application_name: 'pathpiper_app'
  }
})

// Create the drizzle instance
export const db = drizzle(client)

export type Database = typeof db;

// Graceful shutdown helper
export const closePool = async () => {
  await client.end();
  console.log('🛑 Database pool closed');
};