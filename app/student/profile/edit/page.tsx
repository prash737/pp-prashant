
"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "@/app/protected-layout"
import dynamic from "next/dynamic"

// Dynamic imports for heavy components - only load when needed
const ProfileEditForm = dynamic(() => import("@/components/profile/profile-edit-form"), {
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pathpiper-teal mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile editor...</p>
      </div>
    </div>
  ),
  ssr: false
})

// Static components that should load immediately
const StaticPageLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedLayout>
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <InternalNavbar />
      <main className="flex-grow pt-16 sm:pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Update your profile information to help others get to know you better
            </p>
          </div>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  </ProtectedLayout>
)

// Loading skeleton for the form
const FormLoadingSkeleton = () => (
  <div className="space-y-8">
    {/* Header skeleton */}
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
    
    {/* Form sections skeleton */}
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-2">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
)

function StudentProfileEditContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    // Only perform auth checks after component has mounted and rendered
    if (!authLoading && user) {
      if (user.role !== 'student') {
        // Set redirect target but don't redirect immediately
        if (user.role === 'mentor') {
          setShouldRedirect('/mentor/profile')
        } else if (user.role === 'institution') {
          setShouldRedirect('/institution/profile')
        } else {
          setShouldRedirect('/feed')
        }
      } else {
        // User is a student, show the form after a short delay to ensure page renders first
        const timer = setTimeout(() => {
          setShowForm(true)
        }, 100)
        return () => clearTimeout(timer)
      }
    } else if (!authLoading && !user) {
      // Set login redirect but don't redirect immediately
      setShouldRedirect('/login')
    }
  }, [user, authLoading])

  // Perform redirects after a short delay to allow page to render first
  useEffect(() => {
    if (shouldRedirect) {
      const timer = setTimeout(() => {
        router.push(shouldRedirect)
      }, 500) // Small delay to show page loaded
      return () => clearTimeout(timer)
    }
  }, [shouldRedirect, router])

  // Redirect screens
  if (shouldRedirect) {
    return (
      <StaticPageLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pathpiper-teal mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {shouldRedirect === '/login' ? 'Please log in to continue...' : 'Redirecting to your profile...'}
            </p>
          </div>
        </div>
      </StaticPageLayout>
    )
  }

  // Auth loading screen
  if (authLoading) {
    return (
      <StaticPageLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pathpiper-teal mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your profile...</p>
          </div>
        </div>
      </StaticPageLayout>
    )
  }

  // Main content for authenticated students
  if (user && user.role === 'student') {
    return (
      <StaticPageLayout>
        {showForm ? (
          <ProfileEditForm 
            userId={user.id} 
            initialSection={searchParams.get('section') || undefined}
          />
        ) : (
          <FormLoadingSkeleton />
        )}
      </StaticPageLayout>
    )
  }

  // Fallback loading state
  return (
    <StaticPageLayout>
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pathpiper-teal mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    </StaticPageLayout>
  )
}

export default function StudentProfileEditPage() {
  return (
    <Suspense fallback={
      <StaticPageLayout>
        <FormLoadingSkeleton />
      </StaticPageLayout>
    }>
      <StudentProfileEditContent />
    </Suspense>
  )
}
