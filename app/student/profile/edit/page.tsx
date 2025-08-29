
"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "@/app/protected-layout"
import ProfileEditForm from "@/components/profile/profile-edit-form"

function StudentProfileEditContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    // Immediate redirect without delays for better performance
    if (!authLoading && user) {
      if (user.role !== 'student') {
        if (user.role === 'mentor') {
          router.replace('/mentor/profile')
        } else if (user.role === 'institution') {
          router.replace('/institution/profile')
        } else {
          router.replace('/feed')
        }
        return
      }
    } else if (!authLoading && !user) {
      router.replace('/login')
      return
    }
  }, [user, authLoading, router])

  // Always render page immediately - no blocking
  return (
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
            
            {/* Show page content immediately, handle auth in background */}
            {shouldRedirect ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pathpiper-teal mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    {shouldRedirect === '/login' ? 'Please log in to continue...' : 'Redirecting to your profile...'}
                  </p>
                </div>
              </div>
            ) : authLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pathpiper-teal mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your profile...</p>
                </div>
              </div>
            ) : user && user.role === 'student' ? (
              <ProfileEditForm 
                userId={user.id} 
                initialSection={searchParams.get('section') || undefined}
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pathpiper-teal mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}

export default function StudentProfileEditPage() {
  return (
    <Suspense fallback={
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
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pathpiper-teal mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedLayout>
    }>
      <StudentProfileEditContent />
    </Suspense>
  )
}
