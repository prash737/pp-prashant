
"use server"

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface CachedAuth {
  user: any
  timestamp: number
}

// In-memory cache with 5-minute TTL
const authCache = new Map<string, CachedAuth>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getCachedAuthUser(request?: Request) {
  try {
    // Get cookies from either NextRequest or direct access
    let cookieStore
    if (request) {
      const cookieHeader = request.headers.get('cookie') || ''
      const cookies = Object.fromEntries(
        cookieHeader.split(';').map(cookie => {
          const [name, ...rest] = cookie.trim().split('=')
          return [name, decodeURIComponent(rest.join('='))]
        })
      )
      cookieStore = cookies
    } else {
      const nextCookies = await cookies()
      cookieStore = {
        'sb-access-token': nextCookies.get('sb-access-token')?.value
      }
    }

    const accessToken = cookieStore['sb-access-token']
    if (!accessToken) {
      return { user: null, error: 'No access token' }
    }

    // Check cache first
    const cached = authCache.get(accessToken)
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return { user: cached.user, error: null }
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      authCache.delete(accessToken)
      return { user: null, error: 'Invalid token' }
    }

    // Cache the result
    authCache.set(accessToken, {
      user,
      timestamp: Date.now()
    })

    return { user, error: null }
  } catch (error) {
    console.error('Auth cache error:', error)
    return { user: null, error: 'Auth verification failed' }
  }
}

// Clear cache for specific token (useful for logout)
export function clearAuthCache(accessToken: string) {
  authCache.delete(accessToken)
}

// Clear all expired entries (cleanup function)
export function cleanupAuthCache() {
  const now = Date.now()
  for (const [token, cached] of authCache.entries()) {
    if (now - cached.timestamp > CACHE_TTL) {
      authCache.delete(token)
    }
  }
}
