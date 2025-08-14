
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {
      drizzle: { status: 'pending', timing: 0, error: null },
      prisma: { status: 'pending', timing: 0, error: null }
    }
  }

  // Test Drizzle connection
  try {
    const drizzleStart = Date.now()
    const { db } = await import('@/lib/db/drizzle')
    const { profiles } = await import('@/lib/db/schema')
    
    await Promise.race([
      db.select({ count: profiles.id }).from(profiles).limit(1),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Drizzle timeout after 5s')), 5000)
      )
    ])
    
    results.tests.drizzle.timing = Date.now() - drizzleStart
    results.tests.drizzle.status = 'success'
  } catch (error) {
    results.tests.drizzle.status = 'failed'
    results.tests.drizzle.error = error instanceof Error ? error.message : String(error)
  }

  // Test Prisma connection
  try {
    const prismaStart = Date.now()
    const { prisma } = await import('@/lib/prisma')
    
    await Promise.race([
      prisma.profile.count(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Prisma timeout after 5s')), 5000)
      )
    ])
    
    results.tests.prisma.timing = Date.now() - prismaStart
    results.tests.prisma.status = 'success'
  } catch (error) {
    results.tests.prisma.status = 'failed'
    results.tests.prisma.error = error instanceof Error ? error.message : String(error)
  }

  console.log('🔍 Database Connection Test Results:', results)

  return NextResponse.json({
    success: true,
    results,
    recommendation: results.tests.drizzle.status === 'failed' 
      ? 'Consider using Prisma fallback or fixing Drizzle connection configuration'
      : 'All connections working normally'
  })
}
