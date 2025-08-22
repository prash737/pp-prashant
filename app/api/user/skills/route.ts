
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/drizzle/client'
import { userSkills, skills, skillCategories, studentProfiles } from '@/lib/drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Check for valid session cookie
    const cookieStore = await cookies()
    const accessTokenCookie = cookieStore.get('sb-access-token')

    if (!accessTokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from session - try API first, fallback to direct validation
    let user
    try {
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/user`, {
        headers: {
          cookie: `sb-access-token=${accessTokenCookie.value}`,
        },
      })

      if (!userResponse.ok) {
        console.log('⚠️ Failed to validate user via API, trying direct Supabase validation')
        // Fallback to direct Supabase validation
        const { createClient } = require('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(accessTokenCookie.value)

        if (error || !supabaseUser) {
          return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
        }

        user = {
          id: supabaseUser.id,
          email: supabaseUser.email
        }
      } else {
        const result = await userResponse.json()
        user = result.user
      }
    } catch (error) {
      console.error('Error validating user session for skills get:', error)
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('🔍 Fetching skills for user:', user.id)

    // Get user's current skills with skill details using Drizzle
    const userSkillsData = await db
      .select({
        skillId: userSkills.skillId,
        proficiencyLevel: userSkills.proficiencyLevel,
        skillId2: skills.id,
        skillName: skills.name,
        categoryName: skillCategories.name,
        categoryAgeGroup: skillCategories.ageGroup,
      })
      .from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id))
      .innerJoin(skillCategories, eq(skills.categoryId, skillCategories.id))
      .where(eq(userSkills.userId, user.id))

    console.log('✅ Found', userSkillsData.length, 'skills for user')

    // Transform to match the expected format
    const transformedSkills = userSkillsData.map(userSkill => ({
      skill_id: userSkill.skillId,
      proficiency_level: userSkill.proficiencyLevel,
      skills: {
        id: userSkill.skillId2,
        name: userSkill.skillName,
        skill_categories: {
          name: userSkill.categoryName,
          age_group: userSkill.categoryAgeGroup
        }
      }
    }))

    return NextResponse.json({ skills: transformedSkills })
  } catch (error) {
    console.error('Error in GET /api/user/skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessTokenCookie = cookieStore.get('sb-access-token')

    if (!accessTokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from session - try API first, fallback to direct validation
    let user
    try {
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/user`, {
        headers: {
          cookie: `sb-access-token=${accessTokenCookie.value}`,
        },
      })

      if (!userResponse.ok) {
        console.log('⚠️ Failed to validate user via API, trying direct Supabase validation')
        // Fallback to direct Supabase validation
        const { createClient } = require('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(accessTokenCookie.value)

        if (error || !supabaseUser) {
          return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
        }

        user = {
          id: supabaseUser.id,
          email: supabaseUser.email
        }
      } else {
        const result = await userResponse.json()
        user = result.user
      }
    } catch (error) {
      console.error('Error validating user session for skills save:', error)
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { skills: skillsToSave } = await request.json()

    if (!Array.isArray(skillsToSave)) {
      return NextResponse.json({ error: 'Skills must be an array' }, { status: 400 })
    }

    console.log('💾 Saving skills for user:', user.id, 'Skills count:', skillsToSave.length)
    console.log('🔍 Full user object keys:', Object.keys(user))
    console.log('🔍 User student profile:', user.studentProfile)

    // Get user's age group to validate skills - try multiple possible locations
    let ageGroup = user.ageGroup || user.studentProfile?.age_group

    // If no age group found, try to fetch from database
    if (!ageGroup && user.id) {
      try {
        const studentProfile = await db
          .select({ ageGroup: studentProfiles.ageGroup })
          .from(studentProfiles)
          .where(eq(studentProfiles.id, user.id))
          .limit(1)
        
        ageGroup = studentProfile[0]?.ageGroup
        console.log('🔍 Fetched age group from database:', ageGroup)
      } catch (error) {
        console.log('⚠️ Could not fetch age group from database:', error)
      }
    }

    // If still no age group, use a fallback based on typical onboarding scenario
    if (!ageGroup) {
      console.log('⚠️ No age_group found, using fallback: young_adult')
      ageGroup = 'young_adult' // Default fallback for onboarding
    }

    console.log('🔍 User age group from ageGroup field:', user.ageGroup)
    console.log('🔍 User age group from studentProfile:', user.studentProfile?.age_group)
    console.log('🔍 Final age group used:', ageGroup)

    console.log('🔍 Using age group:', ageGroup)

    // Get available skills for user's current age group
    const availableSkillsData = await db
      .select({
        id: skills.id,
        name: skills.name,
      })
      .from(skills)
      .innerJoin(skillCategories, eq(skills.categoryId, skillCategories.id))
      .where(eq(skillCategories.ageGroup, ageGroup as any))

    const availableSkillIds = availableSkillsData.map(skill => skill.id)
    const availableSkillNamesMap = new Map(availableSkillsData.map(skill => [skill.name, skill.id]))

    // Get or create custom skill category for this age group
    let customSkillCategory = await db
      .select()
      .from(skillCategories)
      .where(and(
        eq(skillCategories.name, 'Custom'),
        eq(skillCategories.ageGroup, ageGroup as any)
      ))
      .limit(1)

    if (!customSkillCategory.length) {
      const newCustomCategory = await db
        .insert(skillCategories)
        .values({
          name: 'Custom',
          ageGroup: ageGroup as any
        })
        .returning()
      
      customSkillCategory = newCustomCategory
      console.log('✅ Created custom skill category for age group:', ageGroup)
    }

    // Process custom skills (those without IDs) and create them in database
    for (const skill of skillsToSave) {
      if (!skill.id && !availableSkillNamesMap.has(skill.name)) {
        console.log('🔍 Processing custom skill:', skill.name)

        // Check if this custom skill already exists
        const existingCustomSkill = await db
          .select()
          .from(skills)
          .where(and(
            eq(skills.name, skill.name),
            eq(skills.categoryId, customSkillCategory[0].id)
          ))
          .limit(1)

        if (!existingCustomSkill.length) {
          // Create the custom skill
          const newCustomSkill = await db
            .insert(skills)
            .values({
              name: skill.name,
              categoryId: customSkillCategory[0].id
            })
            .returning()

          // Add to our maps so it can be processed normally
          availableSkillIds.push(newCustomSkill[0].id)
          availableSkillNamesMap.set(skill.name, newCustomSkill[0].id)
          console.log('✅ Created custom skill:', skill.name, 'with ID:', newCustomSkill[0].id)
        } else {
          // Add existing custom skill to our maps
          availableSkillIds.push(existingCustomSkill[0].id)
          availableSkillNamesMap.set(skill.name, existingCustomSkill[0].id)
          console.log('✅ Found existing custom skill:', skill.name, 'with ID:', existingCustomSkill[0].id)
        }
      }
    }

    // Now all skills (including newly created custom ones) should be valid
    const validSkills = skillsToSave.filter(skill => {
      const hasValidId = skill.id && availableSkillIds.includes(skill.id)
      const hasValidName = skill.name && availableSkillNamesMap.has(skill.name)
      const isCustomSkill = !skill.id && skill.name && skill.name.trim().length > 0
      
      return hasValidId || hasValidName || isCustomSkill
    })
    console.log('🔍 Processing skills for age group', ageGroup, '. Valid:', validSkills.length, 'out of', skillsToSave.length)
    
    // Log details about skill validation
    skillsToSave.forEach(skill => {
      const hasValidId = skill.id && availableSkillIds.includes(skill.id)
      const hasValidName = skill.name && availableSkillNamesMap.has(skill.name)
      const isCustomSkill = !skill.id && skill.name && skill.name.trim().length > 0
      console.log(`🔍 Skill "${skill.name}": hasValidId=${hasValidId}, hasValidName=${hasValidName}, isCustomSkill=${isCustomSkill}`)
    })

    // Get currently saved user skills
    const currentUserSkillsData = await db
      .select({
        id: userSkills.id,
        skillId: userSkills.skillId,
        proficiencyLevel: userSkills.proficiencyLevel,
        skillName: skills.name,
      })
      .from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, user.id))

    const currentSkillsMap = new Map(currentUserSkillsData.map(us => [
      us.skillName, 
      { id: us.skillId, level: us.proficiencyLevel }
    ]))

    console.log('🔍 Current saved skills:', currentUserSkillsData.length, Array.from(currentSkillsMap.keys()))
    console.log('🔍 New skills to save:', validSkills.length, validSkills.map(s => s.name))

    // Find skills to add (in new list but not in current)
    const skillsToAdd = validSkills.filter(skill => !currentSkillsMap.has(skill.name))

    // Find skills to update (in both lists but with different proficiency level)
    const skillsToUpdate = validSkills.filter(skill => {
      const current = currentSkillsMap.get(skill.name)
      return current && current.level !== (skill.level || 1)
    })

    // Don't remove any existing skills - only add new ones and update existing ones
    // This preserves skills that were added through other parts of the app
    console.log('➕ Skills to add:', skillsToAdd.length, skillsToAdd.map(s => s.name))
    console.log('🔄 Skills to update:', skillsToUpdate.length, skillsToUpdate.map(s => s.name))
    console.log('✅ Preserving existing skills that are not being modified')

    // Add new skills
    if (skillsToAdd.length > 0) {
      const userSkillData = skillsToAdd
        .map(skill => {
          const skillId = skill.id || availableSkillNamesMap.get(skill.name)
          return skillId ? {
            userId: user.id,
            skillId: skillId,
            proficiencyLevel: skill.level || 1
          } : null
        })
        .filter(Boolean) as { userId: string; skillId: number; proficiencyLevel: number }[]

      if (userSkillData.length > 0) {
        await db.insert(userSkills).values(userSkillData)
        console.log('✅ Added', userSkillData.length, 'new skills')
      }
    }

    // Update existing skills with changed proficiency levels
    if (skillsToUpdate.length > 0) {
      for (const skill of skillsToUpdate) {
        const skillId = skill.id || availableSkillNamesMap.get(skill.name)
        if (skillId) {
          await db
            .update(userSkills)
            .set({ proficiencyLevel: skill.level || 1 })
            .where(and(
              eq(userSkills.userId, user.id),
              eq(userSkills.skillId, skillId)
            ))
        }
      }
      console.log('🔄 Updated', skillsToUpdate.length, 'skill proficiency levels')
    }

    console.log('✅ All skills processed successfully, including custom skills')

    // Log filtered out skills (those not valid for current age group)
    const filteredOutSkills = skillsToSave.filter(skill => !validSkills.includes(skill))
    if (filteredOutSkills.length > 0) {
      console.log('❌ Skills filtered out (not valid for age group', ageGroup, '):', filteredOutSkills.map(s => s.name))
    }

    const unchangedCount = validSkills.filter(skill => {
      const current = currentSkillsMap.get(skill.name)
      return current && current.level === (skill.level || 1)
    }).length
    console.log('🔄 Unchanged skills:', unchangedCount)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/user/skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
