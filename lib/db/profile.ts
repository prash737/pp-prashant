
'use server'

import { prisma } from '../prisma'

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
    const socialLinks = await prisma.socialLink.findMany({
      where: { userId: userId }
    })
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
    // Delete existing social links for the user
    await prisma.socialLink.deleteMany({
      where: { userId: userId }
    })

    // Create new social links
    if (socialLinksData.length > 0) {
      await prisma.socialLink.createMany({
        data: socialLinksData.map(link => ({
          userId: userId,
          platform: link.platform,
          url: link.url,
          displayName: link.displayName
        }))
      })
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
      await prisma.socialLink.deleteMany({
        where: { 
          userId: userId,
          platform: platform
        }
      })
      return null
    }

    const socialLink = await prisma.socialLink.upsert({
      where: {
        userId_platform: {
          userId: userId,
          platform: platform
        }
      },
      update: {
        url: url,
        displayName: displayName
      },
      create: {
        userId: userId,
        platform: platform,
        url: url,
        displayName: displayName
      }
    })

    return socialLink
  } catch (error) {
    console.error('Error upserting social link:', error)
    throw error
  }
}
