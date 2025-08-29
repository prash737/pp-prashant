
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
    coverImageUrl?: string
    tagline?: string
    verificationStatus?: boolean
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
  achievements: any[]
  connectionCounts: {
    total: number
    students: number
    mentors: number
    institutions: number
  }
  circles: any[]
}

export default function StudentProfilePage() {
  const { user: currentUser, loading: authLoading } = useAuth()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Prefetch edit route for faster navigation
  useEffect(() => {
    router.prefetch('/student/profile/edit')
  }, [router])

  useEffect(() => {
    if (authLoading) return

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

    // Fetch student data - SINGLE API CALL ONLY
    const fetchStudentData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('📡 StudentProfilePage: Making single API call for user:', currentUser.id)
        
        const response = await fetch(`/api/student/profile/${currentUser.id}`, {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
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
        console.log('✅ StudentProfilePage: Data received:', data)

        // Transform the API response to match component expectations
        if (Array.isArray(data) && data.length > 0) {
          const rawStudentData = data[0]
          
          const transformedData = {
            id: rawStudentData.id,
            first_name: rawStudentData.first_name,
            last_name: rawStudentData.last_name,
            bio: rawStudentData.bio,
            location: rawStudentData.location,
            profile_image_url: rawStudentData.profile_image_url,
            cover_image_url: rawStudentData.cover_image_url,
            tagline: rawStudentData.tagline,
            verification_status: rawStudentData.verification_status,
            profile: {
              firstName: rawStudentData.first_name,
              lastName: rawStudentData.last_name,
              bio: rawStudentData.bio,
              location: rawStudentData.location,
              profileImageUrl: rawStudentData.profile_image_url,
              coverImageUrl: rawStudentData.cover_image_url,
              tagline: rawStudentData.tagline,
              verificationStatus: rawStudentData.verification_status,
              userInterests: rawStudentData.user_interests || [],
              userSkills: rawStudentData.user_skills || [],
              skills: (rawStudentData.user_skills || []).map((us: any) => ({
                id: us.skills?.id || us.skill?.id,
                name: us.skills?.name || us.skill?.name,
                proficiencyLevel: us.proficiency_level || 50,
                category: us.skills?.skill_categories?.name || us.skill?.category?.name || 'General'
              })),
              socialLinks: rawStudentData.social_links || []
            },
            educationHistory: (rawStudentData.education_history || []).map((edu: any) => ({
              id: edu.id,
              institutionName: edu.institution_name,
              institutionType: edu.institution_type,
              gradeLevel: edu.grade_level,
              isCurrent: edu.is_current,
              is_current: edu.is_current,
              startDate: edu.start_date,
              endDate: edu.end_date,
              degreeProgram: edu.degree_program,
              fieldOfStudy: edu.field_of_study,
              subjects: edu.subjects || [],
              gpa: edu.gpa,
              achievements: edu.achievements || [],
              description: edu.description,
              institutionVerified: edu.institution_verified
            })),
            achievements: rawStudentData.achievements || [],
            goals: rawStudentData.goals || [],
            userCollections: rawStudentData.user_collections || [],
            connections: rawStudentData.connections || [],
            connectionCounts: rawStudentData.connectionCounts || {
              total: 0,
              students: 0,
              mentors: 0,
              institutions: 0
            },
            circles: rawStudentData.circles || [],
            followingInstitutions: rawStudentData.institution_following || [],
            suggestedConnections: rawStudentData.suggestedConnections || [],
            connectionRequestsSent: rawStudentData.connectionRequestsSent || [],
            connectionRequestsReceived: rawStudentData.connectionRequestsReceived || [],
            circleInvitations: rawStudentData.circleInvitations || []
          }

          console.log('🎯 StudentProfilePage: Setting transformed data:', transformedData)
          setStudentData(transformedData)
        } else {
          console.error('❌ StudentProfilePage: Unexpected data format:', data)
          setError('Invalid profile data format')
        }
      } catch (err) {
        console.error('❌ StudentProfilePage: Error fetching student data:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [currentUser, authLoading, router])

  // Show loading only if auth is loading AND we don't have studentData
  if (authLoading && !studentData) {
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
          {/* Pass the studentData directly to StudentProfile with minimal props */}
          <StudentProfile
            studentId={currentUser?.id}
            currentUser={currentUser}
            studentData={studentData}
            isViewMode={false}
            showStaticStructure={!studentData && loading}
          />
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}
