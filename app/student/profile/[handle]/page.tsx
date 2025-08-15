"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "@/app/protected-layout"
import StudentProfile from "@/components/profile/student-profile"
import PipLoader from "@/components/loading/pip-loader"

interface StudentData {
  id: string
  profile: {
    firstName: string
    lastName: string
    bio?: string
    location?: string
    profileImageUrl?: string
    userInterests: Array<{
      interest: {
        name: string
        category: { name: string }
      }
    }>
    userSkills: Array<{
      skill: {
        name: string
        category: { name: string }
      }
    }>
  }
  educationHistory: Array<{
    id: string
    institutionName: string
    degree?: string
    fieldOfStudy?: string
    startDate: string
    endDate?: string
    current: boolean
  }>
}

export default function StudentProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { user: currentUser, loading: authLoading } = useAuth()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [handle, setHandle] = useState<string | null>(null)
  const [profileDataLoaded, setProfileDataLoaded] = useState(false)
  const [showPipLoader, setShowPipLoader] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const router = useRouter()
  // Resolve params first
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setHandle(resolvedParams.handle)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (authLoading || !handle) return

    if (!currentUser) {
      router.push('/login')
      return
    }

    // Redirect non-students to their appropriate profile pages
    if (currentUser.role !== 'student') {
      if (currentUser.role === 'mentor') {
        router.push('/mentor/profile')
      } else if (currentUser.role === 'institution') {
        router.push('/institution/profile')
      } else {
        router.push('/feed')
      }
      return
    }

    // Security check: Users can only view their own profile via handle
    // If the handle doesn't match their user ID, redirect to their own profile
    if (handle !== currentUser.id) {
      router.push(`/student/profile/${currentUser.id}`)
      return
    }

    // Fetch student data - now we know it's the current user's profile
    const fetchStudentData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/student/profile/${currentUser.id}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          if (response.status === 404) {
            setError('Profile not found')
          } else if (response.status === 403) {
            setError('Access denied')
          } else {
            setError('Failed to load profile')
          }
          return
        }

        const data = await response.json()
        setStudentData(data)
        setProfileDataLoaded(true)
        
        // If this is the initial load, keep PipLoader for smooth transition
        // If it's a subsequent load, hide immediately
        if (initialLoad) {
          setTimeout(() => {
            setShowPipLoader(false)
            setInitialLoad(false)
          }, 2000) // Keep PipLoader for 2 seconds on initial load
        } else {
          setShowPipLoader(false)
        }
      } catch (err) {
        console.error('Error fetching student data:', err)
        setError('Failed to load profile')
        setShowPipLoader(false)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [handle, currentUser, authLoading, router])

  // Show immediate skeleton structure with blur while loading
  if (authLoading || loading || !studentData) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex flex-col relative">
          <InternalNavbar />
          <main className={`flex-grow pt-16 sm:pt-24 transition-all duration-500 ${(authLoading || loading || !studentData) ? 'blur-sm' : 'blur-none'}`}>
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
                    <div className="flex gap-2">
                      <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                      <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Grid Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* About Section Skeleton */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Education Section Skeleton */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
                    <div className="space-y-4">
                      <div className="border rounded p-4">
                        <div className="h-5 bg-gray-200 rounded w-2/3 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Interests Section Skeleton */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
                    <div className="flex flex-wrap gap-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                      ))}
                    </div>
                  </div>

                  {/* Skills Section Skeleton */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
                    <div className="flex flex-wrap gap-2">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                      ))}
                    </div>
                  </div>

                  {/* Goals Section Skeleton */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="border rounded p-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
          
          {/* Show PipLoader overlay during loading */}
          {(authLoading || loading || !studentData) && (
            <div className="fixed inset-0 z-50">
              <PipLoader 
                isVisible={true} 
                userType="student"
                onComplete={() => {}}
              />
            </div>
          )}
        </div>
      </ProtectedLayout>
    )
  }

  if (error) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex flex-col">
          <InternalNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => router.push('/student/profile')}
                className="bg-pathpiper-teal text-white px-4 py-2 rounded hover:bg-pathpiper-teal/90"
              >
                Go to My Profile
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen flex flex-col relative">
        <InternalNavbar />
        <main className={`flex-grow pt-16 sm:pt-24 transition-all duration-500 ${showPipLoader ? 'blur-sm' : 'blur-none'}`}>
          {studentData && (
            <>
              <StudentProfile
                studentId={currentUser.id}
                currentUser={currentUser}
                studentData={studentData}
              />
            </>
          )}
        </main>
        <Footer />
        
        {/* PipLoader Overlay */}
        {showPipLoader && (
          <div className="fixed inset-0 z-50">
            <PipLoader 
              isVisible={showPipLoader} 
              userType="student"
              onComplete={() => {
                // This will be called when PipLoader completes its animation
                setShowPipLoader(false)
              }}
            />
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}