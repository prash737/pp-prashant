import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  let prismaConnected = false

  // Check Prisma connection
  try {
    // Test query to check connection
    await prisma.profile.count()
    prismaConnected = true
  } catch (error) {
    console.error('Prisma connection failed:', error)
    // Add more detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
  }

  return NextResponse.json({
    prismaConnected,
    timestamp: new Date().toISOString()
  })
}