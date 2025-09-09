
'use server'

import { prisma } from '../prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function getUserProfile(userId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        student: true,
        mentor: true,
        institution: true
      }
    })

    return profile
  } catch (error) {
    console.error(`Error fetching user profile ${userId}:`, error)
    return null
  }
}

export async function updateUserProfile(userId: string, profileData: {
  firstName?: string
  lastName?: string
  bio?: string
  location?: string
  tagline?: string
  professionalSummary?: string
  profileImageUrl?: string
  coverImageUrl?: string
  email?: string
  phone?: string
  timezone?: string
  availabilityStatus?: string
}) {
  try {
    // Filter out undefined values
    const cleanData = Object.fromEntries(
      Object.entries(profileData).filter(([_, value]) => value !== undefined)
    )
    
    console.log('Updating profile with data:', cleanData)
    
    const updatedProfile = await prisma.profile.update({
      where: { id: userId },
      data: cleanData,
      include: {
        student: true,
        mentor: true,
        institution: true
      }
    })

    return updatedProfile
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

export async function updateStudentProfile(userId: string, studentData: {
  educationLevel?: string
  age_group?: string
  birthMonth?: string
  birthYear?: string
  personalityType?: string
  learningStyle?: string
  favoriteQuote?: string
}) {
  try {
    const updatedStudent = await prisma.studentProfile.update({
      where: { id: userId },
      data: {
        educationLevel: studentData.educationLevel as any,
        age_group: studentData.age_group as any,
        birthMonth: studentData.birthMonth,
        birthYear: studentData.birthYear,
        personalityType: studentData.personalityType,
        learningStyle: studentData.learningStyle,
        favoriteQuote: studentData.favoriteQuote
      }
    })

    return updatedStudent
  } catch (error) {
    console.error('Error updating student profile:', error)
    throw error
  }
}

export async function getUserSocialLinks(userId: string) {
  try {
    console.log('🔍 Supabase Query: Fetching social links for user:', userId)
    console.log('📝 Query Details: SELECT * FROM social_links WHERE user_id = ?')
    
    const { data: socialLinksData, error } = await supabase
      .from('social_links')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user social links:', error)
      return []
    }

    // Transform snake_case fields to camelCase for compatibility
    const socialLinks = (socialLinksData || []).map(link => ({
      id: link.id,
      userId: link.user_id,
      platform: link.platform,
      url: link.url,
      displayName: link.display_name,
      createdAt: link.created_at,
      updatedAt: link.updated_at
    }))

    return socialLinks
  } catch (error) {
    console.error('Error fetching user social links:', error)
    return []
  }
}

export async function updateUserSocialLinks(userId: string, socialLinksData: Array<{
  platform: string
  url: string
  displayName?: string
}>) {
  try {
    console.log('🔍 Supabase Query: Deleting existing social links for user:', userId)
    console.log('📝 Query Details: DELETE FROM social_links WHERE user_id = ?')
    
    // Delete existing social links for the user
    const { error: deleteError } = await supabase
      .from('social_links')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Error deleting existing social links:', deleteError)
      throw deleteError
    }

    // Create new social links if any provided
    if (socialLinksData.length > 0) {
      // Construct social links data with URL building logic
      const socialLinksToCreate = socialLinksData.map(link => {
        let fullUrl = link.url

        // Construct full URLs from handles using base URLs
        const baseUrls: { [key: string]: string } = {
          'instagram': 'https://instagram.com/',
          'facebook': 'https://facebook.com/',
          'linkedin': 'https://linkedin.com/in/',
          'x': 'https://x.com/',
          'twitter': 'https://x.com/',
          'behance': 'https://behance.net/',
          'dribbble': 'https://dribbble.com/'
        }

        // If platform has a base URL and the URL doesn't already start with http, construct it
        if (baseUrls[link.platform.toLowerCase()] && !fullUrl.startsWith('http')) {
          fullUrl = baseUrls[link.platform.toLowerCase()] + fullUrl
        }

        return {
          user_id: userId,
          platform: link.platform,
          url: fullUrl,
          display_name: link.displayName || null,
          created_at: new Date(),
          updated_at: new Date()
        }
      })

      console.log('🔍 Supabase Query: Creating new social links')
      console.log('📝 Query Details: INSERT INTO social_links VALUES (...) RETURNING *')
      
      const { data: createdLinks, error: createError } = await supabase
        .from('social_links')
        .insert(socialLinksToCreate)
        .select()

      if (createError) {
        console.error('Error creating social links:', createError)
        throw createError
      }

      // Transform response to camelCase for compatibility
      const transformedLinks = (createdLinks || []).map(link => ({
        id: link.id,
        userId: link.user_id,
        platform: link.platform,
        url: link.url,
        displayName: link.display_name,
        createdAt: link.created_at,
        updatedAt: link.updated_at
      }))

      return transformedLinks
    }

    return await getUserSocialLinks(userId)
  } catch (error) {
    console.error('Error updating user social links:', error)
    throw error
  }
}

export async function upsertSocialLink(userId: string, platform: string, url: string, displayName?: string) {
  try {
    if (!url || url.trim() === '') {
      // Remove the social link if URL is empty
      console.log('🔍 Supabase Query: Deleting social link for platform:', platform)
      console.log('📝 Query Details: DELETE FROM social_links WHERE user_id = ? AND platform = ?')
      
      const { error: deleteError } = await supabase
        .from('social_links')
        .delete()
        .eq('user_id', userId)
        .eq('platform', platform)

      if (deleteError) {
        console.error('Error deleting social link:', deleteError)
        throw deleteError
      }
      
      return null
    }

    // Construct full URL from handle if needed
    let fullUrl = url
    const baseUrls: { [key: string]: string } = {
      'instagram': 'https://instagram.com/',
      'facebook': 'https://facebook.com/',
      'linkedin': 'https://linkedin.com/in/',
      'x': 'https://x.com/',
      'twitter': 'https://x.com/',
      'behance': 'https://behance.net/',
      'dribbble': 'https://dribbble.com/'
    }

    if (baseUrls[platform.toLowerCase()] && !fullUrl.startsWith('http')) {
      fullUrl = baseUrls[platform.toLowerCase()] + fullUrl
    }

    // First try to update existing social link
    console.log('🔍 Supabase Query: Upserting social link for platform:', platform)
    console.log('📝 Query Details: UPDATE social_links SET ... WHERE user_id = ? AND platform = ?')
    
    const { data: existingLink, error: selectError } = await supabase
      .from('social_links')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing social link:', selectError)
      throw selectError
    }

    if (existingLink) {
      // Update existing link
      const { data: updatedLink, error: updateError } = await supabase
        .from('social_links')
        .update({
          url: fullUrl,
          display_name: displayName || null,
          updated_at: new Date()
        })
        .eq('user_id', userId)
        .eq('platform', platform)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating social link:', updateError)
        throw updateError
      }

      // Transform to camelCase
      return {
        id: updatedLink.id,
        userId: updatedLink.user_id,
        platform: updatedLink.platform,
        url: updatedLink.url,
        displayName: updatedLink.display_name,
        createdAt: updatedLink.created_at,
        updatedAt: updatedLink.updated_at
      }
    } else {
      // Create new link
      const { data: newLink, error: createError } = await supabase
        .from('social_links')
        .insert({
          user_id: userId,
          platform: platform,
          url: fullUrl,
          display_name: displayName || null,
          created_at: new Date(),
          updated_at: new Date()
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating social link:', createError)
        throw createError
      }

      // Transform to camelCase
      return {
        id: newLink.id,
        userId: newLink.user_id,
        platform: newLink.platform,
        url: newLink.url,
        displayName: newLink.display_name,
        createdAt: newLink.created_at,
        updatedAt: newLink.updated_at
      }
    }
  } catch (error) {
    console.error('Error upserting social link:', error)
    throw error
  }
}
