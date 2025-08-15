
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function StudentProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace('/login')
      return
    }

    if (user.role !== 'student') {
      router.replace('/login')
      return
    }

    // Immediate redirect with no scroll, no loading state
    router.replace(`/student/profile/${user.id}`, { scroll: false })
  }, [user, loading, router])

  // Return null - no UI rendering at all
  return null
}
