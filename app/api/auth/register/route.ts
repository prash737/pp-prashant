import { NextRequest, NextResponse } from 'next/server'
import { registerStudent, registerMentor, registerInstitution } from '@/lib/services/auth-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { role, institutionData, ...userData } = body

    let result

    switch (role) {
      case 'student':
        result = await registerStudent(userData)
        break
      case 'mentor':
        result = await registerMentor(userData)
        break
      case 'institution':
        result = await registerInstitution({ ...userData, institutionData })
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid role specified' },
          { status: 400 }
        )
    }

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Registration API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}