
"use client"

interface AuthCache {
  token: string | null
  userId: string | null
  role: string | null
  timestamp: number
  expiresAt: number
}

interface TokenRefreshResponse {
  success: boolean
  token?: string
  user?: any
  error?: string
}

const AUTH_CACHE_KEY = 'pathpiper_auth_cache'
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes
const REFRESH_THRESHOLD = 5 * 60 * 1000 // Refresh when 5 minutes left

// Client-side auth cache manager
export class AuthCacheManager {
  private static instance: AuthCacheManager
  
  static getInstance(): AuthCacheManager {
    if (!AuthCacheManager.instance) {
      AuthCacheManager.instance = new AuthCacheManager()
    }
    return AuthCacheManager.instance
  }

  // Get cached auth data
  getCachedAuth(): AuthCache | null {
    try {
      const cached = localStorage.getItem(AUTH_CACHE_KEY)
      if (!cached) return null
      
      const authData: AuthCache = JSON.parse(cached)
      
      // Check if cache is expired
      if (Date.now() > authData.expiresAt) {
        this.clearCache()
        return null
      }
      
      return authData
    } catch (error) {
      console.error('Error reading auth cache:', error)
      this.clearCache()
      return null
    }
  }

  // Set auth cache
  setCachedAuth(token: string, userId: string, role: string): void {
    try {
      const authData: AuthCache = {
        token,
        userId,
        role,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION
      }
      
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(authData))
      
      // Also cache in sessionStorage for immediate access
      sessionStorage.setItem('current_user_role', role)
      sessionStorage.setItem('current_user_id', userId)
      
      // Set cookie for server access
      document.cookie = `sb-access-token=${token}; path=/; max-age=${CACHE_DURATION / 1000}; SameSite=Lax`
      
    } catch (error) {
      console.error('Error setting auth cache:', error)
    }
  }

  // Check if token needs refresh
  needsRefresh(): boolean {
    const cached = this.getCachedAuth()
    if (!cached) return false
    
    const timeLeft = cached.expiresAt - Date.now()
    return timeLeft <= REFRESH_THRESHOLD
  }

  // Refresh token
  async refreshToken(): Promise<boolean> {
    try {
      const cached = this.getCachedAuth()
      if (!cached || !cached.token) return false

      console.log('🔄 Refreshing auth token...')
      
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cached.token}`
        },
        credentials: 'include'
      })

      if (!response.ok) {
        console.log('❌ Token refresh failed')
        this.clearCache()
        return false
      }

      const data: TokenRefreshResponse = await response.json()
      
      if (data.success && data.token && data.user) {
        console.log('✅ Token refreshed successfully')
        this.setCachedAuth(data.token, data.user.id, data.user.role)
        return true
      } else {
        console.log('❌ Token refresh unsuccessful')
        this.clearCache()
        return false
      }

    } catch (error) {
      console.error('Error refreshing token:', error)
      this.clearCache()
      return false
    }
  }

  // Clear all cached auth data
  clearCache(): void {
    try {
      localStorage.removeItem(AUTH_CACHE_KEY)
      sessionStorage.removeItem('current_user_role')
      sessionStorage.removeItem('current_user_id')
      
      // Clear auth cookies
      document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      
    } catch (error) {
      console.error('Error clearing auth cache:', error)
    }
  }

  // Quick auth check for client-side routing
  isAuthenticated(): boolean {
    const cached = this.getCachedAuth()
    return cached !== null && cached.token !== null
  }

  // Get current user role quickly
  getCurrentRole(): string | null {
    try {
      return sessionStorage.getItem('current_user_role') || this.getCachedAuth()?.role || null
    } catch {
      return null
    }
  }

  // Get current user ID quickly
  getCurrentUserId(): string | null {
    try {
      return sessionStorage.getItem('current_user_id') || this.getCachedAuth()?.userId || null
    } catch {
      return null
    }
  }
}

// Client-side route guard hook
export function useClientAuth() {
  const authCache = AuthCacheManager.getInstance()
  
  const checkAuthAndRedirect = (requiredPath: string) => {
    // Quick check first
    if (!authCache.isAuthenticated()) {
      // Client-side redirect - much faster than middleware redirect
      window.location.href = `/login?from=${encodeURIComponent(requiredPath)}`
      return false
    }
    
    // Check if token needs refresh
    if (authCache.needsRefresh()) {
      authCache.refreshToken().catch(() => {
        console.log('Token refresh failed, redirecting to login')
        window.location.href = `/login?from=${encodeURIComponent(requiredPath)}`
      })
    }
    
    return true
  }
  
  const isStudentProfile = (path: string) => {
    return path.startsWith('/student/profile')
  }
  
  const fastAuthCheck = (currentPath: string) => {
    // Ultra-fast check for student profiles
    if (isStudentProfile(currentPath)) {
      return authCache.isAuthenticated()
    }
    
    return checkAuthAndRedirect(currentPath)
  }
  
  return {
    isAuthenticated: authCache.isAuthenticated.bind(authCache),
    getCurrentRole: authCache.getCurrentRole.bind(authCache),
    getCurrentUserId: authCache.getCurrentUserId.bind(authCache),
    checkAuthAndRedirect,
    fastAuthCheck,
    refreshToken: authCache.refreshToken.bind(authCache),
    clearCache: authCache.clearCache.bind(authCache)
  }
}

// Auto-refresh token in background
export function initTokenAutoRefresh() {
  if (typeof window === 'undefined') return
  
  const authCache = AuthCacheManager.getInstance()
  
  // Check every 2 minutes if token needs refresh
  setInterval(() => {
    if (authCache.needsRefresh()) {
      authCache.refreshToken().catch(console.error)
    }
  }, 2 * 60 * 1000)
}
