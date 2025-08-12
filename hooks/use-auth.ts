
"use client"

import { useEffect, useState, useRef } from 'react'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  bio?: string
  location?: string
  profileImageUrl?: string
  [key: string]: any
}

interface ComprehensiveProfileData {
  profile: any
  interests: any[]
  skills: any[]
  educationHistory: any[]
  achievements: any[]
  goals: any[]
  connections: any
  followingInstitutions: any
  circles: any
  connectionRequests?: any
  circleInvitations?: any
  suggestedConnections?: any[]
}

// Global cache to prevent duplicate API calls across component instances
let globalUserCache: { user: User | null; timestamp: number } | null = null
let globalProfileDataCache: { profileData: ComprehensiveProfileData | null; timestamp: number } | null = null
let globalUserPromise: Promise<User | null> | null = null
let globalProfileDataPromise: Promise<ComprehensiveProfileData | null> | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profileData, setProfileData] = useState<ComprehensiveProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileDataLoading, setProfileDataLoading] = useState(false)
  const hasFetched = useRef(false)

  useEffect(() => {
    // Prevent duplicate calls in StrictMode
    if (hasFetched.current) return
    hasFetched.current = true

    const fetchUser = async () => {
      try {
        // Check if we have valid cached data
        if (globalUserCache && (Date.now() - globalUserCache.timestamp) < CACHE_DURATION) {
          setUser(globalUserCache.user)
          setLoading(false)
          
          // If user is a student and we have cached profile data, use it
          if (globalUserCache.user?.role === 'student' && 
              globalProfileDataCache && 
              (Date.now() - globalProfileDataCache.timestamp) < CACHE_DURATION) {
            setProfileData(globalProfileDataCache.profileData)
          } else if (globalUserCache.user?.role === 'student') {
            fetchComprehensiveProfileData(globalUserCache.user.id)
          }
          return
        }

        // If there's already a request in progress, wait for it
        if (globalUserPromise) {
          const cachedUser = await globalUserPromise
          setUser(cachedUser)
          setLoading(false)
          if (cachedUser?.role === 'student') {
            fetchComprehensiveProfileData(cachedUser.id)
          }
          return
        }

        // Make the API call
        globalUserPromise = fetch('/api/auth/user', {
          credentials: 'include',
          cache: 'no-store'
        }).then(async (response) => {
          if (response.ok) {
            const data = await response.json()
            const userData = data.user

            // Cache the result
            globalUserCache = {
              user: userData,
              timestamp: Date.now()
            }

            // Store user session info in localStorage for persistence
            try {
              localStorage.setItem('user_session_timestamp', Date.now().toString())
              localStorage.setItem('user_role', userData.role)
              localStorage.setItem('user_id', userData.id)
            } catch (error) {
              console.error('Error storing session info:', error)
            }

            return userData
          } else {
            // Clear any stale session data if request fails
            try {
              localStorage.removeItem('user_session_timestamp')
              localStorage.removeItem('user_role')
              localStorage.removeItem('user_id')
            } catch (error) {
              console.error('Error clearing session info:', error)
            }
          }
          return null
        }).catch((error) => {
          console.error('Error fetching user:', error)
          // Clear session data on error
          try {
            localStorage.removeItem('user_session_timestamp')
            localStorage.removeItem('user_role')
            localStorage.removeItem('user_id')
          } catch (error) {
            console.error('Error clearing session info:', error)
          }
          return null
        }).finally(() => {
          globalUserPromise = null
        })

        const userData = await globalUserPromise
        setUser(userData)

        // If user is a student, fetch comprehensive profile data
        if (userData && userData.role === 'student') {
          fetchComprehensiveProfileData(userData.id)
        }
      } catch (error) {
        console.error('Error in useAuth:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchComprehensiveProfileData = async (userId: string) => {
      try {
        // Check if we have valid cached comprehensive profile data
        if (globalProfileDataCache && (Date.now() - globalProfileDataCache.timestamp) < CACHE_DURATION) {
          setProfileData(globalProfileDataCache.profileData)
          return
        }

        // If there's already a request in progress, wait for it
        if (globalProfileDataPromise) {
          const cachedData = await globalProfileDataPromise
          setProfileData(cachedData)
          return
        }

        setProfileDataLoading(true)
        console.log('🔄 Fetching comprehensive profile data in single API call...')

        // Make the single comprehensive API call
        globalProfileDataPromise = fetch(`/api/student/profile/${userId}`, {
          credentials: 'include',
          cache: 'no-store'
        }).then(async (response) => {
          if (response.ok) {
            const data = await response.json()

            const profileData: ComprehensiveProfileData = {
              profile: {
                ...data.profile,
                ageGroup: data.ageGroup || 'young_adult',
                educationLevel: data.educationLevel || 'undergraduate'
              },
              interests: data.profile?.userInterests || [],
              skills: data.profile?.userSkills || [],
              educationHistory: data.educationHistory || [],
              achievements: data.profile?.achievements || data.profile?.customBadges || [],
              goals: data.profile?.goals || [],
              connections: data.connections || { list: [], counts: {}, total: 0 },
              followingInstitutions: data.followingInstitutions || { list: [], count: 0 },
              circles: data.circles || { list: [], count: 0 },
              connectionRequests: data.connectionRequests || { received: [], sent: [] },
              circleInvitations: data.circleInvitations || [],
              suggestedConnections: data.suggestedConnections || []
            }

            // Cache the result
            globalProfileDataCache = {
              profileData,
              timestamp: Date.now()
            }

            console.log('✅ Comprehensive profile data cached successfully:', {
              interests: profileData.interests.length,
              skills: profileData.skills.length,
              education: profileData.educationHistory.length,
              goals: profileData.goals.length,
              achievements: profileData.achievements.length,
              connections: profileData.connections.total,
              circles: profileData.circles.count,
              following: profileData.followingInstitutions.count
            })

            return profileData
          }
          return null
        }).catch((error) => {
          console.error('Error fetching comprehensive profile data:', error)
          return null
        }).finally(() => {
          globalProfileDataPromise = null
          setProfileDataLoading(false)
        })

        const data = await globalProfileDataPromise
        setProfileData(data)
      } catch (error) {
        console.error('Error in fetchComprehensiveProfileData:', error)
        setProfileDataLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading, profileData, profileDataLoading }
}

// Function to invalidate cache and clear all storage (useful after login/logout)
export function invalidateUserCache() {
  globalUserCache = null
  globalUserPromise = null
  globalProfileDataCache = null
  globalProfileDataPromise = null
}

// Function to completely clear all user data and storage
export function clearAllUserData() {
  // Clear global caches
  invalidateUserCache()

  // Clear localStorage
  if (typeof window !== 'undefined') {
    try {
      // Clear all localStorage
      localStorage.clear()

      // Clear sessionStorage
      sessionStorage.clear()

      // Clear IndexedDB if it exists
      if ('indexedDB' in window) {
        indexedDB.databases?.().then(databases => {
          databases.forEach(db => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name)
            }
          })
        }).catch(() => {
          // Ignore errors when clearing IndexedDB
        })
      }

      // Clear any Supabase-specific storage
      const supabaseKeys = [
        'supabase.auth.token',
        'sb-access-token',
        'sb-refresh-token',
        'sb-user-id'
      ]

      supabaseKeys.forEach(key => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })

      console.log('✅ All user data and storage cleared')
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
  }
}

// Function to get cached profile data without triggering a fetch
export function getCachedProfileData(): ComprehensiveProfileData | null {
  if (globalProfileDataCache && (Date.now() - globalProfileDataCache.timestamp) < CACHE_DURATION) {
    return globalProfileDataCache.profileData
  }
  return null
}
