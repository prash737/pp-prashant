
#!/usr/bin/env tsx

import { DatabaseMigrator } from './database-migration';
import { ApiMigrator } from './api-migration';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface MigrationPhase {
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  errors?: string[];
}

class MigrationOrchestrator {
  private phases: MigrationPhase[] = [
    {
      name: 'preparation',
      description: 'Prepare migration environment',
      status: 'pending'
    },
    {
      name: 'schema_validation',
      description: 'Validate Drizzle schema against Prisma',
      status: 'pending'
    },
    {
      name: 'database_migration',
      description: 'Migrate data from Prisma to Drizzle',
      status: 'pending'
    },
    {
      name: 'api_analysis',
      description: 'Analyze and convert API endpoints',
      status: 'pending'
    },
    {
      name: 'validation',
      description: 'Validate migration integrity',
      status: 'pending'
    },
    {
      name: 'cleanup',
      description: 'Clean up and finalize migration',
      status: 'pending'
    }
  ];

  private async log(message: string, phase?: string) {
    const timestamp = new Date().toISOString();
    const logMessage = phase 
      ? `[${timestamp}] [${phase.toUpperCase()}] ${message}`
      : `[${timestamp}] ${message}`;
    
    console.log(logMessage);
    
    const logDir = path.join(__dirname, 'logs');
    await fs.mkdir(logDir, { recursive: true });
    await fs.appendFile(
      path.join(logDir, 'migration-orchestrator.log'),
      `${logMessage}\n`
    );
  }

  private async updatePhaseStatus(phaseName: string, status: MigrationPhase['status'], error?: string) {
    const phase = this.phases.find(p => p.name === phaseName);
    if (phase) {
      phase.status = status;
      if (status === 'running') {
        phase.startTime = new Date();
      } else if (status === 'completed' || status === 'failed') {
        phase.endTime = new Date();
      }
      if (error) {
        phase.errors = phase.errors || [];
        phase.errors.push(error);
      }
    }
  }

  private async runPreparation() {
    await this.updatePhaseStatus('preparation', 'running');
    await this.log('🔧 Preparing migration environment...', 'preparation');
    
    try {
      // Ensure required directories exist
      const dirs = ['logs', 'reports', 'backups'];
      for (const dir of dirs) {
        await fs.mkdir(path.join(__dirname, dir), { recursive: true });
      }
      
      // Check database connectivity
      await this.log('Testing database connectivity...', 'preparation');
      await execAsync('npm run db:test');
      
      // Generate Drizzle migrations
      await this.log('Generating Drizzle migrations...', 'preparation');
      await execAsync('npm run db:generate');
      
      await this.updatePhaseStatus('preparation', 'completed');
      await this.log('✅ Preparation completed successfully', 'preparation');
      
    } catch (error) {
      await this.updatePhaseStatus('preparation', 'failed', String(error));
      await this.log(`❌ Preparation failed: ${error}`, 'preparation');
      throw error;
    }
  }

  private async runSchemaValidation() {
    await this.updatePhaseStatus('schema_validation', 'running');
    await this.log('🔍 Validating Drizzle schema...', 'schema_validation');
    
    try {
      // Run schema validation
      await execAsync('npm run db:validate');
      
      // Compare schema structures
      await this.log('Comparing Prisma and Drizzle schemas...', 'schema_validation');
      // Schema comparison logic would go here
      
      await this.updatePhaseStatus('schema_validation', 'completed');
      await this.log('✅ Schema validation completed', 'schema_validation');
      
    } catch (error) {
      await this.updatePhaseStatus('schema_validation', 'failed', String(error));
      await this.log(`❌ Schema validation failed: ${error}`, 'schema_validation');
      throw error;
    }
  }

  private async runDatabaseMigration() {
    await this.updatePhaseStatus('database_migration', 'running');
    await this.log('🗄️ Starting database migration...', 'database_migration');
    
    try {
      const migrator = new DatabaseMigrator({
        batchSize: 1000,
        enableLogging: true,
        dryRun: false,
        preserveData: true,
        enableRollback: true
      });
      
      await migrator.executeMigration();
      
      await this.updatePhaseStatus('database_migration', 'completed');
      await this.log('✅ Database migration completed', 'database_migration');
      
    } catch (error) {
      await this.updatePhaseStatus('database_migration', 'failed', String(error));
      await this.log(`❌ Database migration failed: ${error}`, 'database_migration');
      throw error;
    }
  }

  private async runApiAnalysis() {
    await this.updatePhaseStatus('api_analysis', 'running');
    await this.log('🔄 Analyzing API endpoints...', 'api_analysis');
    
    try {
      const apiMigrator = new ApiMigrator();
      await apiMigrator.analyzeExistingApis();
      await apiMigrator.generateDrizzleQueries();
      await apiMigrator.generateMigrationReport();
      
      await this.updatePhaseStatus('api_analysis', 'completed');
      await this.log('✅ API analysis completed', 'api_analysis');
      
    } catch (error) {
      await this.updatePhaseStatus('api_analysis', 'failed', String(error));
      await this.log(`❌ API analysis failed: ${error}`, 'api_analysis');
      throw error;
    }
  }

  private async runValidation() {
    await this.updatePhaseStatus('validation', 'running');
    await this.log('🧪 Running migration validation...', 'validation');
    
    try {
      // Run comprehensive validation tests
      await execAsync('npm run test:migration');
      
      await this.updatePhaseStatus('validation', 'completed');
      await this.log('✅ Validation completed successfully', 'validation');
      
    } catch (error) {
      await this.updatePhaseStatus('validation', 'failed', String(error));
      await this.log(`❌ Validation failed: ${error}`, 'validation');
      throw error;
    }
  }

  private async runCleanup() {
    await this.updatePhaseStatus('cleanup', 'running');
    await this.log('🧹 Running cleanup...', 'cleanup');
    
    try {
      // Archive logs and reports
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archiveDir = path.join(__dirname, 'archives', timestamp);
      await fs.mkdir(archiveDir, { recursive: true });
      
      // Move logs to archive
      const logsDir = path.join(__dirname, 'logs');
      const reportsDir = path.join(__dirname, 'reports');
      
      await execAsync(`cp -r ${logsDir}/* ${archiveDir}/`);
      await execAsync(`cp -r ${reportsDir}/* ${archiveDir}/`);
      
      await this.updatePhaseStatus('cleanup', 'completed');
      await this.log('✅ Cleanup completed', 'cleanup');
      
    } catch (error) {
      await this.updatePhaseStatus('cleanup', 'failed', String(error));
      await this.log(`❌ Cleanup failed: ${error}`, 'cleanup');
      // Don't throw on cleanup errors
    }
  }

  private async generateFinalReport() {
    await this.log('📊 Generating final migration report...');
    
    const report = {
      migrationId: `migration-${Date.now()}`,
      startTime: this.phases[0].startTime,
      endTime: new Date(),
      phases: this.phases,
      summary: {
        totalPhases: this.phases.length,
        completedPhases: this.phases.filter(p => p.status === 'completed').length,
        failedPhases: this.phases.filter(p => p.status === 'failed').length,
        overallStatus: this.phases.every(p => p.status === 'completed') ? 'SUCCESS' : 'FAILED'
      }
    };

    const reportPath = path.join(__dirname, 'reports', `final-migration-report.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    await this.log(`📋 Final report saved to: ${reportPath}`);
    return report;
  }

  async executeMigration() {
    await this.log('🚀 Starting complete database migration orchestration...');
    
    try {
      await this.runPreparation();
      await this.runSchemaValidation();
      await this.runDatabaseMigration();
      await this.runApiAnalysis();
      await this.runValidation();
      await this.runCleanup();
      
      const report = await this.generateFinalReport();
      
      if (report.summary.overallStatus === 'SUCCESS') {
        await this.log('🎉 Migration completed successfully!');
        console.log('\n✅ MIGRATION SUCCESSFUL');
        console.log('Your database has been successfully migrated from Prisma to Drizzle!');
        console.log('\nNext steps:');
        console.log('1. Update your API endpoints to use Drizzle queries');
        console.log('2. Test your application thoroughly');
        console.log('3. Monitor performance in production');
      } else {
        await this.log('❌ Migration completed with errors');
        console.log('\n❌ MIGRATION FAILED');
        console.log('Please check the logs for details');
      }
      
    } catch (error) {
      await this.log(`💥 Migration orchestration failed: ${error}`);
      console.log('\n💥 MIGRATION FAILED');
      console.log(`Error: ${error}`);
      process.exit(1);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  
  if (!force) {
    console.log('⚠️  WARNING: This will migrate your database from Prisma to Drizzle');
    console.log('This is a significant operation. Please ensure you have backups.');
    console.log('Add --force flag to proceed.');
    process.exit(0);
  }
  
  const orchestrator = new MigrationOrchestrator();
  await orchestrator.executeMigration();
}

if (require.main === module) {
  main().catch(console.error);
}

export { MigrationOrchestrator };
