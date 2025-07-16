
import { prisma } from './prisma'

export async function testConnection(silent = false) {
  try {
    // Test connection by querying the profiles table
    const count = await prisma.profile.count()
    if (!silent) console.log('Database connection successful')
    return true
  } catch (error) {
    if (!silent) console.error('Database connection failed:', error)
    return false
  }
}

export async function getUser(userId: string) {
  try {
    const user = await prisma.profile.findUnique({
      where: {
        id: userId
      }
    })
    
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function getUserProfile(userId: string, type: 'student' | 'mentor' | 'institution') {
  try {
    let profile = null
    
    if (type === 'student') {
      profile = await prisma.studentProfile.findUnique({
        where: {
          id: userId
        }
      })
    } else if (type === 'mentor') {
      profile = await prisma.mentorProfile.findUnique({
        where: {
          id: userId
        }
      })
    } else if (type === 'institution') {
      profile = await prisma.institutionProfile.findUnique({
        where: {
          id: userId
        }
      })
    }
    
    return profile
  } catch (error) {
    console.error(`Error fetching ${type} profile:`, error)
    return null
  }
}
