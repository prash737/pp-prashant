
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Enhanced connection pooling configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings
  max: 20,                // Maximum number of clients in the pool
  min: 2,                 // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
  acquireTimeoutMillis: 60000,    // Return an error after 60 seconds if a client cannot be acquired
  // Connection reliability
  allowExitOnIdle: true,  // Allow the pool to close all connections and exit
});

// Pool event listeners for monitoring
pool.on('connect', (client) => {
  console.log('🔗 New database connection established');
});

pool.on('error', (err, client) => {
  console.error('❌ Database pool error:', err);
});

pool.on('remove', () => {
  console.log('🔌 Database connection removed from pool');
});

export const db = drizzle(pool, { schema });

export type Database = typeof db;

// Graceful shutdown helper
export const closePool = async () => {
  await pool.end();
  console.log('🛑 Database pool closed');
};
