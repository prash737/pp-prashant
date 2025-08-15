import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Self-analysis API request received')

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

    const { query, studentData } = await request.json()

    if (!query || !studentData) {
      return NextResponse.json({ error: 'Missing query or student data' }, { status: 400 })
    }

    console.log('🔍 Processing analysis for user:', user.id)
    console.log('📝 Query:', query)

    // Create optimized AI prompt
    const systemPrompt = `You are an expert educational counselor for PathPiper, a student networking and profile platform. Provide concise, actionable insights based on student profiles with ALL recommendations specifically tailored to PathPiper platform features.

FORMATTING: Use **bold** for emphasis, numbered lists for steps. DO NOT use hashtags (#) or markdown headers.

PATHPIPER PLATFORM FEATURES TO REFERENCE:
- Student profile building (skills, interests, education history, goals)
- Networking with students, mentors, and institutions
- Following institutions and their programs
- Joining circles (study groups/communities)
- Achievement tracking and showcasing
- Self-analysis for continuous improvement
- Connection requests and messaging
- Institutional verification and programs

Guidelines: Be specific, encouraging, and provide clear next steps using PathPiper features. Every recommendation must include specific PathPiper actions. Keep responses focused and under 1500 words.`

    // Create a more concise profile summary
    const profileSummary = createOptimizedProfileSummary(studentData)

    const userPrompt = `PathPiper Student Profile: ${profileSummary}

Question: "${query}"

Provide PathPiper-specific analysis with: Key insights about their PathPiper profile, strengths they can showcase on PathPiper, improvement areas using PathPiper features, specific recommendations for using PathPiper tools, and next steps within the PathPiper platform.

Remember: Every suggestion must be actionable within PathPiper - if suggesting networking, mention using PathPiper's search and connect features; if suggesting skill building, reference PathPiper's skills tracking; if mentioning institutions, reference PathPiper's institution following feature, etc.`

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
        max_tokens: 1500, // Reduced from 2000
        temperature: 0.5, // Reduced for faster processing
        stream: false
      }),
    })

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', await openaiResponse.text())
      throw new Error('Failed to get AI analysis')
    }

    const aiResult = await openaiResponse.json()
    let analysis = aiResult.choices[0]?.message?.content

    if (!analysis) {
      throw new Error('No analysis received from AI')
    }

    // Remove hashtags from the response
    analysis = analysis.replace(/#+\s*/g, '')

    console.log('✅ Analysis completed successfully')

    return NextResponse.json({ 
      analysis,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Self-analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze profile' },
      { status: 500 }
    )
  }
}

function createOptimizedProfileSummary(studentData: any): string {
  const { profile, interests, skills, educationHistory, achievements, goals } = studentData

  let summary = `Student: ${profile?.firstName || ''} ${profile?.lastName || ''}\n`
  summary += `Bio: ${profile?.bio || 'None'}\n`
  summary += `Age Group: ${profile?.ageGroup || 'Unknown'}\n`
  summary += `Education Level: ${profile?.educationLevel || 'Unknown'}\n\n`

  // Condensed interests
  if (interests && interests.length > 0) {
    const interestNames = interests.slice(0, 10).map((i: any) => i.name || i.interest?.name).filter(Boolean)
    summary += `Interests (${interests.length}): ${interestNames.join(', ')}\n`
  } else {
    summary += `Interests: None listed\n`
  }

  // Condensed skills
  if (skills && skills.length > 0) {
    const skillsWithProficiency = skills.slice(0, 8).map((s: any) => {
      const name = s.name || s.skill?.name
      const prof = s.proficiencyLevel || s.proficiency_level || 'unknown'
      return `${name} (${prof}%)`
    }).filter((s: string) => s.includes('('))
    summary += `Skills (${skills.length}): ${skillsWithProficiency.join(', ')}\n`
  } else {
    summary += `Skills: None listed\n`
  }

  // Latest education only
  if (educationHistory && educationHistory.length > 0) {
    const latest = educationHistory[0]
    summary += `Current Education: ${latest.institutionName} - ${latest.degreeProgram}\n`
  } else {
    summary += `Education: None listed\n`
  }

  // Goals summary
  if (goals && goals.length > 0) {
    const goalTitles = goals.slice(0, 5).map((g: any) => g.title || g.goal).filter(Boolean)
    summary += `Goals (${goals.length}): ${goalTitles.join(', ')}\n`
  } else {
    summary += `Goals: None set\n`
  }

  // Recent achievements
  if (achievements && achievements.length > 0) {
    const achievementNames = achievements.slice(0, 3).map((a: any) => a.name || a.title).filter(Boolean)
    summary += `Recent Achievements: ${achievementNames.join(', ')}\n`
  }

  return summary
}

function createProfileSummary(studentData: any): string {
  return createOptimizedProfileSummary(studentData)
}

function calculateProfileCompleteness(studentData: any) {
  const { profile, interests, skills, educationHistory, achievements, goals } = studentData

  let score = 0
  let maxScore = 6
  const missingSections = []
  const strengths = []
  const improvements = []

  // Check each section
  if (profile?.firstName && profile?.lastName && profile?.bio) {
    score += 1
    strengths.push('Complete basic information')
  } else {
    missingSections.push('Basic Information')
    improvements.push('Complete your profile with name and bio')
  }

  if (interests && interests.length > 0) {
    score += 1
    strengths.push(`${interests.length} interests listed`)
  } else {
    missingSections.push('Interests')
    improvements.push('Add your interests and passions')
  }

  if (skills && skills.length > 0) {
    score += 1
    strengths.push(`${skills.length} skills documented`)
  } else {
    missingSections.push('Skills')
    improvements.push('Document your skills and abilities')
  }

  if (educationHistory && educationHistory.length > 0) {
    score += 1
    strengths.push('Education history provided')
  } else {
    missingSections.push('Education History')
    improvements.push('Add your educational background')
  }

  if (goals && goals.length > 0) {
    score += 1
    strengths.push(`${goals.length} goals set`)
  } else {
    missingSections.push('Goals')
    improvements.push('Define your career goals and aspirations')
  }

  if (achievements && achievements.length > 0) {
    score += 1
    strengths.push(`${achievements.length} achievements recorded`)
  } else {
    missingSections.push('Achievements')
    improvements.push('Document your accomplishments and achievements')
  }

  const percentage = Math.round((score / maxScore) * 100)

  return {
    percentage,
    missingSections,
    strengths: strengths.length > 0 ? strengths : ['Profile created'],
    improvements: improvements.length > 0 ? improvements : ['Continue building your profile']
  }
}