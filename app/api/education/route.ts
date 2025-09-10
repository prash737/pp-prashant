
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching education history')

    // Get user from session
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      console.log('❌ No access token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      console.log('❌ Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch education history using direct Supabase query with joins
    const { data: educationHistory, error: queryError } = await supabase
      .from('student_education_history')
      .select(`
        id,
        student_id,
        institution_id,
        institution_name,
        institution_type_id,
        degree_program,
        field_of_study,
        subjects,
        start_date,
        end_date,
        is_current,
        grade_level,
        description,
        institution_verified,
        created_at,
        updated_at,
        institution_types!inner (
          id,
          name,
          slug,
          institution_categories!inner (
            id,
            name,
            slug,
            description
          )
        )
      `)
      .eq('student_id', user.id)
      .order('start_date', { ascending: false })

    if (queryError) {
      console.error('Supabase query error:', queryError)
      return NextResponse.json({ error: 'Failed to fetch education history' }, { status: 500 })
    }

    // Debug log verification status for each education record
    educationHistory?.forEach(edu => {
      console.log('🔍 RAW Education DB record in API route:', JSON.stringify(edu, null, 2));
      console.log('🔍 Education API verification status:', {
        institution: edu.institution_name,
        institutionVerified: edu.institution_verified,
        type: typeof edu.institution_verified,
        hasProperty: Object.prototype.hasOwnProperty.call(edu, 'institution_verified'),
        allKeys: Object.keys(edu)
      });
    });

    // Transform database fields to match the frontend interface
    const transformedEducation = (educationHistory || []).map(entry => {
      console.log('🔍 API Transform - Raw entry institutionVerified:', entry.institution_verified, 'type:', typeof entry.institution_verified);
      
      return {
        id: entry.id,
        institutionId: entry.institution_id || '',
        institutionName: entry.institution_name,
        institutionCategory: entry.institution_types?.institution_categories?.slug || '',
        institutionType: entry.institution_type_id ? entry.institution_type_id.toString() : '',
        institutionTypeName: entry.institution_types?.name || '', // Add the type name
        institutionVerified: entry.institution_verified, // Make sure this is included
        degree: entry.degree_program || '',
        fieldOfStudy: entry.field_of_study || '',
        subjects: Array.isArray(entry.subjects) ? entry.subjects : [],
        startDate: entry.start_date ? new Date(entry.start_date).toISOString().split('T')[0] : '',
        endDate: entry.end_date ? new Date(entry.end_date).toISOString().split('T')[0] : '',
        isCurrent: entry.is_current || false,
        grade: entry.grade_level || '',
        description: entry.description || ''
      }
    })

    return NextResponse.json({ education: transformedEducation })
  } catch (error) {
    console.error('Error in GET /api/education:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating education record')

    // Get user from session using cookies (same as GET method)
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      console.log('❌ No access token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      console.log('❌ Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const data = await request.json();

    // Check if this is a batch save or single entry
    if (data.education && Array.isArray(data.education)) {
      // Batch save - for compatibility with existing code
      const savedEntries = [];
      for (const entry of data.education) {
        if (!entry.institutionName || !entry.institutionType) continue;
        
        // Skip entries that already have an ID (already exist in database)
        if (entry.id) {
          console.log('Skipping existing education entry with ID:', entry.id);
          continue;
        }
        
        const { data: educationRecord, error: insertError } = await supabase
          .from('student_education_history')
          .insert({
            student_id: userId,
            institution_id: entry.institutionId || null,
            institution_name: entry.institutionName,
            institution_type_id: parseInt(entry.institutionType),
            degree_program: entry.degree || null,
            field_of_study: entry.fieldOfStudy || null,
            subjects: Array.isArray(entry.subjects) ? entry.subjects : [],
            start_date: entry.startDate ? new Date(entry.startDate) : null,
            end_date: entry.endDate ? new Date(entry.endDate) : null,
            is_current: Boolean(entry.isCurrent),
            grade_level: entry.grade || null,
            description: entry.description || null,
            institution_verified: entry.institutionId ? null : undefined // null if institution selected, undefined if manual entry
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error inserting education record:', insertError)
          continue
        }

        savedEntries.push(educationRecord);
      }
      return NextResponse.json({ education: savedEntries });
    } else {
      // Single entry save
      // Validate required fields
      if (!data.institutionName || !data.institutionTypeId) {
        return NextResponse.json(
          { error: 'Institution name and type are required' },
          { status: 400 }
        );
      }

      const { data: educationRecord, error: insertError } = await supabase
        .from('student_education_history')
        .insert({
          student_id: userId,
          institution_id: data.institutionId || null,
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
          institution_verified: data.institutionId ? null : undefined // null if institution selected, undefined if manual entry
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting education record:', insertError)
        return NextResponse.json(
          { error: insertError.message || 'Failed to create education record' },
          { status: 500 }
        );
      }

      return NextResponse.json(educationRecord);
    }
  } catch (error) {
    console.error('Error creating education record:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create education record' },
      { status: 500 }
    );
  }
}
