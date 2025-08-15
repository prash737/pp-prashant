
"use client"

import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

export default function StudentProfileRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If we reach this page, it means something went wrong with direct routing
    // Redirect to the user's profile if they're authenticated
    if (!loading && user?.id) {
      router.replace(`/student/profile/${user.id}`)
    } else if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  // Show minimal loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pathpiper-teal"></div>
    </div>
  )
}
