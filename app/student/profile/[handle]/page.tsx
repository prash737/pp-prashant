"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, getCachedProfileHeaderData, setCachedProfileHeaderData } from "@/hooks/use-auth"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "@/app/protected-layout"
import StudentProfile from "@/components/profile/student-profile"

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [handle, setHandle] = useState<string | null>(null)
  const [hasCachedData, setHasCachedData] = useState(false)
  const router = useRouter()

  // Resolve params first
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setHandle(resolvedParams.handle)
    }
    resolveParams()
  }, [params])

  // Immediately load cached data when currentUser and handle are available
  useEffect(() => {
    if (!currentUser?.id || !handle) return
    
    // Security check: Users can only view their own profile via handle
    if (handle !== currentUser.id) {
      router.push(`/student/profile/${currentUser.id}`)
      return
    }

    // Immediately try to get cached data for instant rendering
    const cachedData = getCachedProfileHeaderData(currentUser.id)
    if (cachedData) {
      console.log('🚀 Immediate render with cached data for user:', currentUser.id)
      setStudentData(cachedData)
      setHasCachedData(true)
    }
  }, [currentUser?.id, handle, router])

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
        // Only show loading state if we don't have cached data
        if (!hasCachedData) {
          setLoading(true)
        }
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
        // Cache the fetched data for future use
        if (data && currentUser.id) {
          setCachedProfileHeaderData(currentUser.id, data)
        }
        console.log('✅ Fresh data loaded and cached for user:', currentUser.id)
      } catch (err) {
        console.error('Error fetching student data:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [handle, currentUser, authLoading, router, hasCachedData])

  // Only show loading screen if auth is loading AND we don't have cached data AND we don't have handle
  if (authLoading && !handle && !studentData) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex flex-col">
          <InternalNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pathpiper-teal mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </main>
          <Footer />
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
      <div className="min-h-screen flex flex-col">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24">
          {/* Always show StudentProfile immediately with static structure */}
          <StudentProfile
            studentId={currentUser?.id}
            currentUser={currentUser}
            studentData={studentData}
            showStaticStructure={true}
          />
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}