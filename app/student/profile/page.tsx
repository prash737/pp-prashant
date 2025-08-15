
"use client"

import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import InternalNavbar from '@/components/internal-navbar'
import Footer from '@/components/footer'
import PipLoader from '@/components/loading/pip-loader'

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

  // Show profile skeleton structure while redirecting
  return (
    <div className="min-h-screen flex flex-col relative">
      <InternalNavbar />
      <main className="flex-grow pt-16 sm:pt-24 blur-sm">
        {/* Skeleton Profile Structure */}
        <div className="container mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="flex-grow space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Content Sections Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
                <div className="flex flex-wrap gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Loading overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <PipLoader 
          isVisible={true} 
          userType="student"
          onComplete={() => {}}
        />
      </div>
    </div>
  )
}
