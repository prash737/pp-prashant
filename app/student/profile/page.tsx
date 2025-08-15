"use client"

import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

export default function StudentProfileRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) {
      return
    }

    if (user?.id) {
      // Immediate redirect with replace to avoid history entry
      router.replace(`/student/profile/${user.id}`)
    }
  }, [user, loading, router])

  // Return completely empty - no rendering at all
  return null
}