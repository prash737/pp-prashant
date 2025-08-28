"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
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
  circles?: Array<{
    id: string
    name: string
    description?: string
    profileImageUrl?: string
  }>
}

export default function PublicViewStudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
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

    // Fetch student data for the profile being viewed
    const fetchStudentData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/public/student/profile/${profileId}`, {
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
        console.log('📊 PublicView: Raw API data received:', data)
        
        // Transform the data to match the expected structure
        let transformedData = data
        
        // If data is an array (from RPC function), get the first element
        if (Array.isArray(data) && data.length > 0) {
          const rawData = data[0]
          transformedData = {
            id: rawData.id,
            first_name: rawData.first_name,
            last_name: rawData.last_name,
            bio: rawData.bio,
            location: rawData.location,
            profile_image_url: rawData.profile_image_url,
            cover_image_url: rawData.cover_image_url,
            verification_status: rawData.verification_status,
            tagline: rawData.tagline,
            profile: {
              firstName: rawData.first_name,
              lastName: rawData.last_name,
              bio: rawData.bio,
              location: rawData.location,
              profileImageUrl: rawData.profile_image_url,
              coverImageUrl: rawData.cover_image_url,
              verificationStatus: rawData.verification_status,
              tagline: rawData.tagline,
              userInterests: rawData.user_interests || [],
              userSkills: rawData.user_skills || []
            },
            educationHistory: rawData.education_history || [],
            achievements: rawData.achievements || [],
            goals: rawData.goals || [],
            userCollections: rawData.user_collections || [],
            circles: rawData.circles || [],
            connectionCounts: {
              total: 0,
              students: 0,
              mentors: 0,
              institutions: 0
            },
            followingInstitutions: rawData.institution_following || [],
            sent_connections: rawData.sent_connections || [],
            received_connections: rawData.received_connections || []
          }
        } else if (!data.profile && data.first_name) {
          // If it's flat data structure, transform it
          transformedData = {
            ...data,
            profile: {
              firstName: data.first_name,
              lastName: data.last_name,
              bio: data.bio,
              location: data.location,
              profileImageUrl: data.profile_image_url,
              coverImageUrl: data.cover_image_url,
              verificationStatus: data.verification_status,
              tagline: data.tagline,
              userInterests: data.userInterests || data.user_interests || [],
              userSkills: data.userSkills || data.user_skills || []
            }
          }
        }

        console.log('📊 PublicView: Transformed data:', {
          hasData: !!transformedData,
          hasProfile: !!transformedData?.profile,
          firstName: transformedData?.profile?.firstName,
          lastName: transformedData?.profile?.lastName,
          achievementsCount: transformedData?.achievements?.length || 0,
          circlesCount: transformedData?.circles?.length || 0,
          educationCount: transformedData?.educationHistory?.length || 0
        })
        
        setStudentData(transformedData)
      } catch (err) {
        console.error('Error fetching student data:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [profileId, currentUser, authLoading, router])

  const handleGoBack = () => {
    router.back()
  }

  // Determine which navbar to use based on logged-in user's role
  const NavbarComponent = currentUser?.role === 'institution' ? InstitutionNavbar : InternalNavbar

  if (authLoading || loading) {
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

  // Extract circles data for components
  const circles = studentData?.circles || [];
  const profileHeaderData = studentData; // Alias for clarity if needed, though studentData is directly used

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <NavbarComponent />
      {/* Profile content */}
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
        {studentData && (
          <StudentProfile
            studentId={profileId!}
            currentUser={currentUser}
            studentData={studentData}
            circles={studentData?.circles || []} // Pass circles directly from studentData
            isViewMode={true} // This prop indicates it's a view-only mode
            shareProfile={() => {
                const profileUrl = `https://pathpiper.com/public-view/student/profile/${profileId}`;
                navigator.clipboard.writeText(profileUrl).then(() => {
                  alert('Profile link copied to clipboard!');
                }).catch(() => {
                  alert('Failed to copy link');
                });
              }}
          />
        )}
      </main>
    </div>
  )
}