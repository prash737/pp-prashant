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

interface CachedProfileData {
  profile: any
  interests: any[]
  skills: any[]
  educationHistory: any[]
  achievements: any[]
  goals: any[]
}

// Global cache to prevent duplicate API calls across component instances
let globalUserCache: { user: User | null; timestamp: number } | null = null
let globalProfileDataCache: { profileData: CachedProfileData | null; timestamp: number } | null = null
let globalUserPromise: Promise<User | null> | null = null
let globalProfileDataPromise: Promise<CachedProfileData | null> | null = null

// Global cache for profile header data by user ID
let globalProfileHeaderCache: Map<string, { data: any; timestamp: number }> = new Map()
let globalProfileHeaderPromises: Map<string, Promise<any>> = new Map()

// Global cache for public profile data (separate from user's own profile cache)
const globalPublicProfileCache = new Map<string, { data: any; timestamp: number }>()
const globalPublicProfilePromises = new Map<string, Promise<any>>()

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profileData, setProfileData] = useState<CachedProfileData | null>(null)
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
          return
        }

        // If there's already a request in progress, wait for it
        if (globalUserPromise) {
          const cachedUser = await globalUserPromise
          setUser(cachedUser)
          setLoading(false)
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

        // If user is a student, fetch and cache their complete profile data
        if (userData && userData.role === 'student') {
          fetchProfileData(userData.id)
        }
      } catch (error) {
        console.error('Error in useAuth:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchProfileData = async (userId: string) => {
      try {
        // Check if we have valid cached profile data
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
        console.log('🔄 Fetching and caching complete profile data...')

        // Make the API call for complete profile data
        globalProfileDataPromise = fetch(`/api/student/profile/${userId}`, {
          credentials: 'include',
          cache: 'no-store'
        }).then(async (response) => {
          if (response.ok) {
            const data = await response.json()

            const profileData: CachedProfileData = {
              profile: {
                ...data.profile,
                ageGroup: data.ageGroup || 'young_adult',
                educationLevel: data.educationLevel || 'undergraduate'
              },
              interests: data.profile?.userInterests || [],
              skills: data.profile?.userSkills || [],
              educationHistory: data.educationHistory || [],
              achievements: data.profile?.customBadges || [],
              goals: data.profile?.careerGoals || []
            }

            // Cache the result
            globalProfileDataCache = {
              profileData,
              timestamp: Date.now()
            }

            console.log('✅ Profile data cached successfully:', {
              interests: profileData.interests.length,
              skills: profileData.skills.length,
              education: profileData.educationHistory.length,
              goals: profileData.goals.length,
              achievements: profileData.achievements.length
            })

            return profileData
          }
          return null
        }).catch((error) => {
          console.error('Error fetching profile data:', error)
          return null
        }).finally(() => {
          globalProfileDataPromise = null
          setProfileDataLoading(false)
        })

        const data = await globalProfileDataPromise
        setProfileData(data)
      } catch (error) {
        console.error('Error in fetchProfileData:', error)
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
  globalProfileHeaderCache.clear()
  globalProfileHeaderPromises.clear()
  globalPublicProfileCache.clear()
  globalPublicProfilePromises.clear()
}

// Function to completely clear all user data and storage
export function clearAllUserData() {
  // Clear global caches
  invalidateUserCache()

  // Clear profile header cache
  globalProfileHeaderCache.clear()
  globalProfileHeaderPromises.clear()

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
export function getCachedProfileData(): CachedProfileData | null {
  if (globalProfileDataCache && (Date.now() - globalProfileDataCache.timestamp) < CACHE_DURATION) {
    return globalProfileDataCache.profileData
  }
  return null
}

// Profile Header Cache Functions
export function getCachedProfileHeaderData(userId: string): any | null {
  const cached = globalProfileHeaderCache.get(userId)
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data
  }
  return null
}

export function setCachedProfileHeaderData(userId: string, data: any): void {
  globalProfileHeaderCache.set(userId, {
    data,
    timestamp: Date.now()
  })
}

export const fetchAndCacheProfileHeaderData = async (userId: string): Promise<any | null> => {
  // If there's already a request in progress, wait for it
  if (globalProfileHeaderPromises.has(userId)) {
    return globalProfileHeaderPromises.get(userId)!
  }

  // Check if we have valid cached data
  const cachedData = getCachedProfileHeaderData(userId)
  if (cachedData) {
    return Promise.resolve(cachedData)
  }

  // Make the API call
  const promise = fetch(`/api/student/profile/${userId}`, {
    credentials: 'include',
    cache: 'no-store'
  }).then(async (response) => {
    if (response.ok) {
      const data = await response.json()

      // Cache the result
      setCachedProfileHeaderData(userId, data)

      console.log('✅ Profile header data cached for user:', userId)
      return data
    }
    throw new Error('Failed to fetch profile header data')
  }).catch((error) => {
    console.error('Error fetching profile header data:', error)
    return null
  }).finally(() => {
    globalProfileHeaderPromises.delete(userId)
  })

  globalProfileHeaderPromises.set(userId, promise)
  return promise
}

// Public profile cache functions
export const getCachedPublicProfileData = (userId: string): any | null => {
  const cached = globalPublicProfileCache.get(userId)
  if (!cached) return null

  // Check if cache is expired
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    globalPublicProfileCache.delete(userId)
    return null
  }

  return cached.data
}

export const setCachedPublicProfileData = (userId: string, data: any) => {
  globalPublicProfileCache.set(userId, {
    data,
    timestamp: Date.now()
  })
}

// Public profile fetch and cache function
export const fetchAndCachePublicProfileData = async (userId: string): Promise<any | null> => {
  // If there's already a request in progress, wait for it
  if (globalPublicProfilePromises.has(userId)) {
    return globalPublicProfilePromises.get(userId)!
  }

  // Check if we have valid cached data
  const cachedData = getCachedPublicProfileData(userId)
  if (cachedData) {
    return Promise.resolve(cachedData)
  }

  // Make the API call for public profile
  const promise = fetch(`/api/student/profile/${userId}`, {
    credentials: 'include',
    cache: 'no-store'
  }).then(async (response) => {
    if (response.ok) {
      const data = await response.json()

      // Cache the result in public profile cache
      setCachedPublicProfileData(userId, data)

      console.log('✅ Public profile data cached for user:', userId)
      return data
    }
    throw new Error('Failed to fetch public profile data')
  }).catch((error) => {
    console.error('Error fetching public profile data:', error)
    return null
  }).finally(() => {
    globalPublicProfilePromises.delete(userId)
  })

  globalPublicProfilePromises.set(userId, promise)
  return promise
}