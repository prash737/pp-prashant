"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { FastStudentProfileGuard } from '@/components/client-auth-guard'
import { Suspense } from 'react'
import { ProfileSkeleton } from '@/components/profile-skeleton'
import { StudentProfile } from '@/components/student-profile'
import { InternalNavbar } from '@/components/internal-navbar'


export default function StudentProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'student') {
      router.push('/login')
      return
    }

    // Redirect to the user's profile using their ID as handle
    router.push(`/student/profile/${user.id}`)
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
      </div>
    )
  }

  // This component will redirect, so we don't need to render anything else
  return (
    <FastStudentProfileGuard>
      <div className="min-h-screen bg-background">
        <InternalNavbar />
        <main className="container mx-auto px-4 py-6">
          <Suspense fallback={<ProfileSkeleton />}>
            <StudentProfile userId={user?.id || ''} />
          </Suspense>
        </main>
      </div>
    </FastStudentProfileGuard>
  )
}