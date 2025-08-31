
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/drizzle/client'
import { skillCategories, skills } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Check for valid session cookie
    const cookieStore = await cookies()
    const accessTokenCookie = cookieStore.get('sb-access-token')
    const parentAuthTokenCookie = cookieStore.get('parent-auth-token')

    // Check if this is a parent or regular user request
    let isParentRequest = false
    
    if (parentAuthTokenCookie) {
      // Parent authentication - would need to add parent profile table to drizzle schema
      try {
        const parentId = parentAuthTokenCookie.value
        // Note: You'll need to add parentProfiles table to drizzle schema
        // const parentProfile = await db.select().from(parentProfiles).where(eq(parentProfiles.id, parentId)).limit(1)
        // if (!parentProfile.length) {
        //   return NextResponse.json({ error: 'Invalid parent session' }, { status: 401 })
        // }
        
        isParentRequest = true
      } catch (error) {
        return NextResponse.json({ error: 'Invalid parent session' }, { status: 401 })
      }
    } else if (!accessTokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    } else {
      // Verify the access token is valid for regular users
      try {
        const { createClient } = require('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        
        const { data: { user }, error } = await supabase.auth.getUser(accessTokenCookie.value)
        
        if (error || !user) {
          console.log('⚠️ Invalid access token for skills API')
          return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
        }
      } catch (error) {
        console.error('Error verifying access token:', error)
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }
    }

    const { searchParams } = new URL(request.url)
    const ageGroup = searchParams.get('ageGroup')

    if (!ageGroup) {
      return NextResponse.json({ error: 'Age group is required' }, { status: 400 })
    }

    console.log('🔍 Fetching skill categories for age group:', ageGroup)

    // Map age group names for compatibility
    let mappedAgeGroup = ageGroup
    if (ageGroup.includes('-')) {
      mappedAgeGroup = ageGroup.replace(/-/g, '_')
    }
    console.log('🔍 Original age group:', ageGroup)
    console.log('🔍 Mapped age group:', mappedAgeGroup)

    // Fetch skill categories and skills for the age group using Drizzle
    const skillCategoriesWithSkills = await db
      .select({
        id: skillCategories.id,
        name: skillCategories.name,
        ageGroup: skillCategories.ageGroup,
        skillId: skills.id,
        skillName: skills.name,
      })
      .from(skillCategories)
      .leftJoin(skills, eq(skillCategories.id, skills.categoryId))
      .where(eq(skillCategories.ageGroup, mappedAgeGroup as any))
      .orderBy(skillCategories.name, skills.name)

    console.log('✅ Found', skillCategoriesWithSkills.length, 'skill categories for age group:', mappedAgeGroup)

    // If no categories found for this age group, try with a fallback
    let finalCategories = skillCategoriesWithSkills
    if (skillCategoriesWithSkills.length === 0) {
      console.log('⚠️ No categories found for', mappedAgeGroup, ', trying young_adult as fallback')
      finalCategories = await db
        .select({
          id: skillCategories.id,
          name: skillCategories.name,
          ageGroup: skillCategories.ageGroup,
          skillId: skills.id,
          skillName: skills.name,
        })
        .from(skillCategories)
        .leftJoin(skills, eq(skillCategories.id, skills.categoryId))
        .where(eq(skillCategories.ageGroup, 'young_adult' as any))
        .orderBy(skillCategories.name, skills.name)
      console.log('✅ Found', finalCategories.length, 'fallback categories')
    }

    // Transform the data to match the expected format
    const categoryMap = new Map()
    
    finalCategories.forEach(row => {
      if (!categoryMap.has(row.name)) {
        categoryMap.set(row.name, {
          name: row.name,
          skills: []
        })
      }
      
      if (row.skillId && row.skillName) {
        categoryMap.get(row.name).skills.push({
          id: row.skillId,
          name: row.skillName
        })
      }
    })

    const transformedCategories = Array.from(categoryMap.values())

    console.log('✅ Transformed categories:', transformedCategories.map(c => ({ name: c.name, skillCount: c.skills.length })))

    return NextResponse.json({ categories: transformedCategories })
  } catch (error) {
    console.error('Error in GET /api/skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
