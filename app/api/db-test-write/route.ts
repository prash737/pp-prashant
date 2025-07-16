
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // First check if we can read from the database
    const profileCount = await prisma.profile.count();
    console.log("Current profile count:", profileCount);
    
    // Generate a unique ID for test purposes
    const testId = `test-${Date.now()}`;
    
    // Check for existing test profile to avoid duplicates
    const existingTestProfile = await prisma.profile.findFirst({
      where: {
        firstName: { startsWith: 'Test-' }
      }
    });
    
    let testProfile;
    
    if (existingTestProfile) {
      // Update existing test profile
      testProfile = await prisma.profile.update({
        where: { id: existingTestProfile.id },
        data: {
          firstName: `Test-${testId}`,
          lastName: 'User',
          updatedAt: new Date()
        }
      });
      console.log("Updated test profile:", testProfile.id);
    } else {
      // Don't actually create a new profile in the database to avoid pollution
      testProfile = {
        id: testId,
        firstName: `Test-${testId}`,
        lastName: 'User',
        message: 'This is a simulated profile (not saved to database)'
      };
    }
    
    return NextResponse.json({
      success: true,
      profileCount,
      testProfile,
      message: 'Database test completed successfully'
    });
  } catch (error) {
    console.error('Database write test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to write to database'
    }, { status: 500 });
  }
}
