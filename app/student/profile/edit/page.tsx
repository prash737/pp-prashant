'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'

// Minimal loading component that renders immediately
const ProfileEditLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Tab skeleton */}
            <div className="flex gap-4 border-b">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>

            {/* Form skeleton */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>

            {/* Button skeleton */}
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
)

// Dynamically import the heavy form component
const ProfileEditForm = dynamic(
  () => import('@/components/profile/profile-edit-form').then(mod => ({ default: mod.ProfileEditForm })),
  {
    loading: () => <ProfileEditLoading />,
    ssr: false // Client-side only to reduce initial bundle
  }
)

export default function StudentProfileEditPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    // Immediate redirect check with minimal computation
    if (!authLoading) {
      if (!user) {
        router.replace('/login')
        return
      }

      if (user.role !== 'student') {
        router.replace('/profile')
        return
      }

      // User is authenticated and is a student, show the form
      setShowForm(true)
    }
  }, [user, authLoading, router])

  // Show loading immediately while auth checks happen
  if (authLoading || !showForm) {
    return <ProfileEditLoading />
  }

  // Only render the heavy form component after auth is confirmed
  return <ProfileEditForm />
}