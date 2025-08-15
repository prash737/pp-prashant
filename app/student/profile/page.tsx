
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

    // Immediate redirect to the user's profile using their ID as handle
    router.replace(`/student/profile/${user.id}`)
  }, [user, loading, router])

  // Return null instead of showing any loading UI
  // since this should redirect immediately
  return null
}
