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
// Global caches for profile data with timestamps
let globalProfileDataCache: { profileData: any; timestamp: number } | null = null
let globalUserPromise: Promise<User | null> | null = null
let globalProfileDataPromise: Promise<any> | null = null

// Profile header data cache (lighter weight for immediate display)
const globalProfileHeaderCache = new Map<string, { data: any; timestamp: number }>()
const globalProfileHeaderPromises = new Map<string, Promise<any>>()

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const STORAGE_KEY_PREFIX = 'pathpiper_profile_'
const STORAGE_HEADER_KEY_PREFIX = 'pathpiper_header_'

// Helper functions for localStorage persistence
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

const getFromStorage = (key: string) => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.warn('Failed to read from localStorage:', error)
    return null
  }
}

const removeFromStorage = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error)
  }
}

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
        const cachedData = getCachedCompleteProfileData(userId)
        if (cachedData) {
          setProfileData(cachedData)
          return
        }

        // If there's already a request in progress, wait for it
        if (globalProfileDataPromise) {
          const data = await globalProfileDataPromise
          setProfileData(data)
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

            // Cache the complete profile data in both memory and localStorage
            setCachedCompleteProfileData(userId, data)

            console.log('✅ Complete profile data cached')
            return data
          }
          throw new Error('Failed to fetch complete profile data')
        }).catch((error) => {
          console.error('Error fetching complete profile data:', error)
          return null
        }).finally(() => {
          globalProfileDataPromise = null
          setProfileDataLoading(false)
        })

        const profileData = await globalProfileDataPromise
        if (profileData) {
          setProfileData(profileData)
        }
      } catch (error) {
        console.error('Error in fetchProfileData:', error)
        setProfileDataLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading, profileData, profileDataLoading, getCachedCompleteProfileData, setCachedCompleteProfileData }
}

// Function to invalidate cache and clear all storage (useful after login/logout)
export function invalidateUserCache() {
  globalUserCache = null
  globalUserPromise = null
  globalProfileDataCache = null
  globalProfileDataPromise = null
  globalProfileHeaderCache.clear()
  globalProfileHeaderPromises.clear()
  // Clear localStorage associated with profiles
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('pathpiper_')) {
      removeFromStorage(key)
    }
  })
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

// Function to get cached complete profile data
export function getCachedCompleteProfileData(userId: string): CachedProfileData | null {
  // First check memory cache
  const memoryCache = globalProfileDataCache
  if (memoryCache && (Date.now() - memoryCache.timestamp) < CACHE_DURATION) {
    return memoryCache.profileData
  }

  // Then check localStorage
  const storageKey = `${STORAGE_KEY_PREFIX}${userId}`
  const storedCache = getFromStorage(storageKey)
  if (storedCache && (Date.now() - storedCache.timestamp) < CACHE_DURATION) {
    // Restore to memory cache
    globalProfileDataCache = storedCache
    return storedCache.profileData
  }

  return null
}

// Function to set cached complete profile data
export function setCachedCompleteProfileData(userId: string, data: any) {
  const cacheObject = {
    profileData: data,
    timestamp: Date.now()
  }

  // Save to memory cache
  globalProfileDataCache = cacheObject

  // Save to localStorage
  const storageKey = `${STORAGE_KEY_PREFIX}${userId}`
  saveToStorage(storageKey, cacheObject)
}

// Get cached profile header data
export const getCachedProfileHeaderData = (userId: string) => {
  // First check memory cache
  const memoryCache = globalProfileHeaderCache.get(userId)
  if (memoryCache && (Date.now() - memoryCache.timestamp) < CACHE_DURATION) {
    return memoryCache.data
  }

  // Then check localStorage
  const storageKey = `${STORAGE_HEADER_KEY_PREFIX}${userId}`
  const storedCache = getFromStorage(storageKey)
  if (storedCache && (Date.now() - storedCache.timestamp) < CACHE_DURATION) {
    // Restore to memory cache
    globalProfileHeaderCache.set(userId, storedCache)
    return storedCache.data
  }

  return null
}

// Set cached profile header data
export const setCachedProfileHeaderData = (userId: string, data: any) => {
  const cacheObject = {
    data,
    timestamp: Date.now()
  }

  // Save to memory cache
  globalProfileHeaderCache.set(userId, cacheObject)

  // Save to localStorage
  const storageKey = `${STORAGE_HEADER_KEY_PREFIX}${userId}`
  saveToStorage(storageKey, cacheObject)
}

export function fetchAndCacheProfileHeaderData(userId: string): Promise<any> {
  // Check if there's already a request in progress
  const existingPromise = globalProfileHeaderPromises.get(userId)
  if (existingPromise) {
    return existingPromise
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