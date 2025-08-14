
#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';

interface ApiEndpoint {
  path: string;
  method: string;
  prismaQueries: string[];
  drizzleQueries: string[];
  status: 'pending' | 'migrated' | 'tested';
}

class ApiMigrator {
  private endpoints: ApiEndpoint[] = [];
  private logFile: string;

  constructor() {
    this.logFile = `api-migration-${Date.now()}.log`;
  }

  private async log(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    await fs.appendFile(path.join(__dirname, 'logs', this.logFile), logMessage);
  }

  async analyzeExistingApis() {
    await this.log('🔍 Analyzing existing API endpoints...');
    
    const apiDir = path.join(__dirname, '../app/api');
    const apiRoutes = await this.scanApiRoutes(apiDir);
    
    for (const route of apiRoutes) {
      const content = await fs.readFile(route, 'utf-8');
      const prismaQueries = this.extractPrismaQueries(content);
      
      if (prismaQueries.length > 0) {
        this.endpoints.push({
          path: route.replace(apiDir, ''),
          method: this.detectHttpMethod(content),
          prismaQueries,
          drizzleQueries: [],
          status: 'pending'
        });
      }
    }

    await this.log(`Found ${this.endpoints.length} API endpoints using Prisma`);
    return this.endpoints;
  }

  private async scanApiRoutes(dir: string): Promise<string[]> {
    const routes: string[] = [];
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        routes.push(...await this.scanApiRoutes(fullPath));
      } else if (item === 'route.ts') {
        routes.push(fullPath);
      }
    }
    
    return routes;
  }

  private extractPrismaQueries(content: string): string[] {
    const prismaMatches = content.match(/prisma\.[a-zA-Z]+\.[a-zA-Z]+\([^;]+\)/g) || [];
    return prismaMatches;
  }

  private detectHttpMethod(content: string): string {
    if (content.includes('export async function GET')) return 'GET';
    if (content.includes('export async function POST')) return 'POST';
    if (content.includes('export async function PUT')) return 'PUT';
    if (content.includes('export async function DELETE')) return 'DELETE';
    return 'UNKNOWN';
  }

  async generateDrizzleQueries() {
    await this.log('🔄 Converting Prisma queries to Drizzle...');
    
    const conversionMap = new Map([
      ['prisma.profile.findMany', 'db.select().from(profiles)'],
      ['prisma.profile.findUnique', 'db.select().from(profiles).where(eq(profiles.id, id))'],
      ['prisma.profile.create', 'db.insert(profiles).values(data)'],
      ['prisma.profile.update', 'db.update(profiles).set(data).where(eq(profiles.id, id))'],
      ['prisma.profile.delete', 'db.delete(profiles).where(eq(profiles.id, id))'],
      ['prisma.feedPost.findMany', 'db.select().from(feedPosts)'],
      ['prisma.feedPost.create', 'db.insert(feedPosts).values(data)'],
      ['prisma.connection.findMany', 'db.select().from(connections)'],
      ['prisma.studentProfile.findUnique', 'db.select().from(studentProfiles).where(eq(studentProfiles.id, id))']
    ]);

    for (const endpoint of this.endpoints) {
      endpoint.drizzleQueries = endpoint.prismaQueries.map(query => {
        for (const [prismaPattern, drizzleQuery] of conversionMap) {
          if (query.includes(prismaPattern.split('.').slice(0, 2).join('.'))) {
            return drizzleQuery;
          }
        }
        return `// TODO: Convert ${query}`;
      });
      endpoint.status = 'migrated';
    }

    await this.log('✅ Query conversion completed');
  }

  async generateMigrationReport() {
    await this.log('📊 Generating migration report...');
    
    const report = {
      summary: {
        totalEndpoints: this.endpoints.length,
        migratedEndpoints: this.endpoints.filter(e => e.status === 'migrated').length,
        pendingEndpoints: this.endpoints.filter(e => e.status === 'pending').length
      },
      endpoints: this.endpoints,
      generatedAt: new Date().toISOString()
    };

    const reportPath = path.join(__dirname, 'reports', `api-migration-report-${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    await this.log(`Report saved to: ${reportPath}`);
    return report;
  }
}

async function main() {
  const migrator = new ApiMigrator();
  
  await migrator.analyzeExistingApis();
  await migrator.generateDrizzleQueries();
  await migrator.generateMigrationReport();
  
  console.log('🎉 API migration analysis completed!');
}

if (require.main === module) {
  main().catch(console.error);
}

export { ApiMigrator };
