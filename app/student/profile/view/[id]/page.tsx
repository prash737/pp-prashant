"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
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

export default function ViewProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { user: currentUser, loading: authLoading } = useAuth()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const router = useRouter()

  // Resolve params first
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setProfileId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (authLoading || !profileId) return

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

    // If trying to view their own profile, redirect to their own profile page
    if (profileId === currentUser.id) {
      router.push(`/student/profile/${currentUser.id}`)
      return
    }

    // Fetch student data with optimized unified API
    const fetchStudentData = async () => {
      const startTime = Date.now()
      console.log('⏱️ [STUDENT-PROFILE-VIEW] Fetching profile data...')

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/student/profile-data?studentId=${profileId}`, {
          credentials: 'include',
          headers: {
            'Cache-Control': 'max-age=300', // 5 minute cache
          }
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

        console.log(`✅ [STUDENT-PROFILE-VIEW] Profile loaded in ${Date.now() - startTime}ms`)
      } catch (err) {
        console.error('Error fetching student data:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [profileId, currentUser, authLoading, router])

  if (authLoading || loading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex flex-col">
          <InternalNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
              <p className="mt-4 text-gray-600">Loading profile...</p>
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
                onClick={() => router.back()}
                className="bg-pathpiper-teal text-white px-4 py-2 rounded hover:bg-pathpiper-teal/90 mr-2"
              >
                Go Back
              </button>
              <button
                onClick={() => router.push('/student/profile')}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                My Profile
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
          {studentData && (
            <StudentProfile
              studentId={profileId!}
              currentUser={currentUser}
              studentData={studentData}
              isViewMode={true} // This prop will indicate it's a view-only mode
            />
          )}
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}