"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, getCachedPublicProfileData, fetchAndCachePublicProfileData } from "@/hooks/use-auth"
import StudentProfile from "@/components/profile/student-profile"
import InternalNavbar from "@/components/internal-navbar"
import InstitutionNavbar from "@/components/institution-navbar"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

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

export default function PublicViewStudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { user: currentUser, loading: authLoading } = useAuth()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(false)
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

  // Get cached data immediately
  useEffect(() => {
    if (!profileId) return

    const cachedData = getCachedPublicProfileData(profileId)
    if (cachedData) {
      console.log('🚀 Immediate render with cached public profile data for user:', profileId)
      setStudentData(cachedData)
    }
  }, [profileId])

  useEffect(() => {
    if (authLoading || !profileId) return

    if (!currentUser) {
      router.push('/login')
      return
    }

    // Only redirect if trying to view own profile, allow other roles to view student profiles
    // Prevent viewing your own profile through public view
    if (profileId === currentUser.id) {
      if (currentUser.role === 'student') {
        router.push(`/student/profile/${currentUser.id}`)
      } else if (currentUser.role === 'mentor') {
        router.push('/mentor/profile')
      } else if (currentUser.role === 'institution') {
        router.push('/institution/profile')
      } else {
        router.push('/feed')
      }
      return
    }

    const cachedData = getCachedPublicProfileData(profileId)
    
    console.log('🔥 Starting priority fetch for public profile header...')

    // Always fetch fresh data in background (whether we had cached data or not)
    const fetchFreshData = async () => {
      try {
        setLoading(!cachedData) // Only show loading if we don't have cached data

        const freshData = await fetchAndCachePublicProfileData(profileId)

        if (freshData) {
          console.log('✅ Fresh public profile data fetched and cached')
          setStudentData(freshData)
        } else {
          throw new Error('Failed to fetch fresh public profile data')
        }

      } catch (err) {
        console.error('❌ Error fetching fresh public profile data:', err)
        // Only set error if we don't have cached data to fall back on
        if (!cachedData) {
          if (err instanceof Response) {
            if (err.status === 404) {
              setError('Profile not found')
            } else if (err.status === 403) {
              setError('Access denied')
            } else {
              setError('Failed to load profile')
            }
          } else {
            setError('Failed to load profile')
          }
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

  // Determine which navbar to use based on logged-in user's role
  const NavbarComponent = currentUser?.role === 'institution' ? InstitutionNavbar : InternalNavbar

  // Create static structure for immediate display
  const staticStudentStructure = {
    id: profileId || "",
    profile: {
      firstName: "Loading...",
      lastName: "",
      profileImageUrl: "/images/student-profile.png",
      bio: "Loading profile information...",
      tagline: "Loading...",
      userInterests: [],
      userSkills: [],
      skills: [],
      socialLinks: []
    },
    educationHistory: [{
      id: "temp",
      institutionName: "Loading...",
      gradeLevel: "Student",
      isCurrent: true,
      is_current: true
    }],
    connections: [],
    achievements: [],
    connectionCounts: {
      total: 0,
      students: 0,
      mentors: 0,
      institutions: 0
    },
    circles: [],
    connectionRequestsSent: [],
    connectionRequestsReceived: [],
    circleInvitations: []
  }

  // Use cached data, fetched data, or static structure for immediate rendering
  const displayData = studentData || staticStudentStructure

  if (authLoading && !displayData) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <NavbarComponent />
        <main className="flex-grow flex items-center justify-center pt-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <NavbarComponent />

        <main className="flex-grow flex items-center justify-center pt-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={handleGoBack}
              className="bg-pathpiper-teal text-white hover:bg-pathpiper-teal/90 mr-2"
            >
              Go Back
            </Button>
            <Button 
              onClick={() => router.push('/student/profile')}
              variant="outline"
            >
              My Profile
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <NavbarComponent />
      {/* Profile content - Always render immediately */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 max-w-7xl pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <StudentProfile
          studentId={profileId!}
          currentUser={currentUser}
          studentData={displayData}
          isViewMode={true}
          showStaticStructure={!studentData} // Show static structure if no real data yet
          shareProfile={() => {
            const profileUrl = `https://pathpiper.com/public-view/student/profile/${profileId}`;
            navigator.clipboard.writeText(profileUrl).then(() => {
              alert('Profile link copied to clipboard!');
            }).catch(() => {
              alert('Failed to copy link');
            });
          }}
        />
      </main>
    </div>
  )
}