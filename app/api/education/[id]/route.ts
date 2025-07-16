
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

// Auth helper function
async function getAuthenticatedUser(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // First try authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (!error && user) {
      return { userId: user.id, user };
    }
  }

  // Fallback to cookies (same as other routes)
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;

  if (!accessToken) {
    throw new Error('No valid authentication found');
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    throw new Error('Invalid authentication token');
  }

  return { userId: user.id, user };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuthenticatedUser(request);
    const data = await request.json();
    const educationId = params.id;

    // Validate required fields
    if (!data.institutionName || !data.institutionTypeId) {
      return NextResponse.json(
        { error: 'Institution name and type are required' },
        { status: 400 }
      );
    }

    // Check if the education entry belongs to the authenticated user
    const existingEntry = await prisma.studentEducationHistory.findFirst({
      where: {
        id: educationId,
        studentId: userId
      }
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Education entry not found or access denied' },
        { status: 404 }
      );
    }

    const updatedEducation = await prisma.studentEducationHistory.update({
      where: { id: educationId },
      data: {
        institutionName: data.institutionName,
        institutionTypeId: parseInt(data.institutionTypeId),
        degreeProgram: data.degree || null,
        fieldOfStudy: data.fieldOfStudy || null,
        subjects: Array.isArray(data.subjects) ? data.subjects : [],
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isCurrent: Boolean(data.isCurrent),
        gradeLevel: data.grade || null,
        description: data.description || null
      },
    });

    return NextResponse.json(updatedEducation);
  } catch (error) {
    console.error('Error updating education record:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update education record' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuthenticatedUser(request);
    const educationId = params.id;

    // Check if the education entry belongs to the authenticated user
    const existingEntry = await prisma.studentEducationHistory.findFirst({
      where: {
        id: educationId,
        studentId: userId
      }
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Education entry not found or access denied' },
        { status: 404 }
      );
    }

    await prisma.studentEducationHistory.delete({
      where: { id: educationId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting education record:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete education record' },
      { status: 500 }
    );
  }
}
