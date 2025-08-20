import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/drizzle/client'
import { profiles, studentProfiles, userInterests, interests, interestCategories, userSkills, skills, skillCategories, userAchievements, suggestedGoals } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'

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

    // Get user profile and student data using Drizzle
    console.log('🔍 Drizzle Query: Fetching user profile for:', user.id)
    const profileData = await db.select({
      id: profiles.id,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
      email: profiles.email,
      role: profiles.role,
      bio: profiles.bio,
      location: profiles.location,
      profileImageUrl: profiles.profileImageUrl,
      verificationStatus: profiles.verificationStatus,
      availabilityStatus: profiles.availabilityStatus,
      createdAt: profiles.createdAt,
      updatedAt: profiles.updatedAt,
      ageGroup: studentProfiles.ageGroup,
      educationLevel: studentProfiles.educationLevel,
      birthMonth: studentProfiles.birthMonth,
      birthYear: studentProfiles.birthYear,
      personalityType: studentProfiles.personalityType,
      learningStyle: studentProfiles.learningStyle,
      favoriteQuote: studentProfiles.favoriteQuote,
      onboardingCompleted: studentProfiles.onboardingCompleted
    }).from(profiles)
      .leftJoin(studentProfiles, eq(profiles.id, studentProfiles.id))
      .where(eq(profiles.id, user.id))
      .limit(1)

    if (!profileData.length) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const profile = profileData[0]

    // Get user interests with categories
    console.log('🔍 Drizzle Query: Fetching user interests')
    const userInterestsData = await db.select({
      interestId: userInterests.interestId,
      interestName: interests.name,
      categoryName: interestCategories.name
    }).from(userInterests)
      .leftJoin(interests, eq(userInterests.interestId, interests.id))
      .leftJoin(interestCategories, eq(interests.categoryId, interestCategories.id))
      .where(eq(userInterests.userId, user.id))

    // Get user skills with categories
    console.log('🔍 Drizzle Query: Fetching user skills')
    const userSkillsData = await db.select({
      skillId: userSkills.skillId,
      skillName: skills.name,
      proficiencyLevel: userSkills.proficiencyLevel,
      categoryName: skillCategories.name
    }).from(userSkills)
      .leftJoin(skills, eq(userSkills.skillId, skills.id))
      .leftJoin(skillCategories, eq(skills.categoryId, skillCategories.id))
      .where(eq(userSkills.userId, user.id))

    // Get user achievements
    console.log('🔍 Drizzle Query: Fetching user achievements')
    const userAchievementsData = await db.select().from(userAchievements)
      .where(eq(userAchievements.userId, user.id))

    // Create optimized AI prompt
    const systemPrompt = `You are an expert educational counselor for PathPiper, a student networking and profile platform. Provide concise, actionable insights based on student profiles with ALL recommendations specifically tailored to PathPiper platform features.

FORMATTING: Use **bold** for emphasis, numbered lists for steps. DO NOT use hashtags (#) or markdown headers.
At the end, list all the goals involved and require to be added if present in a fixed JSON structure having attributes "title", "description" ,"category" and "timeframe". Wrap this JSON in 'SUGGESTED_GOALS_JSON_START' and 'SUGGESTED_GOALS_JSON_END' markers.

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
    const profileSummary = createOptimizedProfileSummary(profile, userInterestsData, userSkillsData, userAchievementsData)

    const goalCategories = ['Academic', 'Career', 'Personal Development', 'Creative', 'Health & Fitness', 'Social', 'Technical Skills', 'Leadership', 'Community Service', 'Financial'];

    const userPrompt = `
      Analyze the following student profile and provide comprehensive insights:

      Student Information:
      - Name: ${profile.firstName} ${profile.lastName}
      - Education Level: ${profile.educationLevel || 'Not specified'}
      - Age Group: ${profile.ageGroup || 'Not specified'}
      - Learning Style: ${profile.learningStyle || 'Not specified'}
      - Personality Type: ${profile.personalityType || 'Not specified'}
      - Location: ${profile.location || 'Not specified'}
      - Bio: ${profile.bio || 'Not provided'}

      Interests: ${profileSummary.interestsText || 'None specified'}
      Skills: ${profileSummary.skillsText || 'None specified'}
      Achievements: ${profileSummary.achievementsText || 'None specified'}

      Please provide:
      1. A comprehensive analysis of their strengths and areas for improvement
      2. Personalized learning recommendations based on their interests and skills
      3. Career path suggestions that align with their profile
      4. Specific action steps they can take to achieve their goals
      5. Potential challenges they might face and how to overcome them

      At the end, provide 3-5 suggested goals in the following JSON format within a "SUGGESTED_GOALS" section:
      {
        "goals": [
          {
            "title": "Goal title",
            "description": "Detailed description of the goal",
            "category": "Choose from: ${goalCategories.join(', ')}",
            "timeframe": "Short-term (1-3 months), Medium-term (3-6 months), or Long-term (6+ months)"
          }
        ]
      }

      Make the analysis encouraging, actionable, and age-appropriate.
    `

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
        max_tokens: 2000, // Increased token limit to accommodate JSON
        temperature: 0.5, // Reduced for faster processing
        stream: false
      }),
    })

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', await openaiResponse.text())
      throw new Error('Failed to get AI analysis')
    }

    const aiResult = await openaiResponse.json()
    let analysisContent = aiResult.choices[0]?.message?.content

    if (!analysisContent) {
      throw new Error('No analysis received from AI')
    }

    // Extract suggested goals from the response
    let suggestedGoalsData: any[] = []
    const jsonStartMarker = 'SUGGESTED_GOALS_JSON_START'
    const jsonEndMarker = 'SUGGESTED_GOALS_JSON_END'

    try {
      const startIndex = analysisContent.indexOf(jsonStartMarker)
      const endIndex = analysisContent.indexOf(jsonEndMarker)

      if (startIndex !== -1 && endIndex !== -1) {
        const jsonString = analysisContent.substring(startIndex + jsonStartMarker.length, endIndex).trim()
        console.log('🔍 Extracted JSON string:', jsonString)

        const goalsData = JSON.parse(jsonString)
        console.log('🔍 Parsed goals data:', goalsData);
        
        // Handle both "goals" and "suggested_goals" structures
        const goalsArray = goalsData.goals || goalsData.suggested_goals;
        if (goalsArray && Array.isArray(goalsArray)) {
          suggestedGoalsData = goalsArray

          // Insert suggested goals into database using Drizzle
          console.log('💾 Inserting suggested goals into database...');
          console.log('🔍 Goals to insert:', suggestedGoalsData);
          
          let currentSessionGoalIds: number[] = []
          
          try {
            const goalsToInsert = suggestedGoalsData.map(goal => ({
              userId: user.id,
              title: goal.title,
              description: goal.description,
              category: goal.category,
              timeframe: goal.timeframe,
              isAdded: false
            }));

            console.log('🔍 Formatted goals for insertion:', goalsToInsert);
            
            const insertResult = await db.insert(suggestedGoals).values(goalsToInsert).returning({ id: suggestedGoals.id });
            currentSessionGoalIds = insertResult.map(goal => goal.id)
            console.log('🔍 Insert result with IDs:', insertResult);
            console.log('🔍 Current session goal IDs:', currentSessionGoalIds);
            console.log('✅ Successfully inserted suggested goals into database');
          } catch (insertError) {
            console.error('❌ Error inserting suggested goals:', insertError);
            // Continue with the response even if insertion fails
          }

          // Remove the JSON section from the analysis text
          const cleanAnalysis = analysisContent.substring(0, startIndex) + analysisContent.substring(endIndex + jsonEndMarker.length)
          analysisContent = cleanAnalysis.trim()
        }
      }
    } catch (parseError) {
      console.error('❌ Error parsing or processing suggested goals:', parseError)
    }

    // Remove hashtags from the response
    const analysis = analysisContent.replace(/#+\s*/g, '')

    console.log('✅ Analysis completed successfully')

    // Fetch all suggested goals for the user
    const allGoals = await db.select().from(suggestedGoals)
      .where(eq(suggestedGoals.userId, user.id))
      .orderBy(suggestedGoals.createdAt)

    // Mark goals from current session
    const goalsWithSessionInfo = allGoals.map(goal => ({
      ...goal,
      isCurrentSuggestion: currentSessionGoalIds.includes(goal.id)
    }))

    return NextResponse.json({
      analysis,
      suggestedGoals: goalsWithSessionInfo, // Send all goals with current session info
      currentSessionGoalIds, // Also send the current session IDs for reference
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

function createOptimizedProfileSummary(profile: any, userInterestsData: any, userSkillsData: any, userAchievementsData: any): { interestsText: string, skillsText: string, achievementsText: string } {
  const interestsText = userInterestsData.map((ui: any) =>
    `${ui.interestName} (Category: ${ui.categoryName})`
  ).join(', ')

  const skillsText = userSkillsData.map((us: any) =>
    `${us.skillName} (Level: ${us.proficiencyLevel}/5, Category: ${us.categoryName})`
  ).join(', ')

  const achievementsText = userAchievementsData.map((ua: any) =>
    `${ua.name}: ${ua.description}`
  ).join(', ')

  return { interestsText, skillsText, achievementsText };
}

function createProfileSummary(studentData: any): string {
  // This function is deprecated and replaced by createOptimizedProfileSummary
  // However, keeping it here to avoid breaking existing calls if any.
  // It's recommended to update all calls to use createOptimizedProfileSummary.
  const { profile, interests, skills, educationHistory, achievements, goals } = studentData

  let summary = `Student: ${profile?.firstName || ''} ${profile?.lastName || ''}\n`
  summary += `Bio: ${profile?.bio || 'None'}\n`
  summary += `Age Group: ${profile?.ageGroup || 'Unknown'}\n`
  summary += `Education Level: ${profile?.educationLevel || 'Unknown'}\n\n`

  if (interests && interests.length > 0) {
    const interestNames = interests.slice(0, 10).map((i: any) => i.name || i.interest?.name).filter(Boolean)
    summary += `Interests (${interests.length}): ${interestNames.join(', ')}\n`
  } else {
    summary += `Interests: None listed\n`
  }

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

  if (educationHistory && educationHistory.length > 0) {
    const latest = educationHistory[0]
    summary += `Current Education: ${latest.institutionName} - ${latest.degreeProgram}\n`
  } else {
    summary += `Education: None listed\n`
  }

  if (goals && goals.length > 0) {
    const goalTitles = goals.slice(0, 5).map((g: any) => g.title || g.goal).filter(Boolean)
    summary += `Goals (${goals.length}): ${goalTitles.join(', ')}\n`
  } else {
    summary += `Goals: None set\n`
  }

  if (achievements && achievements.length > 0) {
    const achievementNames = achievements.slice(0, 3).map((a: any) => a.name || a.title).filter(Boolean)
    summary += `Recent Achievements: ${achievementNames.join(', ')}\n`
  }

  return summary
}

function calculateProfileCompleteness(studentData: any) {
  const { profile, interests, skills, educationHistory, achievements, goals } = studentData

  let score = 0
  let maxScore = 6
  const missingSections = []
  const strengths = []
  const improvements = []

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