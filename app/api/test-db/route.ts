
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Simple query to test database connection
    const count = await prisma.profile.count()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      count 
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Database connection failed',
        error: (error as Error).message 
      },
      { status: 500 }
    )
  }
}
