
"use client"

import { useEffect, ReactNode } from 'react'
import { useClientAuth, initTokenAutoRefresh } from '@/lib/auth-cache'
import { usePathname } from 'next/navigation'

interface ClientAuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
  allowedRoles?: string[]
}

export default function ClientAuthGuard({ 
  children, 
  requireAuth = false, 
  allowedRoles 
}: ClientAuthGuardProps) {
  const pathname = usePathname()
  const { fastAuthCheck, getCurrentRole } = useClientAuth()
  
  useEffect(() => {
    // Initialize auto token refresh
    initTokenAutoRefresh()
    
    // Only check auth if required
    if (requireAuth) {
      const isAuthed = fastAuthCheck(pathname)
      
      if (isAuthed && allowedRoles) {
        const userRole = getCurrentRole()
        if (userRole && !allowedRoles.includes(userRole)) {
          // Role not allowed, redirect to appropriate page
          const roleRedirects = {
            student: '/student/profile',
            mentor: '/mentor/profile',
            institution: '/institution/profile'
          }
          
          window.location.href = roleRedirects[userRole as keyof typeof roleRedirects] || '/'
        }
      }
    }
  }, [pathname, requireAuth, allowedRoles, fastAuthCheck, getCurrentRole])
  
  return <>{children}</>
}

// Specific guards for different page types
export function StudentAuthGuard({ children }: { children: ReactNode }) {
  return (
    <ClientAuthGuard requireAuth={true} allowedRoles={['student']}>
      {children}
    </ClientAuthGuard>
  )
}

export function FastStudentProfileGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useClientAuth()
  
  // Ultra-fast auth check - no role validation for speed
  useEffect(() => {
    if (!isAuthenticated()) {
      // Instant client-side redirect
      window.location.href = '/login?from=' + encodeURIComponent(window.location.pathname)
    }
  }, [isAuthenticated])
  
  return <>{children}</>
}
