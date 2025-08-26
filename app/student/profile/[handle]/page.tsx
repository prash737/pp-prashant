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

  // This effect is for the public view of the student profile.
  // The previous effect handles the authenticated user's own profile.
  // Here, we assume `handle` is an identifier, not necessarily the current user's ID.
  useEffect(() => {
    // If the current user is logged in and trying to view their own profile,
    // the previous effect should have already handled it. This effect is for public views.
    if (currentUser?.id && handle === currentUser.id) {
      return; // Already handled by the effect above for the logged-in user
    }

    // If auth is still loading or we don't have a handle yet, do nothing.
    if (authLoading || !handle) return;

    // If there's no logged-in user and it's not a public view (i.e., handle is not provided or invalid),
    // or if it's a public view but the handle is missing, we can't proceed.
    // However, the requirement is about caching for public view too.
    // So, we'll proceed to load cached data if available, even without auth.

    // Immediately try to get cached data for instant rendering for public view
    const cachedData = getCachedProfileHeaderData(handle)
    if (cachedData) {
      console.log('🚀 Immediate public render with cached data for handle:', handle)
      setStudentData(cachedData)
      setHasCachedData(true)
    }
  }, [currentUser, authLoading, handle])


  // This useEffect is specifically for fetching fresh data when needed,
  // either for the current user's profile or a public profile.
  useEffect(() => {
    // If authentication is still loading or we don't have a handle, exit.
    if (authLoading || !handle) return;

    // If the user is logged in and the handle matches their ID,
    // we've already handled immediate caching and don't need to re-fetch
    // unless the cached data is stale (which this logic doesn't cover yet).
    // The primary purpose here is to fetch for public profiles or if cached data wasn't available.
    if (currentUser?.id && handle === currentUser.id && hasCachedData) {
      return;
    }

    // Fetch student data
    const fetchStudentData = async () => {
      try {
        // Only show loading state if we don't have cached data and it's not the current user's profile
        // which might have already rendered with cached data.
        if (!hasCachedData && (!currentUser || handle !== currentUser.id)) {
          setLoading(true)
        } else if (!hasCachedData && currentUser?.id && handle === currentUser.id) {
          // If it's the current user's profile, and no cached data was found, show loading
          setLoading(true)
        }
        setError(null)

        const apiUrl = currentUser?.id && handle === currentUser.id
          ? `/api/student/profile/${currentUser.id}` // Fetch own profile
          : `/api/student/profile/${handle}`; // Fetch public profile

        const response = await fetch(apiUrl, {
          credentials: 'include' // Ensure cookies are sent for authenticated requests
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
        // Cache the fetched data for future use, using the handle for public profiles
        const cacheKey = currentUser?.id && handle === currentUser.id ? currentUser.id : handle;
        if (data && cacheKey) {
          setCachedProfileHeaderData(cacheKey, data)
        }
        console.log('✅ Fresh data loaded and cached for:', cacheKey)
      } catch (err) {
        console.error('Error fetching student data:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [handle, currentUser, authLoading, router, hasCachedData]) // Dependencies cover user, auth, handle, and cached state

  // Determine if the current view is for the logged-in user's own profile
  const isOwnProfile = currentUser?.id && handle === currentUser.id;

  // Render loading state:
  // Show loading if auth is still loading AND we don't have a handle yet,
  // OR if we are actively loading data (loading state is true)
  // AND we don't have any studentData yet.
  if ((authLoading && !handle) || (loading && !studentData)) {
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
                onClick={() => router.push(isOwnProfile ? '/student/profile' : `/student/profile/${handle}`)}
                className="bg-pathpiper-teal text-white px-4 py-2 rounded hover:bg-pathpiper-teal/90"
              >
                {isOwnProfile ? 'Go to My Profile' : 'Try Again'}
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedLayout>
    )
  }

  // If studentData is still null at this point, it means something went wrong or it's a scenario not covered.
  // However, given the loading and error states, we should have data or an error.
  // We will always render the StudentProfile component if no error occurred.
  return (
    <ProtectedLayout>
      <div className="min-h-screen flex flex-col">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24">
          <StudentProfile
            // Use the handle for the student ID if it's a public view or if currentUser.id is not available
            studentId={isOwnProfile ? currentUser?.id : handle}
            currentUser={currentUser}
            studentData={studentData}
            showStaticStructure={true} // This prop seems to be for initial loading states, which we now handle with caching
          />
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}