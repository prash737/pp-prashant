"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { 
  User, 
  Heart, 
  Palette, 
  Target, 
  MessageSquare, 
  GraduationCap, 
  Image as ImageIcon, 
  Shield,
  Save,
  X,
  ArrowLeft,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import PersonalInfoForm from "./forms/personal-info-form"
import InterestsPassionsForm from "./forms/interests-passions-form"
import SkillsAbilitiesForm from "./forms/skills-abilities-form"
import GoalsAspirationsForm from "./forms/goals-aspirations-form"
import SocialContactForm from "./forms/social-contact-form"
import EducationHistoryForm from "./forms/education-history-form"
import MoodBoardMediaForm from "./forms/mood-board-media-form"
import PrivacySettingsForm from "./forms/privacy-settings-form"
import AchievementsForm from "./forms/achievements-form"

interface ProfileEditFormProps {
  userId: string
  initialSection?: string
}

interface TabConfig {
  id: string
  label: string
  icon: React.ReactNode
  component: React.ReactNode
  required?: boolean
}

interface PersonalInfoFormProps {
  data: any
  onChange: (sectionId: string, data: any, isDirty?: boolean) => void
  onSave?: (data: any) => Promise<void>
}

// Placeholder for getCachedProfileData - replace with actual implementation
const getCachedProfileData = () => {
  // In a real app, this would check localStorage, sessionStorage, or a state management store
  return null;
}

export default function ProfileEditForm({ userId, initialSection }: ProfileEditFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(initialSection || "personal")
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completionData, setCompletionData] = useState<Record<string, boolean>>({})
  const [formDirtyStates, setFormDirtyStates] = useState<{[key: string]: boolean}>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // State for managing form data for each section
  const [formData, setFormData] = useState<any>({
    personal: {},
    interests: [],
    skills: [],
    goals: [],
    social: {},
    education: [],
    media: [],
    privacy: {},
    achievements: []
  });

  // State for individual forms (to manage their own dirty states if needed)
  const [selectedInterests, setSelectedInterests] = useState<any[]>([])
  const [selectedSkills, setSelectedSkills] = useState<any[]>([])
  const [educationHistory, setEducationHistory] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])

  // Derived states for completion calculation and form state management
  useEffect(() => {
    // Update unsaved changes when form states change
    const hasDirtyForms = Object.values(formDirtyStates).some(Boolean);
    setHasUnsavedChanges(hasDirtyForms);
  }, [formDirtyStates]);

  const [activeSection, setActiveSection] = useState<string | null>(null)


  // Warn user about unsaved changes only when there are actual changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Security check: Ensure user can only edit their own profile
  useEffect(() => {
    if (typeof window !== 'undefined' && user && user.id !== userId) {
      console.warn('User attempted to edit another user\'s profile')
      router.push(`/student/profile/edit`)
      return
    }
  }, [user, userId, router])

  // Update form data and track changes
  const handleFormChange = useCallback((sectionId: string, data: any, isDirty?: boolean) => {
    console.log(`📝 Form change detected in ${sectionId}:`, data, 'isDirty:', isDirty)
    
    // Update the specific section's data in the main formData state
    setFormData((prev: any) => ({ ...prev, [sectionId]: data }))
    setActiveSection(sectionId)

    // For goals, also update the profileData to ensure completion calculation works
    if (sectionId === 'goals') {
      setGoals(data); // Update local state for goals
      setCompletionData(prev => ({
        ...prev,
        goals: !!(data && data.length > 0)
      }))
    } else if (sectionId === 'personal') {
      setProfileData((prev: any) => ({
        ...prev,
        ...data
      }));
       // Recalculate completion for personal tab
      setCompletionData(prev => ({
        ...prev,
        personal: !!(data.firstName && data.lastName && data.bio && data.location && data.ageGroup && data.educationLevel)
      }));
    } else if (sectionId === 'interests') {
      setSelectedInterests(data); // Update local state for interests
       setCompletionData(prev => ({
        ...prev,
        interests: !!(data && data.length > 0)
      }))
    } else if (sectionId === 'skills') {
      setSelectedSkills(data); // Update local state for skills
       setCompletionData(prev => ({
        ...prev,
        skills: !!(data && data.length > 0)
      }))
    } else if (sectionId === 'education') {
      setEducationHistory(data); // Update local state for education
       setCompletionData(prev => ({
        ...prev,
        education: !!(data && data.length > 0)
      }))
    } else if (sectionId === 'media') {
       setProfileData((prev: any) => ({
        ...prev,
        moodBoard: data // Assuming moodBoard is part of profileData for media
      }));
        setCompletionData(prev => ({
        ...prev,
        media: !!(data && data.length > 0)
      }))
    } else if (sectionId === 'social') {
      setFormData((prev: any) => ({ ...prev, social: data })) // Assuming social is managed in formData
      setCompletionData(prev => ({
        ...prev,
        social: !!(data.githubUrl || data.linkedinUrl || data.portfolioUrl)
      }))
    } else if (sectionId === 'achievements') {
      setAchievements(data); // Update local state for achievements
      setCompletionData(prev => ({
        ...prev,
        achievements: !!(data && data.length > 0) // Assuming achievements are required for completion
      }))
    }

    // Track dirty state per form
    if (isDirty !== undefined) {
      setFormDirtyStates(prev => ({ ...prev, [sectionId]: isDirty }))
    }
  }, [formData, formDirtyStates, setGoals, setSelectedInterests, setSelectedSkills, setEducationHistory, setAchievements, setProfileData])

  // Watch for form changes in any section
  useEffect(() => {
    console.log('📝 Form change detected in', activeSection + ':', formData[activeSection], 'isDirty:', formDirtyStates[activeSection])
  }, [formData, activeSection, formDirtyStates])

  // Debug user data
  useEffect(() => {
    console.log('👤 ProfileEditForm: User data:', { userId: user?.id, userExists: !!user })
  }, [user])

  // Tab configuration
  const tabs: TabConfig[] = [
    {
      id: "personal",
      label: "Personal Info",
      icon: <User className="h-4 w-4" />,
      component: <PersonalInfoForm 
        data={formData.personal} 
        onChange={handleFormChange} 
        onSave={(data) => handleSectionSave('personal', data)}
      />,
      required: true
    },
    {
      id: "interests",
      label: "Interests & Passions",
      icon: <Heart className="h-4 w-4" />,
      component: <InterestsPassionsForm data={selectedInterests} onChange={handleFormChange} />,
      required: true
    },
    {
      id: "skills",
      label: "Skills & Abilities",
      icon: <Palette className="h-4 w-4" />,
      component: <SkillsAbilitiesForm data={selectedSkills} onChange={handleFormChange} />
    },
    {
      id: "goals",
      label: "Goals & Aspirations",
      icon: <Target className="h-4 w-4" />,
      component: <GoalsAspirationsForm data={goals} onChange={handleFormChange} />
    },
    {
      id: "social",
      label: "Social & Contact",
      icon: <MessageSquare className="h-4 w-4" />,
      component: (() => {
            console.log('🔧 ProfileEditForm: Rendering SocialContactForm with userId:', user?.id)
            if (!user?.id) {
              console.log('⚠️ ProfileEditForm: User ID not available yet, showing loading...')
              return <div className="p-8 text-center">Loading user data...</div>
            }
            return (
              <SocialContactForm
                data={formData.social}
                onChange={handleFormChange}
                userId={user.id}
              />
            )
          })()
    },
    {
      id: "education",
      label: "Education History",
      icon: <GraduationCap className="h-4 w-4" />,
      component: <EducationHistoryForm data={educationHistory} onChange={handleFormChange} />,
      required: true
    },
    {
      id: "media",
      label: "Mood Board & Media",
      icon: <ImageIcon className="h-4 w-4" />,
      component: <MoodBoardMediaForm data={formData.media} onChange={handleFormChange} />
    },
    {
      id: "privacy",
      label: "Privacy & Settings",
      icon: <Shield className="h-4 w-4" />,
      component: <PrivacySettingsForm data={formData.privacy} onChange={handleFormChange} />
    },
        {
      id: "achievements",
      label: "Achievements",
      icon: <ImageIcon className="h-4 w-4" />,
      component: <AchievementsForm data={achievements} onChange={handleFormChange} />
    }
  ]

  // Load profile data in background after initial render
  useEffect(() => {
    const fetchAllData = async () => {
      if (!user || user.role !== 'student') return

      setLoading(true) // Use setLoading instead of setIsLoading

      try {
        // Use cached profile data from useAuth if available
        const cachedProfileData = getCachedProfileData()
        if (cachedProfileData) {
          setFormData({
            firstName: cachedProfileData.profile?.firstName || '',
            lastName: cachedProfileData.profile?.lastName || '',
            bio: cachedProfileData.profile?.bio || '',
            location: cachedProfileData.profile?.location || '',
            tagline: cachedProfileData.profile?.tagline || '',
            ageGroup: cachedProfileData.profile?.ageGroup || 'young_adult',
            educationLevel: cachedProfileData.profile?.educationLevel || 'undergraduate',
            birthMonth: user.birthMonth || '',
            birthYear: user.birthYear || '',
            personalityType: user.personalityType || '',
            learningStyle: user.learningStyle || '',
            favoriteQuote: user.favoriteQuote || ''
          })
          setSelectedInterests(cachedProfileData.interests || [])
          setSelectedSkills(cachedProfileData.skills || [])
          setEducationHistory(cachedProfileData.educationHistory || [])
          setAchievements(cachedProfileData.achievements || [])
          setGoals(cachedProfileData.goals || [])
          setLoading(false) // Use setLoading
          return
        }

        // Only fetch if no cached data available
        const [
          profileResponse,
          interestsResponse,
          skillsResponse,
          educationResponse,
          achievementsResponse,
          goalsResponse,
          socialLinksResponse
        ] = await Promise.all([
          fetch('/api/auth/user', { 
            credentials: 'include',
            headers: { 'Cache-Control': 'max-age=300' }
          }),
          fetch('/api/user/interests', { 
            credentials: 'include',
            headers: { 'Cache-Control': 'max-age=300' }
          }),
          fetch('/api/user/skills', { 
            credentials: 'include',
            headers: { 'Cache-Control': 'max-age=300' }
          }),
          fetch('/api/education', { 
            credentials: 'include',
            headers: { 'Cache-Control': 'max-age=300' }
          }),
          fetch('/api/achievements', { 
            credentials: 'include',
            headers: { 'Cache-Control': 'max-age=300' }
          }),
          fetch('/api/goals', { 
            credentials: 'include',
            headers: { 'Cache-Control': 'max-age=300' }
          }),
          fetch('/api/profile/social-contact', { 
            credentials: 'include',
            headers: { 'Cache-Control': 'max-age=300' }
          })
        ])

        if (!profileResponse.ok) throw new Error('Failed to load user profile')
        if (!interestsResponse.ok) throw new Error('Failed to load interests')
        if (!skillsResponse.ok) throw new Error('Failed to load skills')
        if (!educationResponse.ok) throw new Error('Failed to load education history')
        if (!achievementsResponse.ok) throw new Error('Failed to load achievements')
        if (!goalsResponse.ok) throw new Error('Failed to load goals')
        if (!socialLinksResponse.ok) throw new Error('Failed to load social links')

        const userData = await profileResponse.json()
        const interestsData = await interestsResponse.json()
        const skillsData = await skillsResponse.json()
        const educationData = await educationResponse.json()
        const achievementsData = await achievementsResponse.json()
        const goalsData = await goalsResponse.json()
        const socialLinksData = await socialLinksResponse.json()

        // Populate form data and state
        setFormData({
          personal: {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            bio: userData.bio || '',
            location: userData.location || '',
            tagline: userData.tagline || '',
            ageGroup: userData.ageGroup || 'young_adult',
            educationLevel: userData.educationLevel || 'undergraduate',
            birthMonth: userData.birthMonth || '',
            birthYear: userData.birthYear || '',
            personalityType: userData.personalityType || '',
            learningStyle: userData.learningStyle || '',
            favoriteQuote: userData.favoriteQuote || ''
          },
          interests: interestsData,
          skills: skillsData,
          goals: goalsData,
          social: socialLinksData,
          education: educationData,
          media: userData.moodBoard || [], // Assuming moodBoard is part of user data
          privacy: userData.privacySettings || {}, // Assuming privacySettings
          achievements: achievementsData
        })

        // Set individual states
        setProfileData(userData); // Keep profileData for potential use elsewhere if needed
        setSelectedInterests(interestsData || [])
        setSelectedSkills(skillsData || [])
        setEducationHistory(educationData || [])
        setAchievements(achievementsData || [])
        setGoals(goalsData || [])

        // Calculate initial completion status
        const completion: Record<string, boolean> = {}
        tabs.forEach(tab => {
          completion[tab.id] = calculateSectionCompletion(tab.id, {
            ...userData,
            interests: interestsData,
            skills: skillsData,
            goals: goalsData,
            educationHistory: educationData,
            achievements: achievementsData,
            socialLinks: socialLinksData
          })
        })
        setCompletionData(completion)

      } catch (error) {
        console.error('Error loading profile:', error)
        toast.error('Failed to load profile data')
      } finally {
        setLoading(false) // Use setLoading
      }
    }

    // Start loading immediately but don't block render
    fetchAllData()
  }, [userId, user]) // Depend on user as well

  // Calculate section completion
  const calculateSectionCompletion = (sectionId: string, data: any): boolean => {
    if (!data) return false

    switch (sectionId) {
      case "personal":
        return !!(data.firstName && data.lastName && data.bio && data.location && data.ageGroup && data.educationLevel)
      case "interests":
        return !!(data.interests && data.interests.length > 0)
      case "skills":
        return !!(data.skills && data.skills.length > 0)
      case "goals":
        return !!(data.goals && data.goals.length > 0)
      case "social":
        return !!(data.githubUrl || data.linkedinUrl || data.portfolioUrl)
      case "education":
        return !!(data.educationHistory && data.educationHistory.length > 0)
      case "media":
        return !!(data.moodBoard && data.moodBoard.length > 0)
      case "privacy":
        return true // Always considered complete
          case "achievements":
        return !!(data.achievements && data.achievements.length > 0)
      default:
        return false
    }
  }

  // Calculate overall completion percentage
  const completionPercentage = Math.round(
    (Object.values(completionData).filter(Boolean).length / tabs.length) * 100
  )

  // Handle save for specific sections
  const handleSectionSave = async (sectionId: string, data: any) => {
    try {
      setSaving(true)

      let apiUrl = '';
      let method = 'PUT';
      let requestBody = data;

      switch(sectionId) {
        case 'personal':
          apiUrl = '/api/profile/personal-info';
          break;
        case 'interests':
          apiUrl = '/api/user/interests';
          break;
        case 'skills':
          apiUrl = '/api/user/skills';
          break;
        case 'goals':
          apiUrl = '/api/goals';
          break;
        case 'social':
          apiUrl = '/api/profile/social-contact';
          break;
        case 'education':
          apiUrl = '/api/education';
          break;
        case 'media':
          apiUrl = '/api/profile/media'; // Assuming an endpoint for media
          break;
        case 'privacy':
          apiUrl = '/api/profile/privacy-settings'; // Assuming an endpoint for privacy
          break;
        case 'achievements':
          apiUrl = '/api/achievements';
          break;
        default:
          throw new Error(`Unknown sectionId: ${sectionId}`);
      }

      console.log(`💾 Saving ${sectionId} section to ${apiUrl}:`, requestBody)

      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to save ${sectionId}`)
      }

      const result = await response.json()
      console.log(`✅ ${sectionId} saved successfully:`, result)

      // Update local state and completion data after successful save
      if (sectionId === 'personal') {
        setProfileData((prev: any) => ({ ...prev, ...data }))
      } else if (sectionId === 'interests') {
        setSelectedInterests(data)
      } else if (sectionId === 'skills') {
        setSelectedSkills(data)
      } else if (sectionId === 'goals') {
        setGoals(data)
      } else if (sectionId === 'education') {
        setEducationHistory(data)
      } else if (sectionId === 'achievements') {
        setAchievements(data)
      }
      // Update completion status after saving
      setCompletionData(prev => ({
        ...prev,
        [sectionId]: calculateSectionCompletion(sectionId, {
          ...formData.personal, // Include current form data for recalculation
          ...formData.interests,
          ...formData.skills,
          ...formData.goals,
          ...formData.social,
          ...formData.education,
          ...formData.media,
          ...formData.privacy,
          ...formData.achievements,
          [sectionId]: data // Use the newly saved data
        })
      }))


      toast.success(`${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} updated successfully!`)
      setFormDirtyStates(prev => ({ ...prev, [sectionId]: false })) // Mark as not dirty after save

    } catch (error) {
      console.error('Error saving section:', error)
      toast.error(`Failed to save ${sectionId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error // Re-throw to let the form component handle it
    } finally {
      setSaving(false)
    }
  }

  // Handle save - general save for all sections
  const handleSave = async () => {
    try {
      setSaving(true)

      // For now, just show a message that individual sections should be saved
      toast.info('Please save each section individually using the forms')

      setHasUnsavedChanges(false)

    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile changes')
    } finally {
      setSaving(false)
    }
  }

  // Handle navigation with unsaved changes warning
  const handleNavigation = (tabId: string) => {
    // Check if there are actually any dirty forms
    const actuallyHasDirtyForms = Object.values(formDirtyStates).some(dirty => dirty)

    if (actuallyHasDirtyForms) {
      const confirmed = window.confirm('You have unsaved changes. Do you want to save before switching sections?')
      if (confirmed) {
        // Attempt to save the currently active dirty form before switching
        const activeTabConfig = tabs.find(tab => tab.id === activeTab);
        if (activeTabConfig && formDirtyStates[activeTab]) {
          // Assuming handleSectionSave is available and works for the active tab
          // You might need to pass the current form data to handleSectionSave
          // For simplicity, we'll just prompt to save and then switch
          // A more robust solution would involve passing the correct data
          handleSectionSave(activeTab, formData[activeTab]).then(() => setActiveTab(tabId));
        } else {
           setActiveTab(tabId);
        }
        return;
      }
    }
    setActiveTab(tabId)
  }

  // Handle back navigation
  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?')
      if (!confirmed) return
    }
    router.push('/student/profile')
  }

  // Always render the form structure immediately

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <div>
              <h2 className="text-xl font-bold">Edit Your Profile</h2>
              <p className="text-white/80 text-sm">Complete your profile to help others connect with you</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
      </div>

      <div className="flex">
        {/* Vertical Navigation - Desktop */}
        <div className="hidden lg:block w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                const isComplete = completionData[tab.id]
                const isRequired = tab.required

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleNavigation(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-pathpiper-teal text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      {tab.icon}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{tab.label}</span>
                        {isRequired && (
                          <span className="text-xs text-red-500">*</span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden w-full border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="p-4">
            <select
              value={activeTab}
              onChange={(e) => handleNavigation(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label} {tab.required ? '*' : ''} {completionData[tab.id] ? '✓' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 min-h-[600px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading profile...</p>
            </div>
          ) : (
            <div className="p-6 lg:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {tabs.find(tab => tab.id === activeTab)?.component}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}