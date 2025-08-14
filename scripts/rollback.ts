
#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

class MigrationRollback {
  private db: ReturnType<typeof drizzle>;
  private logFile: string;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10
    });
    this.db = drizzle(pool);
    this.logFile = `rollback-${Date.now()}.log`;
  }

  private async log(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    await fs.appendFile(path.join(__dirname, 'logs', this.logFile), logMessage);
  }

  async executeRollback() {
    await this.log('🔄 Starting migration rollback...');
    
    try {
      // Check if backup tables exist
      const backupTables = [
        'backup_profiles',
        'backup_feed_posts',
        'backup_connections',
        'backup_student_profiles',
        'backup_institution_profiles'
      ];

      for (const table of backupTables) {
        const exists = await this.db.execute(sql.raw(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = '${table}'
          );
        `));
        
        if (!exists[0]?.exists) {
          throw new Error(`Backup table ${table} not found`);
        }
      }

      await this.log('✅ All backup tables found');

      // Restore from backups
      await this.log('Restoring data from backups...');
      
      const restoreQueries = [
        'TRUNCATE profiles CASCADE;',
        'INSERT INTO profiles SELECT * FROM backup_profiles;',
        'TRUNCATE feed_posts CASCADE;',
        'INSERT INTO feed_posts SELECT * FROM backup_feed_posts;',
        'TRUNCATE connections CASCADE;',
        'INSERT INTO connections SELECT * FROM backup_connections;',
        'TRUNCATE student_profiles CASCADE;',
        'INSERT INTO student_profiles SELECT * FROM backup_student_profiles;',
        'TRUNCATE institution_profiles CASCADE;',
        'INSERT INTO institution_profiles SELECT * FROM backup_institution_profiles;'
      ];

      for (const query of restoreQueries) {
        await this.db.execute(sql.raw(query));
      }

      await this.log('✅ Data restoration completed');

      // Clean up backup tables
      await this.log('Cleaning up backup tables...');
      for (const table of backupTables) {
        await this.db.execute(sql.raw(`DROP TABLE ${table};`));
      }

      await this.log('🎉 Rollback completed successfully!');
      
    } catch (error) {
      await this.log(`❌ Rollback failed: ${error}`);
      throw error;
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const confirm = args.includes('--confirm');
  
  if (!confirm) {
    console.log('⚠️  WARNING: This will rollback your database migration');
    console.log('All migrated data will be replaced with backup data.');
    console.log('Add --confirm flag to proceed.');
    process.exit(0);
  }
  
  const rollback = new MigrationRollback();
  await rollback.executeRollback();
}

if (require.main === module) {
  main().catch(console.error);
}

export { MigrationRollback };
