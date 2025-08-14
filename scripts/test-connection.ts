
#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import * as schema from '../lib/db/schema';

async function testConnection() {
  console.log('🔌 Testing database connection...');
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1
    });
    
    const db = drizzle(pool, { schema });
    
    // Test basic connection
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Database connection successful');
    
    // Test schema access
    await db.execute(sql`SELECT count(*) FROM profiles LIMIT 1`);
    console.log('✅ Schema access successful');
    
    await pool.end();
    console.log('✅ Connection test completed successfully');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  }
}

testConnection();
