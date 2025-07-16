
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"

const OPENAI_API_KEY = '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'

export async function POST(request: NextRequest) {
  try {
    console.log('🏛️ Institution self-analysis API request received')

    // Get auth token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      console.error('Auth error:', error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query, institutionData } = await request.json()

    if (!query || !institutionData) {
      return NextResponse.json({ error: 'Missing query or institution data' }, { status: 400 })
    }

    console.log('🔍 Processing institution analysis for user:', user.id)
    console.log('📝 Query:', query)

    // Create optimized AI prompt for institutions
    const systemPrompt = `You are an expert educational consultant specializing in institutional development and student attraction strategies. Provide concise, actionable insights for educational institutions to improve their student enrollment and institutional reputation.

FORMATTING: Use ## for sections, ### for subsections, **bold** for emphasis, numbered lists for action steps.

Guidelines: Be specific, strategic, and provide clear implementation steps. Focus on student attraction, program enhancement, marketing strategies, and competitive positioning. Keep responses focused and under 1500 words.`

    // Create a more concise institution profile summary
    const profileSummary = createOptimizedInstitutionSummary(institutionData)

    const userPrompt = `Institution Profile: ${profileSummary}

Question: "${query}"

Provide analysis with: Current strengths, student attraction opportunities, program enhancement suggestions, marketing strategies, competitive positioning, and actionable next steps.`

    // Call OpenAI API with optimized settings
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.5,
        stream: false
      }),
    })

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', await openaiResponse.text())
      throw new Error('Failed to get AI analysis')
    }

    const aiResult = await openaiResponse.json()
    const analysis = aiResult.choices[0]?.message?.content

    if (!analysis) {
      throw new Error('No analysis received from AI')
    }

    console.log('✅ Institution analysis completed successfully')

    return NextResponse.json({ 
      analysis,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Institution self-analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze institution profile' },
      { status: 500 }
    )
  }
}

// Helper function to create optimized institution profile summary
function createOptimizedInstitutionSummary(institutionData: any): string {
  const profile = institutionData.profile || {}
  const programs = institutionData.programs || []
  const faculty = institutionData.faculty || []
  const facilities = institutionData.facilities || []
  const events = institutionData.events || []
  const followers = institutionData.followers || 0

  let summary = `Institution: ${profile.institutionName || 'Institution'} (${profile.institutionType || 'Educational Institution'})`
  
  if (profile.description) {
    summary += `\nDescription: ${profile.description}`
  }
  
  if (profile.website) {
    summary += `\nWebsite: ${profile.website}`
  }
  
  if (profile.verified) {
    summary += `\nVerification Status: Verified Institution`
  }
  
  summary += `\nStudent Followers: ${followers}`

  // Add programs information
  if (programs.length > 0) {
    const programNames = programs.slice(0, 10).map((p: any) => p.name || p.title).filter(Boolean)
    if (programNames.length > 0) {
      summary += `\nPrograms (${programs.length}): ${programNames.join(', ')}`
      if (programs.length > 10) summary += ` and ${programs.length - 10} more`
    }
  } else {
    summary += `\nPrograms: No programs listed`
  }

  // Add faculty information
  if (faculty.length > 0) {
    const facultyInfo = faculty.slice(0, 5).map((f: any) => `${f.name} (${f.designation})`).filter(Boolean)
    if (facultyInfo.length > 0) {
      summary += `\nFaculty (${faculty.length}): ${facultyInfo.join(', ')}`
      if (faculty.length > 5) summary += ` and ${faculty.length - 5} more`
    }
  } else {
    summary += `\nFaculty: No faculty members listed`
  }

  // Add facilities information
  if (facilities.length > 0) {
    const facilityNames = facilities.slice(0, 5).map((f: any) => f.name || f.title).filter(Boolean)
    if (facilityNames.length > 0) {
      summary += `\nFacilities (${facilities.length}): ${facilityNames.join(', ')}`
      if (facilities.length > 5) summary += ` and ${facilities.length - 5} more`
    }
  } else {
    summary += `\nFacilities: No facilities listed`
  }

  // Add events information
  if (events.length > 0) {
    const eventNames = events.slice(0, 3).map((e: any) => e.name || e.title).filter(Boolean)
    if (eventNames.length > 0) {
      summary += `\nRecent Events (${events.length}): ${eventNames.join(', ')}`
      if (events.length > 3) summary += ` and ${events.length - 3} more`
    }
  } else {
    summary += `\nEvents: No events listed`
  }

  return summary
}
