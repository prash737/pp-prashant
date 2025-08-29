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
import { TabsContent } from "@/components/ui/tabs" // Assuming TabsContent is imported from here
import EducationCards from "./education-cards" // Assuming EducationCards is imported from here

interface StudentProfileProps {
  studentId?: string
  currentUser?: any
  studentData?: any
  isViewMode?: boolean // New prop to indicate if this is a view-only mode
  isShareMode?: boolean
  onGoBack?: () => void // New prop for back button handler
  showStaticStructure?: boolean
}

export default function StudentProfile({ 
  studentId, 
  currentUser: propCurrentUser, // Renamed prop to avoid conflict with state
  studentData: propStudentData, 
  isViewMode = false,
  isShareMode = false,
  onGoBack,
  showStaticStructure = false 
}: StudentProfileProps) {
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
  const [circles, setCircles] = useState<any[]>([])
  const [circlesLoading, setCirclesLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null) // State for current user
  const [formData, setFormData] = useState<any>({}) // State for form data
  const [suggestedConnections, setSuggestedConnections] = useState<any[]>([])
  const [followingInstitutions, setFollowingInstitutions] = useState<any[]>([])

  // Determine if this is the current user's own profile
  const isOwnProfile = currentUser?.id === student?.id

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true)
      // If propCurrentUser is provided, use it directly
      if (propCurrentUser) {
        setCurrentUser(propCurrentUser)
        // If studentData is also provided, use it to set student details and skip fetching from /api/auth/user
        if (propStudentData) {
          setStudent(propStudentData)
          setCircles(propStudentData.circles || []) // Set circles from studentData
          setLoading(false)
        } else {
          // If only propCurrentUser is provided, we might still need to fetch student specific data if different
          // For now, assuming propCurrentUser is sufficient for user identification and basic data
          // If student details are needed, a separate fetch might be required or studentData should be mandatory
          // Setting student to propCurrentUser for now, but this might need refinement
          setStudent(propCurrentUser) 
          setLoading(false)
        }
        return
      }

      // Fetch current user data if propCurrentUser is not provided
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const userData = await response.json()
      setCurrentUser(userData)
      setStudent(userData) // Assuming the user API also returns student data
    } catch (error) {
      console.error('Error fetching user data:', error)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  // Function to fetch student data by ID
  const fetchStudentData = async () => {
    // Use studentId from props if provided, otherwise fall back to current user's ID if it's their own profile
    const id = studentId || (isOwnProfile && currentUser?.id) || (propCurrentUser?.id)

    if (!id) return

    setLoading(true)
    setError(null)

    try {
      console.log('📡 StudentProfile: Fetching data for student ID:', id)
      const response = await fetch(`/api/student/profile/${id}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()


      // Detailed logging of all data fields
      console.log('🧪 DETAILED DATA INSPECTION:')
      console.log('  - ID:', data?.id)
      console.log('  - Profile object:', data?.profile)
      console.log('  - Profile firstName:', data?.profile?.firstName)
      console.log('  - Profile lastName:', data?.profile?.lastName)
      console.log('  - Profile bio:', data?.profile?.bio)
      console.log('  - Profile location:', data?.profile?.location)
      console.log('  - Profile image:', data?.profile?.profileImageUrl)
      console.log('  - Profile tagline:', data?.profile?.tagline)
      console.log('  - Connection counts:', data?.connectionCounts)
      console.log('  - Circles:', data?.circles)
      console.log('  - Achievements:', data?.achievements)
      console.log('  - Education history:', data?.educationHistory)
      console.log('  - Following institutions:', data?.followingInstitutions)
      console.log('  - User interests:', data?.profile?.userInterests)
      console.log('  - User skills:', data?.profile?.userSkills)

      // If studentData is an array, take the first item
    if (Array.isArray(data)) {
      console.log('📡 StudentProfile: Received student data:', data)

      if (data.length > 0) {
        const rawStudentData = data[0]
        console.log('🔍 StudentProfile: Processed student data:', rawStudentData)

        // Log raw API response structure for debugging
        console.log('🔍 Raw API Response Structure:', {
          isArray: Array.isArray(data),
          hasProfile: !!rawStudentData?.profile,
          hasId: !!rawStudentData?.id,
          topLevelKeys: Object.keys(rawStudentData || {}),
          profileKeys: rawStudentData?.profile ? Object.keys(rawStudentData.profile) : 'No profile object'
        })

        // Transform the flat API response into the nested structure expected by ProfileHeader
        const transformedStudentData = {
          id: rawStudentData.id,
          first_name: rawStudentData.first_name,
          last_name: rawStudentData.last_name,
          bio: rawStudentData.bio,
          location: rawStudentData.location,
          profile_image_url: rawStudentData.profile_image_url,
          cover_image_url: rawStudentData.cover_image_url,
          tagline: rawStudentData.tagline,
          verification_status: rawStudentData.verification_status,
          // Create nested profile structure that ProfileHeader expects
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
          // Map education history - preserve all fields from comprehensive profile
          educationHistory: (rawStudentData.education_history || []).map((edu: any, index: number) => {
            console.log('🔍 Mapping education entry:', JSON.stringify(edu, null, 2));
            console.log(`📚 Education entry ${index + 1} field analysis:`, {
              hasInstitutionName: !!edu.institutionName,
              hasInstitutionType: !!edu.institutionType,
              hasDegreeProgram: !!edu.degreeProgram,
              hasStartDate: !!edu.startDate,
              hasInstitutionVerified: edu.institutionVerified !== undefined,
              allFields: Object.keys(edu)
            });

            const mappedEducation = {
              id: edu.id,
              institutionName: edu.institutionName || edu.institution_name,
              institutionType: edu.institutionType || edu.institution_type,
              institutionTypeName: edu.institutionType?.name || edu.institution_type?.name,
              institutionTypeId: edu.institutionTypeId || edu.institution_type_id,
              gradeLevel: edu.gradeLevel || edu.grade_level,
              isCurrent: edu.isCurrent !== undefined ? edu.isCurrent : edu.is_current,
              is_current: edu.isCurrent !== undefined ? edu.isCurrent : edu.is_current,
              startDate: edu.startDate || edu.start_date,
              endDate: edu.endDate || edu.end_date,
              degreeProgram: edu.degreeProgram || edu.degree_program,
              fieldOfStudy: edu.fieldOfStudy || edu.field_of_study,
              subjects: edu.subjects || [],
              gpa: edu.gpa,
              achievements: edu.achievements || [],
              description: edu.description,
              institutionVerified: edu.institutionVerified !== undefined ? edu.institutionVerified : edu.institution_verified
            };

            console.log(`✅ Mapped education entry ${index + 1}:`, JSON.stringify(mappedEducation, null, 2));
            return mappedEducation;
          }),
          // Map other fields
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
          followingInstitutions: rawStudentData.institution_following || rawStudentData.followingInstitutions || [],
          suggestedConnections: rawStudentData.suggestedConnections || [],
          connectionRequestsSent: rawStudentData.connectionRequestsSent || [],
          connectionRequestsReceived: rawStudentData.connectionRequestsReceived || [],
          circleInvitations: rawStudentData.circleInvitations || [],
          // Map additional student-specific fields
          ageGroup: rawStudentData.age_group,
          educationLevel: rawStudentData.education_level,
          birthMonth: rawStudentData.birth_month,
          birthYear: rawStudentData.birth_year,
          personalityType: rawStudentData.personality_type,
          learningStyle: rawStudentData.learning_style,
          favoriteQuote: rawStudentData.favorite_quote,
          userInterests: rawStudentData.user_interests || [],
          userSkills: rawStudentData.user_skills || []
        }

        console.log('🔍 StudentProfile: Circles data received:', transformedStudentData.circles)
        console.log('🔍 StudentProfile: Number of circles:', transformedStudentData.circles?.length || 0)

        setStudent(transformedStudentData)
        setCircles(transformedStudentData.circles || [])
        console.log('🔍 StudentProfile: State after setting circles:', transformedStudentData.circles || [])

        setConnectionCounts(transformedStudentData.connectionCounts)
        setConnections(transformedStudentData.connections)
        setSuggestedConnections(transformedStudentData.suggestedConnections)
        setFollowingInstitutions(transformedStudentData.followingInstitutions)
        setLoading(false)
        return
      }
    }

    // Handle cases where data might not be an array or is empty
    if (!Array.isArray(data) && data) {
       // Assuming the response is a single object if not an array
       const rawStudentData = data;
       console.log('📡 StudentProfile: Received student data (single object):', rawStudentData)

       // Log raw API response structure for debugging
       console.log('🔍 Raw API Response Structure:', {
         isArray: Array.isArray(data),
         hasProfile: !!rawStudentData?.profile,
         hasId: !!rawStudentData?.id,
         topLevelKeys: Object.keys(rawStudentData || {}),
         profileKeys: rawStudentData?.profile ? Object.keys(rawStudentData.profile) : 'No profile object'
       })

       // Transform the flat API response into the nested structure expected by ProfileHeader
        const transformedStudentData = {
          id: rawStudentData.id,
          first_name: rawStudentData.first_name,
          last_name: rawStudentData.last_name,
          bio: rawStudentData.bio,
          location: rawStudentData.location,
          profile_image_url: rawStudentData.profile_image_url,
          cover_image_url: rawStudentData.cover_image_url,
          tagline: rawStudentData.tagline,
          verification_status: rawStudentData.verification_status,
          // Create nested profile structure that ProfileHeader expects
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
          // Map education history - preserve all fields from comprehensive profile  
          educationHistory: (rawStudentData.education_history || []).map((edu: any) => {
            console.log('🔍 Mapping education entry (second block):', JSON.stringify(edu, null, 2));
            return {
              id: edu.id,
              institutionName: edu.institutionName || edu.institution_name,
              institutionType: edu.institutionType || edu.institution_type,
              institutionTypeName: edu.institutionType?.name || edu.institution_type?.name,
              institutionTypeId: edu.institutionTypeId || edu.institution_type_id,
              gradeLevel: edu.gradeLevel || edu.grade_level,
              isCurrent: edu.isCurrent !== undefined ? edu.isCurrent : edu.is_current,
              is_current: edu.isCurrent !== undefined ? edu.isCurrent : edu.is_current,
              startDate: edu.startDate || edu.start_date,
              endDate: edu.endDate || edu.end_date,
              degreeProgram: edu.degreeProgram || edu.degree_program,
              fieldOfStudy: edu.fieldOfStudy || edu.field_of_study,
              subjects: edu.subjects || [],
              gpa: edu.gpa,
              achievements: edu.achievements || [],
              description: edu.description,
              institutionVerified: edu.institutionVerified !== undefined ? edu.institutionVerified : edu.institution_verified
            };
          }),
          // Map other fields
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
          followingInstitutions: rawStudentData.institution_following || rawStudentData.followingInstitutions || [],
          suggestedConnections: rawStudentData.suggestedConnections || [],
          connectionRequestsSent: rawStudentData.connectionRequestsSent || [],
          connectionRequestsReceived: rawStudentData.connectionRequestsReceived || [],
          circleInvitations: rawStudentData.circleInvitations || [],
          // Map additional student-specific fields
          ageGroup: rawStudentData.age_group,
          educationLevel: rawStudentData.education_level,
          birthMonth: rawStudentData.birth_month,
          birthYear: rawStudentData.birth_year,
          personalityType: rawStudentData.personality_type,
          learningStyle: rawStudentData.learning_style,
          favoriteQuote: rawStudentData.favorite_quote,
          userInterests: rawStudentData.user_interests || [],
          userSkills: rawStudentData.user_skills || []
        }

        console.log('🔍 StudentProfile: Circles data received:', transformedStudentData.circles)
        console.log('🔍 StudentProfile: Number of circles:', transformedStudentData.circles?.length || 0)

        setStudent(transformedStudentData)
        setCircles(transformedStudentData.circles || [])
        console.log('🔍 StudentProfile: State after setting circles:', transformedStudentData.circles || [])

        setConnectionCounts(transformedStudentData.connectionCounts)
        setConnections(transformedStudentData.connections)
        setSuggestedConnections(transformedStudentData.suggestedConnections)
        setFollowingInstitutions(transformedStudentData.followingInstitutions)
        setLoading(false)
        return
    }

    // If no student data is found or the response is unexpected
    if (!data || (Array.isArray(data) && data.length === 0)) {
      setError('No student data found.')
      setLoading(false)
      return
    }

    } catch (error) {
      console.error('❌ StudentProfile: Error fetching student data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch student data')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle circles update (for creating new circles)
  const handleCirclesUpdate = () => {
    // If we need to refresh circles after creation, we can fetch the entire profile again
    // For now, we'll rely on the parent component to handle this
    console.log('Circle updated - parent should refresh data')
  }

  useEffect(() => {
    // If studentData is provided directly, use it and skip all API calls
    if (propStudentData) {
      console.log('🎯 StudentProfile: Using provided studentData, skipping API calls')
      setStudent(propStudentData)
      setCircles(propStudentData.circles || [])
      setConnectionCounts(propStudentData.connectionCounts || { total: 0, students: 0, mentors: 0, institutions: 0 })
      setConnections(propStudentData.connections || [])
      setSuggestedConnections(propStudentData.suggestedConnections || [])
      setFollowingInstitutions(propStudentData.followingInstitutions || [])
      setCurrentUser(propCurrentUser || null)
      setLoading(false)
      return
    }

    // Only fetch if no studentData is provided
    fetchUserData().then(() => {
      const idToFetch = studentId || (propCurrentUser ? propCurrentUser.id : null)
      if (idToFetch) {
        fetchStudentData()
      } else {
        setLoading(false)
      }
    })
  }, [propCurrentUser, propStudentData, studentId])


  // Set circles from studentData when available (alternative/fallback if fetchStudentData doesn't set it)
  useEffect(() => {
    if (propStudentData?.circles && !student) { // Only if student is not yet populated by fetchStudentData
      const enabledCircles = propStudentData.circles.filter((circle: any) => {
        if (circle.isDisabled) return false;
        if (circle.isCreatorDisabled && circle.creator?.id === currentUser?.id) return false;
        const userMembership = circle.memberships?.find(
          (membership: any) => membership.user?.id === currentUser?.id
        );
        if (userMembership && userMembership.isDisabledMember) return false;
        return true;
      });
      setCircles(enabledCircles);
    } else if (!propStudentData && student?.circles) { // If student is populated but propStudentData was not the source
       const enabledCircles = student.circles.filter((circle: any) => {
        if (circle.isDisabled) return false;
        if (circle.isCreatorDisabled && circle.creator?.id === currentUser?.id) return false;
        const userMembership = circle.memberships?.find(
          (membership: any) => membership.user?.id === currentUser?.id
        );
        if (userMembership && userMembership.isDisabledMember) return false;
        return true;
      });
      setCircles(enabledCircles);
    }
  }, [propStudentData?.circles, student?.circles, currentUser?.id])

  // Transform studentData if it's provided directly and not fetched by studentId
  useEffect(() => {
    if (propStudentData && !studentId && !student) { // Only transform if propStudentData is provided directly and not fetched via ID
      // Use connection counts from API response
      setConnectionCounts(propStudentData.connectionCounts || {
        total: 0,
        students: 0,
        mentors: 0,
        institutions: 0
      })

      setConnections(propStudentData.connections || [])

      // Transform the comprehensive data to match component structure
      const transformedStudent = {
        id: propStudentData.id,
        ageGroup: propStudentData.ageGroup || "young_adult",
        educationLevel: propStudentData.educationLevel || "undergraduate",
        birthMonth: propStudentData.birthMonth,
        birthYear: propStudentData.birthYear,
        personalityType: propStudentData.personalityType,
        learningStyle: propStudentData.learningStyle,
        favoriteQuote: propStudentData.favoriteQuote,
        profile: {
          firstName: propStudentData.profile?.firstName || "Student",
          lastName: propStudentData.profile?.lastName || "",
          bio: propStudentData.profile?.bio || "No bio available",
          location: propStudentData.profile?.location || "Location not specified",
          profileImageUrl: propStudentData.profile?.profileImageUrl || "/images/student-profile.png",
          coverImageUrl: propStudentData.profile?.coverImageUrl,
          verificationStatus: propStudentData.profile?.verificationStatus || false,
          role: "student",
          tagline: propStudentData.profile?.tagline
        },
        interests: propStudentData.profile?.userInterests?.map((ui: any) => ({
          id: ui.interest.id,
          name: ui.interest.name,
          category: ui.interest.category?.name || "General"
        })) || [],
        skills: propStudentData.profile?.userSkills?.map((us: any) => ({
          id: us.skill.id,
          name: us.skill.name,
          proficiencyLevel: us.proficiencyLevel || 50,
          category: us.skill.category?.name || "General"
        })) || [],
        educationHistory: propStudentData.educationHistory?.map((edu: any) => ({
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
        socialLinks: propStudentData.profile?.socialLinks || [],
        careerGoals: propStudentData.goals || [],
        customBadges: propStudentData.profile?.customBadges || [],

        // Now using real data from API
        projects: [], // Still placeholder - add to API if needed
        achievements: propStudentData.achievements || [],
        // circles: propStudentData.circles || [], // This is now fetched separately
        userCollections: propStudentData.userCollections || [],
        circles: propStudentData.circles || [], // Keep circles in student object
        followingInstitutions: propStudentData.followingInstitutions || [],
        suggestedConnections: propStudentData.suggestedConnections || [],
        learningPath: {
          currentCourses: [],
          completedCourses: [],
          recommendations: []
        },
        connections: {
          mentors: propStudentData.connections?.filter((c: any) => c.role === 'mentor') || [],
          peers: propStudentData.connections?.filter((c: any) => c.role === 'student') || [],
          institutions: propStudentData.connections?.filter((c: any) => c.role === 'institution') || [],
          total: propStudentData.connectionCounts?.total || 0,
          students: propStudentData.connectionCounts?.students || 0
        }
      }

      setStudent(transformedStudent)
      setCircles(transformedStudent.circles || [])
      setLoading(false)
    }
  }, [propStudentData, studentId, student, propCurrentUser]) // Re-run if propStudentData, studentId or student changes


  // Create static structure for immediate display
  const staticStudentStructure = showStaticStructure ? {
    id: studentId || currentUser?.id || "",
    profile: {
      firstName: "Student", 
      lastName: "", 
      profileImageUrl: "/images/student-profile.png",
      bio: "Loading profile information...",
      tagline: "Passionate learner exploring new horizons",
      userInterests: [],
      userSkills: [],
      skills: [],
      socialLinks: []
    },
    educationHistory: [{
      id: "temp",
      institutionName: "School",
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
  } : null

  // Use passed student data, fetched data, or static structure
  const finalStudentData = propStudentData || student || staticStudentStructure

  // Always render the component structure - we'll show loading states for missing sections
  // This ensures immediate rendering when cached data is available
  if (loading && !showStaticStructure) { // Only show loading state if not showing static structure
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
    // Only show interests tab if student has interests or if it's not view mode
    ...((!isViewMode || (student?.interests && student.interests.length > 0)) ? [{ id: "interests", label: "Interests" }] : []),
    ...(isViewMode ? [] : [{ id: "suggested", label: "Suggested Connections" }]),
    { id: "circle", label: isViewMode ? "Circles" : "My Circle" },
    { id: "following", label: "Following" },
    // Only show skills tab if student has skills or if it's not view mode
    ...((!isViewMode || (student?.skills && student.skills.length > 0)) ? [{ id: "skills", label: "Skills Canvas" }] : []),
    // Only show projects tab if student has projects or if it's not view mode
    ...((!isViewMode || (student?.projects && student.projects.length > 0)) ? [{ id: "projects", label: "Projects" }] : []),
    { id: "achievements", label: "Achievements" },
    // Only show goals tab if student has goals or if it's not view mode
    ...((!isViewMode || (student?.careerGoals && student.careerGoals.length > 0)) ? [{ id: "goals", label: "Goals" }] : []),
  ]

  // Placeholder for content rendering, which will be updated when data is fully loaded
  const renderContent = () => {
    if (showStaticStructure && !student) {
      return (
        <div className="mt-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pathpiper-teal mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading profile sections...</p>
        </div>
      )
    }

    switch (activeTab) {
      case "about":
        return <AboutSection student={student} currentUser={currentUser} isViewMode={isViewMode} />
      case "interests":
        // Pass student data to InterestsSection, which will handle fetching interests if they are not already loaded
        return <InterestsSection student={student} currentUser={currentUser} isViewMode={isViewMode} />
      case "suggested":
        return !isViewMode && <SuggestedConnections student={student} suggestedConnections={suggestedConnections || []} />
      case "skills":
        return <SkillsCanvas userId={student?.id} skills={student?.profile?.userSkills} isViewMode={isViewMode} />
      case "projects":
        return <ProjectsShowcase student={student} isViewMode={isViewMode} />
      case "achievements":
        return (
          <AchievementTimeline 
            userId={student?.id} 
            isOwnProfile={isOwnProfile}
            isViewMode={isViewMode}
            student={student}
            achievements={student?.achievements || []}
          />
        )
      case "circle":
        return (
          <CircleView 
            student={student} 
            circles={circles || []}
            isViewMode={isViewMode} 
          />
        )
      case "goals":
        return <Goals student={student} currentUser={currentUser} goals={student?.careerGoals || []} isViewMode={isViewMode} />
      case "following":
        return <FollowingInstitutions userId={studentId} followingInstitutions={followingInstitutions || []} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Always show ProfileHeader immediately with available data */}
      <ProfileHeader
        student={finalStudentData || staticStudentStructure}
        currentUser={currentUser}
        connectionCounts={finalStudentData?.connectionCounts}
        isViewMode={isViewMode}
        circles={finalStudentData?.circles || []}
        onCirclesUpdate={handleCirclesUpdate}
        achievements={finalStudentData?.achievements || []}
        connectionRequestsSent={finalStudentData?.connectionRequestsSent || []}
        connectionRequestsReceived={finalStudentData?.connectionRequestsReceived || []}
        circleInvitations={finalStudentData?.circleInvitations || []}
      />

      {/* Show navigation and content when we have real data */}
      {finalStudentData && finalStudentData !== staticStudentStructure && (
        <>
          <HorizontalNavigation 
            tabs={tabs} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            isViewMode={isViewMode}
          />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {renderContent()}
            </div>
            </div>
        </>
      )}

      {/* Show loading indicator for content sections when using static structure and real data is not yet loaded */}
      {showStaticStructure && finalStudentData === staticStudentStructure && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden text-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pathpiper-teal mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading profile sections...</p>
          </div>
        </div>
      )}

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