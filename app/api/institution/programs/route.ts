
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get user from auth
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch programs for the institution
    const programs = await prisma.institutionProgram.findMany({
      where: { institutionId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ programs })
  } catch (error) {
    console.error('Error fetching institution programs:', error)
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from auth
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { programs } = body

    // Delete existing programs for this institution
    await prisma.institutionProgram.deleteMany({
      where: { institutionId: user.id }
    })

    // Create new programs
    if (programs && programs.length > 0) {
      const programsToCreate = programs.map((program: any) => ({
        institutionId: user.id,
        name: program.name,
        type: program.type === 'other' ? program.typeCustom : program.type,
        level: program.level === 'custom' ? program.levelCustom : program.level,
        durationValue: parseInt(program.duration) || 0,
        durationType: program.durationType === 'custom' ? program.durationCustom : program.durationType,
        description: program.description,
        eligibility: program.eligibility || null,
        learningOutcomes: program.outcomes || null,
      }))

      await prisma.institutionProgram.createMany({
        data: programsToCreate
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving institution programs:', error)
    return NextResponse.json({ error: 'Failed to save programs' }, { status: 500 })
  }
}
