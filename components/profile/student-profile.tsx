"use client"

import { useState, useEffect } from "react"
import ProfileHeader from "./profile-header"
import HorizontalNavigation from "./horizontal-navigation"
import AboutSection from "./about-section"
import SkillsCanvas from "./skills-canvas"
import ProjectsShowcase from "./projects-showcase"
import AchievementTimeline from "./achievement-timeline"
import CircleView from "./circle-view"
import ActionBar from "./action-bar"
import Goals from "./goals"
import InterestsSection from "./interests-section"
import SuggestedConnections from "./suggested-connections"
import FollowingInstitutions from "./following-institutions"

interface StudentProfileProps {
  studentId?: string
  currentUser?: any
  studentData?: any
  isViewMode?: boolean // New prop to indicate if this is a view-only mode
}

export default function StudentProfile({ studentId, currentUser, studentData, isViewMode = false }: StudentProfileProps) {
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("about")
  const [connections, setConnections] = useState<any[]>([])
  const [connectionCounts, setConnectionCounts] = useState({
    total: 0,
    students: 0,
    mentors: 0,
    institutions: 0
  })

  // Determine if this is the current user's own profile
  const isOwnProfile = currentUser?.id === student?.id

  // Fetch connections data
  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/connections')
      if (response.ok) {
        const data = await response.json()
        setConnections(data)

        // Calculate connection counts by role
        const counts = {
          total: data.length,
          students: data.filter((conn: any) => conn.user.role === 'student').length,
          mentors: data.filter((conn: any) => conn.user.role === 'mentor').length,
          institutions: data.filter((conn: any) => conn.user.role === 'institution').length
        }
        setConnectionCounts(counts)
      }
    } catch (error) {
      console.error('Error fetching connections:', error)
    }
  }

  useEffect(() => {
    if (studentData) {
      fetchConnections()

      // Transform the real data to match our component's expected structure
      const transformedStudent = {
        id: studentData.id,
        ageGroup: studentData.ageGroup || "young_adult",
        educationLevel: studentData.educationLevel || "undergraduate",
        birthMonth: studentData.birthMonth,
        birthYear: studentData.birthYear,
        personalityType: studentData.personalityType,
        learningStyle: studentData.learningStyle,
        favoriteQuote: studentData.favoriteQuote,
        profile: {
          firstName: studentData.profile?.firstName || "Student",
          lastName: studentData.profile?.lastName || "",
          bio: studentData.profile?.bio || "No bio available",
          location: studentData.profile?.location || "Location not specified",
          profileImageUrl: studentData.profile?.profileImageUrl || "/images/student-profile.png",
          coverImageUrl: studentData.profile?.coverImageUrl,
          verificationStatus: studentData.profile?.verificationStatus || false,
          role: "student",
          tagline: studentData.profile?.tagline
        },
        interests: studentData.profile?.userInterests?.map((ui: any) => ({
          id: ui.interest.id,
          name: ui.interest.name,
          category: ui.interest.category?.name || "General"
        })) || [],
        skills: studentData.profile?.userSkills?.map((us: any) => ({
          id: us.skill.id,
          name: us.skill.name,
          proficiencyLevel: us.proficiencyLevel || 50,
          category: us.skill.category?.name || "General"
        })) || [],
        educationHistory: studentData.educationHistory?.map((edu: any) => ({
          id: edu.id,
          institutionName: edu.institutionName,
          institutionType: edu.institutionType || {
            name: "Educational Institution",
            category: { name: "General" }
          },
          institutionTypeName: edu.institutionTypeName || edu.institutionType?.name || "Educational Institution",
          degreeProgram: edu.degreeProgram,
          fieldOfStudy: edu.fieldOfStudy,
          subjects: edu.subjects || [],
          startDate: edu.startDate,
          endDate: edu.endDate,
          isCurrent: edu.is_current || edu.isCurrent,
          gradeLevel: edu.gradeLevel || edu.grade_level,
          gpa: edu.gpa,
          achievements: edu.achievements || [],
          description: edu.description,
          institutionVerified: edu.institutionVerified
        })) || [],
        socialLinks: studentData.profile?.socialLinks || [],
        careerGoals: studentData.profile?.careerGoals || [],
        customBadges: studentData.profile?.customBadges || [],

        // Placeholder data for sections without database tables
        // These sections will show "Coming Soon" or placeholder content
        projects: [],
        achievements: [],
        learningPath: {
          currentCourses: [],
          completedCourses: [],
          recommendations: []
        },
        connections: {
          mentors: [],
          peers: [],
          institutions: [],
          total: connectionCounts.total,
          students: connectionCounts.students
        }
      }

      setStudent(transformedStudent)
      setLoading(false)
    }
  }, [studentData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "about", label: "About" },
    { id: "interests", label: "Interests" },
    ...(isViewMode ? [] : [{ id: "suggested", label: "Suggested Connections" }]),
    { id: "circle", label: isViewMode ? "Circles" : "My Circle" },
    { id: "following", label: "Following" },
    { id: "skills", label: "Skills Canvas" },
    { id: "projects", label: "Projects" },
    { id: "achievements", label: "Achievements" },
    { id: "goals", label: "Goals" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <ProfileHeader student={student} currentUser={currentUser} connectionCounts={connectionCounts} isViewMode={isViewMode} />

      <HorizontalNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {activeTab === "about" && <AboutSection student={student} currentUser={currentUser} isViewMode={isViewMode} />}
          {activeTab === "interests" && <InterestsSection student={student} currentUser={currentUser} isViewMode={isViewMode} />}
          {activeTab === "suggested" && !isViewMode && <SuggestedConnections student={student} />}
          {activeTab === "skills" && <SkillsCanvas userId={student.id} skills={student.skills} isViewMode={isViewMode} />}
          {activeTab === "projects" && <ProjectsShowcase student={student} isViewMode={isViewMode} />}
          {activeTab === "achievements" && (
            <AchievementTimeline 
              userId={student?.id} 
              isOwnProfile={isOwnProfile}
              isViewMode={isViewMode}
              student={student}
            />
          )}
          {activeTab === "circle" && <CircleView student={student} isViewMode={isViewMode} />}
          {activeTab === "goals" && <Goals student={student} currentUser={currentUser} isViewMode={isViewMode} />}
          {activeTab === "following" && <FollowingInstitutions userId={studentId} />}
        </div>
      </div>

      {!isViewMode && <ActionBar student={student} currentUser={currentUser} />}

      {/* Self Analysis Floating Button - Only show for own profile and not in view mode */}
      {!isViewMode && isOwnProfile && (
        <div className="fixed bottom-6 right-6 z-50">
          <a
            href="/student/self-analysis"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="font-semibold">Self Analysis</span>
          </a>
        </div>
      )}
    </div>
  )
}