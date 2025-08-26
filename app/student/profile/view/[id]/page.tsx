"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, getCachedProfileHeaderData, fetchAndCacheProfileHeaderData } from "@/hooks/use-auth"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "@/app/protected-layout"
import ProfileHeader from "@/components/profile/profile-header"
import StudentProfile from "@/components/profile/student-profile"

interface StudentData {
  id: string
  profile: {
    firstName: string
    lastName: string
    bio?: string
    location?: string
    profileImageUrl?: string
    coverImageUrl?: string
    tagline?: string
    verificationStatus?: string
    skills?: any[]
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
    socialLinks?: any[]
  }
  educationHistory: Array<{
    id: string
    institutionName: string
    degree?: string
    fieldOfStudy?: string
    startDate: string
    endDate?: string
    current: boolean
    gradeLevel?: string
    grade_level?: string
    institution_name?: string
    is_current?: boolean
  }>
  circles?: any[]
  connections?: any[]
  connectionCounts?: {
    total: number
    students: number
    mentors: number
    institutions: number
  }
  followingInstitutions?: any[]
  achievements?: any[]
  connectionRequestsSent?: any[]
  connectionRequestsReceived?: any[]
  circleInvitations?: any[]
}

export default function ViewProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { user: currentUser, loading: authLoading } = useAuth()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [profileHeaderData, setProfileHeaderData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [circlesUpdateKey, setCirclesUpdateKey] = useState(0)
  const router = useRouter()

  // Resolve params first
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setProfileId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  // Get cached data immediately
  useEffect(() => {
    if (!profileId) return

    const cachedData = getCachedProfileHeaderData(profileId)
    if (cachedData) {
      setProfileHeaderData(cachedData)
    }
  }, [profileId])

  // Priority fetch for profile header data - fetch immediately when profileId is available
  useEffect(() => {
    if (authLoading || !profileId || !currentUser) return

    // If trying to view their own profile, redirect to their own profile page
    if (profileId === currentUser.id) {
      router.push(`/student/profile/${currentUser.id}`)
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

    const cachedData = getCachedProfileHeaderData(profileId)

    console.log('🔥 Starting priority fetch for profile header...')

    // Always fetch fresh data in background (whether we had cached data or not)
    const fetchFreshData = async () => {
      try {
        setLoading(!cachedData) // Only show loading if we don't have cached data

        const freshData = await fetchAndCacheProfileHeaderData(profileId)

        if (freshData) {
          console.log('✅ Fresh profile header data fetched and cached')
          setProfileHeaderData(freshData)
        } else {
          throw new Error('Failed to fetch fresh data')
        }

      } catch (error) {
        console.error('❌ Error fetching fresh profile header data:', error)
        // Only set error if we don't have cached data to fall back on
        if (!cachedData) {
          setError('Failed to load profile data')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchFreshData()
  }, [profileId, currentUser, authLoading, router])

  const handleGoBack = () => {
    router.back()
  }

  const handleCirclesUpdate = () => {
    setCirclesUpdateKey(prev => prev + 1)
    // Also refresh the cached data when circles are updated
    if (profileId) {
      fetchAndCacheProfileHeaderData(profileId).then(freshData => {
        if (freshData) {
          setProfileHeaderData(freshData)
        }
      })
    }
  }

  // Show error state
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

  // Show loading only if auth is still loading and we don't have profileId
  if (authLoading && !profileId) {
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

  return (
    <ProtectedLayout>
      <div className="min-h-screen flex flex-col">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24">
          {/* Always show profile header immediately with static content or fetched data */}
          <ProfileHeader
            student={profileHeaderData || {
              id: profileId!,
              profile: {
                firstName: "Loading...",
                lastName: "",
                userInterests: [],
                userSkills: []
              },
              educationHistory: []
            }}
            currentUser={currentUser}
            connectionCounts={profileHeaderData?.connectionCounts}
            isViewMode={true}
            onGoBack={handleGoBack}
            circles={profileHeaderData?.circles || []}
            onCirclesUpdate={handleCirclesUpdate}
            achievements={profileHeaderData?.achievements || []}
            connectionRequestsSent={profileHeaderData?.connectionRequestsSent || []}
            connectionRequestsReceived={profileHeaderData?.connectionRequestsReceived || []}
            circleInvitations={profileHeaderData?.circleInvitations || []}
          />

          {/* Show full student profile once data is available */}
          {studentData && (
            <StudentProfile
              studentId={profileId!}
              currentUser={currentUser}
              studentData={studentData}
              isViewMode={true}
            />
          )}
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}