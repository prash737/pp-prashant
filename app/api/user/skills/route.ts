import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

    // Get user's current skills with skill details using Prisma
    const userSkills = await prisma.userSkill.findMany({
      where: { userId: user.id },
      include: {
        skill: {
          include: {
            category: {
              select: {
                name: true,
                ageGroup: true
              }
            }
          }
        }
      }
    })

    console.log('✅ Found', userSkills.length, 'skills for user')

    // Transform to match the expected format
    const transformedSkills = userSkills.map(userSkill => ({
      skill_id: userSkill.skillId,
      proficiency_level: userSkill.proficiencyLevel,
      skills: {
        id: userSkill.skill.id,
        name: userSkill.skill.name,
        skill_categories: {
          name: userSkill.skill.category.name,
          age_group: userSkill.skill.category.ageGroup
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

    const { skills } = await request.json()

    if (!Array.isArray(skills)) {
      return NextResponse.json({ error: 'Skills must be an array' }, { status: 400 })
    }

    console.log('💾 Saving skills for user:', user.id, 'Skills count:', skills.length)
    console.log('🔍 Full user object keys:', Object.keys(user))
    console.log('🔍 User student profile:', user.studentProfile)

    // Get user's age group to validate skills - try multiple possible locations
    let ageGroup = user.ageGroup || user.studentProfile?.age_group

    // If no age group found, try to fetch from database
    if (!ageGroup && user.id) {
      try {
        const studentProfile = await prisma.studentProfile.findUnique({
          where: { id: user.id },
          select: { ageGroup: true }
        })
        ageGroup = studentProfile?.ageGroup
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
    const availableSkills = await prisma.skill.findMany({
      where: {
        category: {
          ageGroup: ageGroup as any
        }
      },
      select: {
        id: true,
        name: true
      }
    })

    const availableSkillIds = availableSkills.map(skill => skill.id)
    const availableSkillNamesMap = new Map(availableSkills.map(skill => [skill.name, skill.id]))

    // Get or create custom skill category for this age group
    let customSkillCategory = await prisma.skillCategory.findFirst({
      where: {
        name: 'Custom',
        ageGroup: ageGroup as any
      }
    })

    if (!customSkillCategory) {
      customSkillCategory = await prisma.skillCategory.create({
        data: {
          name: 'Custom',
          ageGroup: ageGroup as any
        }
      })
      console.log('✅ Created custom skill category for age group:', ageGroup)
    }

    // Process custom skills (those without IDs) and create them in database
    for (const skill of skills) {
      if (!skill.id && !availableSkillNamesMap.has(skill.name)) {
        console.log('🔍 Processing custom skill:', skill.name)

        // Check if this custom skill already exists
        const existingCustomSkill = await prisma.skill.findFirst({
          where: {
            name: skill.name,
            categoryId: customSkillCategory.id
          }
        })

        if (!existingCustomSkill) {
          // Create the custom skill
          const newCustomSkill = await prisma.skill.create({
            data: {
              name: skill.name,
              categoryId: customSkillCategory.id
            }
          })

          // Add to our maps so it can be processed normally
          availableSkillIds.push(newCustomSkill.id)
          availableSkillNamesMap.set(skill.name, newCustomSkill.id)
          console.log('✅ Created custom skill:', skill.name, 'with ID:', newCustomSkill.id)
        } else {
          // Add existing custom skill to our maps
          availableSkillIds.push(existingCustomSkill.id)
          availableSkillNamesMap.set(skill.name, existingCustomSkill.id)
          console.log('✅ Found existing custom skill:', skill.name, 'with ID:', existingCustomSkill.id)
        }
      }
    }

    // Now all skills (including newly created custom ones) should be valid
    const validSkills = skills.filter(skill => {
      const hasValidId = skill.id && availableSkillIds.includes(skill.id)
      const hasValidName = skill.name && availableSkillNamesMap.has(skill.name)
      const isCustomSkill = !skill.id && skill.name && skill.name.trim().length > 0
      
      return hasValidId || hasValidName || isCustomSkill
    })
    console.log('🔍 Processing skills for age group', ageGroup, '. Valid:', validSkills.length, 'out of', skills.length)
    
    // Log details about skill validation
    skills.forEach(skill => {
      const hasValidId = skill.id && availableSkillIds.includes(skill.id)
      const hasValidName = skill.name && availableSkillNamesMap.has(skill.name)
      const isCustomSkill = !skill.id && skill.name && skill.name.trim().length > 0
      console.log(`🔍 Skill "${skill.name}": hasValidId=${hasValidId}, hasValidName=${hasValidName}, isCustomSkill=${isCustomSkill}`)
    })

    // Get currently saved user skills
    const currentUserSkills = await prisma.userSkill.findMany({
      where: { userId: user.id },
      include: { 
        skill: { 
          select: { 
            name: true, 
            id: true 
          } 
        } 
      }
    })

    const currentSkillsMap = new Map(currentUserSkills.map(us => [
      us.skill.name, 
      { id: us.skill.id, level: us.proficiencyLevel }
    ]))

    console.log('🔍 Current saved skills:', currentUserSkills.length, Array.from(currentSkillsMap.keys()))
    console.log('🔍 New skills to save:', validSkills.length, validSkills.map(s => s.name))

    // Find skills to add (in new list but not in current)
    const skillsToAdd = validSkills.filter(skill => !currentSkillsMap.has(skill.name))

    // Find skills to update (in both lists but with different proficiency level)
    const skillsToUpdate = validSkills.filter(skill => {
      const current = currentSkillsMap.get(skill.name)
      return current && current.level !== (skill.level || 1)
    })

    // Find skills to remove (in current but not in new list, or not valid for current age group)
    const skillsToRemove = currentUserSkills.filter(us => {
      const isInNewList = validSkills.some(skill => skill.name === us.skill.name)
      const isValidForAgeGroup = availableSkillIds.includes(us.skill.id)
      return !isInNewList || !isValidForAgeGroup
    })

    console.log('➕ Skills to add:', skillsToAdd.length, skillsToAdd.map(s => s.name))
    console.log('🔄 Skills to update:', skillsToUpdate.length, skillsToUpdate.map(s => s.name))
    console.log('➖ Skills to remove:', skillsToRemove.length, skillsToRemove.map(us => us.skill.name))

    // Remove skills that are no longer selected or not valid for current age group
    if (skillsToRemove.length > 0) {
      const removedCount = await prisma.userSkill.deleteMany({
        where: {
          userId: user.id,
          skillId: {
            in: skillsToRemove.map(us => us.skill.id)
          }
        },
      })
      console.log('🗑️ Removed', removedCount.count, 'skills')
    }

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
        await prisma.userSkill.createMany({
          data: userSkillData
        })
        console.log('✅ Added', userSkillData.length, 'new skills')
      }
    }

    // Update existing skills with changed proficiency levels
    if (skillsToUpdate.length > 0) {
      for (const skill of skillsToUpdate) {
        const skillId = skill.id || availableSkillNamesMap.get(skill.name)
        if (skillId) {
          await prisma.userSkill.updateMany({
            where: {
              userId: user.id,
              skillId: skillId
            },
            data: {
              proficiencyLevel: skill.level || 1
            }
          })
        }
      }
      console.log('🔄 Updated', skillsToUpdate.length, 'skill proficiency levels')
    }

    console.log('✅ All skills processed successfully, including custom skills')

    // Log filtered out skills (those not valid for current age group)
    const filteredOutSkills = skills.filter(skill => !validSkills.includes(skill))
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