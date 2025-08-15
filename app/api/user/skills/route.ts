
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get userId from query params or cookies as fallback
    const { searchParams } = new URL(request.url)
    let userId = searchParams.get('userId')
    
    if (!userId) {
      const cookieStore = request.cookies
      userId = cookieStore.get('sb-user-id')?.value
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('🔍 Fetching skills for user:', userId)

    // Optimized query - get user's current skills with skill details in single query
    const userSkills = await prisma.userSkill.findMany({
      where: { userId: userId },
      select: {
        skillId: true,
        proficiencyLevel: true,
        skill: {
          select: {
            id: true,
            name: true,
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

    // Transform to match the expected format - optimized mapping
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
    const body = await request.json()
    const { userId, skills } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (!Array.isArray(skills)) {
      return NextResponse.json({ error: 'Skills must be an array' }, { status: 400 })
    }

    console.log('💾 Saving skills for user:', userId, 'Skills count:', skills.length)

    // Get user's age group to validate skills - optimized single query
    let ageGroup = 'young_adult' // Default fallback
    
    try {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { id: userId },
        select: { ageGroup: true }
      })
      if (studentProfile?.ageGroup) {
        ageGroup = studentProfile.ageGroup
      }
    } catch (error) {
      console.log('⚠️ Could not fetch age group, using fallback:', ageGroup)
    }

    console.log('🔍 Using age group:', ageGroup)

    // Get available skills and custom skill category in parallel
    const [availableSkills, customSkillCategory] = await Promise.all([
      prisma.skill.findMany({
        where: {
          category: {
            ageGroup: ageGroup as any
          }
        },
        select: {
          id: true,
          name: true
        }
      }),
      prisma.skillCategory.findFirst({
        where: {
          name: 'Custom',
          ageGroup: ageGroup as any
        }
      })
    ])

    const availableSkillIds = availableSkills.map(skill => skill.id)
    const availableSkillNamesMap = new Map(availableSkills.map(skill => [skill.name, skill.id]))

    // Create custom skill category if it doesn't exist
    let finalCustomCategory = customSkillCategory
    if (!finalCustomCategory) {
      finalCustomCategory = await prisma.skillCategory.create({
        data: {
          name: 'Custom',
          ageGroup: ageGroup as any
        }
      })
      console.log('✅ Created custom skill category for age group:', ageGroup)
    }

    // Process custom skills in batch
    const customSkills = skills.filter(skill => !skill.id && !availableSkillNamesMap.has(skill.name) && skill.name?.trim())
    
    if (customSkills.length > 0) {
      // Check existing custom skills
      const existingCustomSkills = await prisma.skill.findMany({
        where: {
          name: { in: customSkills.map(s => s.name) },
          categoryId: finalCustomCategory.id
        },
        select: { id: true, name: true }
      })

      const existingCustomMap = new Map(existingCustomSkills.map(s => [s.name, s.id]))
      const skillsToCreate = customSkills.filter(s => !existingCustomMap.has(s.name))

      // Create new custom skills in batch
      if (skillsToCreate.length > 0) {
        await prisma.skill.createMany({
          data: skillsToCreate.map(skill => ({
            name: skill.name,
            categoryId: finalCustomCategory.id
          }))
        })

        // Get the newly created skills
        const newCustomSkills = await prisma.skill.findMany({
          where: {
            name: { in: skillsToCreate.map(s => s.name) },
            categoryId: finalCustomCategory.id
          },
          select: { id: true, name: true }
        })

        newCustomSkills.forEach(skill => {
          availableSkillIds.push(skill.id)
          availableSkillNamesMap.set(skill.name, skill.id)
        })
      }

      // Add existing custom skills to maps
      existingCustomSkills.forEach(skill => {
        availableSkillIds.push(skill.id)
        availableSkillNamesMap.set(skill.name, skill.id)
      })
    }

    // Validate skills
    const validSkills = skills.filter(skill => {
      const hasValidId = skill.id && availableSkillIds.includes(skill.id)
      const hasValidName = skill.name && availableSkillNamesMap.has(skill.name)
      return hasValidId || hasValidName
    })

    console.log('🔍 Processing skills for age group', ageGroup, '. Valid:', validSkills.length, 'out of', skills.length)

    // Get current user skills and update/create in parallel operations
    const [currentUserSkills] = await Promise.all([
      prisma.userSkill.findMany({
        where: { userId: userId },
        select: { 
          skillId: true,
          proficiencyLevel: true,
          skill: { 
            select: { 
              name: true, 
              id: true 
            } 
          } 
        }
      })
    ])

    const currentSkillsMap = new Map(currentUserSkills.map(us => [
      us.skill.name, 
      { id: us.skill.id, level: us.proficiencyLevel }
    ]))

    // Find skills to add and update
    const skillsToAdd = validSkills.filter(skill => !currentSkillsMap.has(skill.name))
    const skillsToUpdate = validSkills.filter(skill => {
      const current = currentSkillsMap.get(skill.name)
      return current && current.level !== (skill.level || 1)
    })

    console.log('➕ Skills to add:', skillsToAdd.length)
    console.log('🔄 Skills to update:', skillsToUpdate.length)

    // Execute add and update operations in parallel
    const operations = []

    if (skillsToAdd.length > 0) {
      const userSkillData = skillsToAdd
        .map(skill => {
          const skillId = skill.id || availableSkillNamesMap.get(skill.name)
          return skillId ? {
            userId: userId,
            skillId: skillId,
            proficiencyLevel: skill.level || 1
          } : null
        })
        .filter(Boolean) as { userId: string; skillId: number; proficiencyLevel: number }[]

      if (userSkillData.length > 0) {
        operations.push(
          prisma.userSkill.createMany({
            data: userSkillData
          })
        )
      }
    }

    if (skillsToUpdate.length > 0) {
      const updateOperations = skillsToUpdate.map(skill => {
        const skillId = skill.id || availableSkillNamesMap.get(skill.name)
        if (skillId) {
          return prisma.userSkill.updateMany({
            where: {
              userId: userId,
              skillId: skillId
            },
            data: {
              proficiencyLevel: skill.level || 1
            }
          })
        }
        return null
      }).filter(Boolean)

      operations.push(...updateOperations)
    }

    // Execute all operations in parallel
    if (operations.length > 0) {
      await Promise.all(operations)
    }

    console.log('✅ All skills processed successfully')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/user/skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
