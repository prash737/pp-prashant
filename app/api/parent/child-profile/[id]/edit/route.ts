import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const childId = resolvedParams.id

    // Get parent authentication from cookies
    const cookieStore = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    )

    const parentId = cookies['parent_id']
    const parentSession = cookies['parent_session']

    if (!parentId || !parentSession) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify parent-child relationship
    const child = await prisma.profile.findFirst({
      where: {
        id: childId,
        parentId: parentId,
        role: 'student'
      }
    })

    if (!child) {
      return NextResponse.json(
        { success: false, error: 'Child not found or not authorized' },
        { status: 403 }
      )
    }

    const { section, data } = await request.json()

    // Using service role key to bypass RLS and allow parent edits
    switch (section) {
      case 'about':
        await prisma.profile.update({
          where: { id: childId },
          data: {
            bio: data.bio,
            location: data.location,
            tagline: data.tagline
          }
        })
        break

      case 'interests':
        // Delete existing interests
        await prisma.userInterest.deleteMany({
          where: { userId: childId }
        })

        // Add new interests
        if (data.interests && data.interests.length > 0) {
          const interestRecords = []

          for (const interestData of data.interests) {
            let existingInterest = null

            // If it's a number, it's an existing interest ID
            if (typeof interestData === 'number' || (typeof interestData === 'string' && !isNaN(parseInt(interestData)))) {
              const interestId = typeof interestData === 'number' ? interestData : parseInt(interestData)
              existingInterest = await prisma.interest.findUnique({
                where: { id: interestId }
              })
            } else {
              // It's a custom interest name, check if it exists
              existingInterest = await prisma.interest.findFirst({
                where: { name: interestData }
              })

              // If interest doesn't exist, create it
              if (!existingInterest) {
                // Use specific custom interest category ID 24
                const customInterestCategoryId = 24

                existingInterest = await prisma.interest.create({
                  data: {
                    name: interestData,
                    categoryId: customInterestCategoryId
                  }
                })
              }
            }

            if (existingInterest) {
              interestRecords.push({
                userId: childId,
                interestId: existingInterest.id
              })
            }
          }

          if (interestRecords.length > 0) {
            await prisma.userInterest.createMany({
              data: interestRecords,
              skipDuplicates: true
            })
          }
        }
        break

      case 'skills':
        // Delete existing skills
        await prisma.userSkill.deleteMany({
          where: { userId: childId }
        })

        // Add new skills
        if (data.skills && data.skills.length > 0) {
          const skillRecords = []

          for (const skillData of data.skills) {
            let existingSkill = null

            // If skillId is provided, use existing skill
            if (skillData.skillId && skillData.skillId > 0) {
              existingSkill = await prisma.skill.findUnique({
                where: { id: skillData.skillId }
              })
            } else {
              // Check if skill exists by name
              existingSkill = await prisma.skill.findFirst({
                where: { name: skillData.name }
              })
            }

            // If skill doesn't exist, create it
            if (!existingSkill) {
              // Use specific custom skill category ID 25
              const customSkillCategoryId = 25

              existingSkill = await prisma.skill.create({
                data: {
                  name: skillData.name,
                  categoryId: customSkillCategoryId
                }
              })
            }

            skillRecords.push({
              userId: childId,
              skillId: existingSkill.id,
              proficiencyLevel: skillData.proficiencyLevel || 3
            })
          }

          if (skillRecords.length > 0) {
            await prisma.userSkill.createMany({
              data: skillRecords,
              skipDuplicates: true
            })
          }
        }
        break

      case 'education':
        if (data.id) {
          // Update existing education
          await prisma.studentEducationHistory.update({
            where: { id: data.id },
            data: {
              institutionName: data.institutionName,
              institutionTypeId: data.institutionTypeId,
              degreeProgram: data.degreeProgram || null,
              fieldOfStudy: data.fieldOfStudy || null,
              subjects: data.subjects || [],
              gradeLevel: data.gradeLevel || null,
              startDate: data.startDate ? new Date(data.startDate) : new Date(),
              endDate: data.endDate ? new Date(data.endDate) : null,
              isCurrent: data.isCurrent || false,
              description: data.description || null
            }
          })
        } else {
          // Create new education
          await prisma.studentEducationHistory.create({
            data: {
              studentId: childId,
              institutionName: data.institutionName,
              institutionTypeId: data.institutionTypeId,
              degreeProgram: data.degreeProgram || null,
              fieldOfStudy: data.fieldOfStudy || null,
              subjects: data.subjects || [],
              gradeLevel: data.gradeLevel || null,
              startDate: data.startDate ? new Date(data.startDate) : new Date(),
              endDate: data.endDate ? new Date(data.endDate) : null,
              isCurrent: data.isCurrent || false,
              description: data.description || null
            }
          })
        }
        break

      case 'goals':
        if (data.id) {
          // Update existing goal
          await prisma.goal.update({
            where: { id: parseInt(data.id) },
            data: {
              title: data.title,
              description: data.description,
              category: data.category,
              timeframe: data.timeframe,
              completed: data.completed || false
            }
          })
        } else {
          // Create new goal
          await prisma.goal.create({
            data: {
              userId: childId,
              title: data.title,
              description: data.description,
              category: data.category,
              timeframe: data.timeframe
            }
          })
        }
        break

      case 'achievements':
        if (data.id) {
          // Update existing achievement
          await prisma.userAchievement.update({
            where: { id: parseInt(data.id) },
            data: {
              name: data.name,
              description: data.description,
              dateOfAchievement: new Date(data.dateOfAchievement),
              achievementTypeId: parseInt(data.achievementTypeId),
              achievementImageIcon: data.achievementImageIcon || null
            }
          })
        } else {
          // Create new achievement
          await prisma.userAchievement.create({
            data: {
              userId: childId,
              name: data.name,
              description: data.description,
              dateOfAchievement: new Date(data.dateOfAchievement),
              achievementTypeId: parseInt(data.achievementTypeId),
              achievementImageIcon: data.achievementImageIcon
            }
          })
        }
        break

      case 'social-links':
        // Delete existing social links
        await prisma.socialLink.deleteMany({
          where: { userId: childId }
        })

        // Add new social links
        if (data.socialLinks && data.socialLinks.length > 0) {
          await prisma.socialLink.createMany({
            data: data.socialLinks.map((link: any) => ({
              userId: childId,
              platform: link.platform,
              url: link.url
            }))
          })
        }
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid section' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Error updating child profile:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const childId = resolvedParams.id

    // Get parent authentication from cookies
    const cookieStore = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    )

    const parentId = cookies['parent_id']
    const parentSession = cookies['parent_session']

    if (!parentId || !parentSession) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify parent-child relationship
    const child = await prisma.profile.findFirst({
      where: {
        id: childId,
        parentId: parentId,
        role: 'student'
      }
    })

    if (!child) {
      return NextResponse.json(
        { success: false, error: 'Child not found or not authorized' },
        { status: 403 }
      )
    }

    const { section, itemId } = await request.json()

    // Using service role key to bypass RLS and allow parent deletions
    switch (section) {
      case 'education':
        await prisma.studentEducationHistory.delete({
          where: { id: itemId }
        })
        break

      case 'goals':
        await prisma.goal.delete({
          where: { id: parseInt(itemId) }
        })
        break

      case 'achievements':
        await prisma.userAchievement.delete({
          where: { id: parseInt(itemId) }
        })
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid section for deletion' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}