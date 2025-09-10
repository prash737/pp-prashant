
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Auth helper function
async function getAuthenticatedUser(request: NextRequest) {
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
    const { data: existingEntry, error: checkError } = await supabase
      .from('student_education_history')
      .select('*')
      .eq('id', educationId)
      .eq('student_id', userId)
      .single()

    if (checkError || !existingEntry) {
      return NextResponse.json(
        { error: 'Education entry not found or access denied' },
        { status: 404 }
      );
    }

    // Update the education entry using Supabase
    const { data: updatedEducation, error: updateError } = await supabase
      .from('student_education_history')
      .update({
        institution_name: data.institutionName,
        institution_type_id: parseInt(data.institutionTypeId),
        degree_program: data.degree || null,
        field_of_study: data.fieldOfStudy || null,
        subjects: Array.isArray(data.subjects) ? data.subjects : [],
        start_date: data.startDate ? new Date(data.startDate) : null,
        end_date: data.endDate ? new Date(data.endDate) : null,
        is_current: Boolean(data.isCurrent),
        grade_level: data.grade || null,
        description: data.description || null,
        updated_at: new Date()
      })
      .eq('id', educationId)
      .eq('student_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating education record:', updateError)
      return NextResponse.json(
        { error: updateError.message || 'Failed to update education record' },
        { status: 500 }
      );
    }

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
    const { data: existingEntry, error: checkError } = await supabase
      .from('student_education_history')
      .select('*')
      .eq('id', educationId)
      .eq('student_id', userId)
      .single()

    if (checkError || !existingEntry) {
      return NextResponse.json(
        { error: 'Education entry not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the education entry using Supabase
    const { error: deleteError } = await supabase
      .from('student_education_history')
      .delete()
      .eq('id', educationId)
      .eq('student_id', userId)

    if (deleteError) {
      console.error('Error deleting education record:', deleteError)
      return NextResponse.json(
        { error: deleteError.message || 'Failed to delete education record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting education record:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete education record' },
      { status: 500 }
    );
  }
}
