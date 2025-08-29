"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { motion, AnimatePresence } from "framer-motion"
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
import { Progress } from "@/components/ui/progress"


// Form loading skeleton
const FormSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="space-y-4">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
    </div>

    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="space-y-2">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    ))}

    <div className="flex justify-end pt-6">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
    </div>
  </div>
)

// Lazy load heavy form components only when needed
const PersonalInfoForm = dynamic(() => import('./forms/personal-info-form').then(m => ({ default: m.PersonalInfoForm })), {
  loading: () => <FormSkeleton />,
  ssr: false
})

const InterestsPassionsForm = dynamic(() => import('./forms/interests-passions-form').then(m => ({ default: m.InterestsPassionsForm })), {
  loading: () => <FormSkeleton />,
  ssr: false
})

const SkillsAbilitiesForm = dynamic(() => import('./forms/skills-abilities-form').then(m => ({ default: m.SkillsAbilitiesForm })), {
  loading: () => <FormSkeleton />,
  ssr: false
})

const EducationHistoryForm = dynamic(() => import('./forms/education-history-form').then(m => ({ default: m.EducationHistoryForm })), {
  loading: () => <FormSkeleton />,
  ssr: false
})

const GoalsAspirationsForm = dynamic(() => import('./forms/goals-aspirations-form').then(m => ({ default: m.GoalsAspirationsForm })), {
  loading: () => <FormSkeleton />,
  ssr: false
})

const AchievementsForm = dynamic(() => import('./forms/achievements-form').then(m => ({ default: m.AchievementsForm })), {
  loading: () => <FormSkeleton />,
  ssr: false
})

const MoodBoardMediaForm = dynamic(() => import('./forms/mood-board-media-form').then(m => ({ default: m.MoodBoardMediaForm })), {
  loading: () => <FormSkeleton />,
  ssr: false
})

const SocialContactForm = dynamic(() => import('./forms/social-contact-form').then(m => ({ default: m.SocialContactForm })), {
  loading: () => <FormSkeleton />,
  ssr: false
})

const PrivacySettingsForm = dynamic(() => import('./forms/privacy-settings-form').then(m => ({ default: m.PrivacySettingsForm })), {
  loading: () => <FormSkeleton />,
  ssr: false
})

interface ProfileEditFormProps {
  userId: string
  initialSection?: string
}

interface TabConfig {
  id: string
  label: string
  icon: React.ReactNode
  required?: boolean
}

interface PersonalInfoFormProps {
  data: any
  onChange: (sectionId: string, data: any, isDirty?: boolean) => void
  onSave?: (data: any) => Promise<void>
}


// Named export for better tree shaking
export function ProfileEditForm({ userId, initialSection }: ProfileEditFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(initialSection || "personal")
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completionData, setCompletionData] = useState<Record<string, boolean>>({})
  const [formDirtyStates, setFormDirtyStates] = useState<{[key: string]: boolean}>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Update unsaved changes when form states change
  useEffect(() => {
    const hasDirtyForms = Object.values(formDirtyStates).some(Boolean);
    setHasUnsavedChanges(hasDirtyForms);
  }, [formDirtyStates]);

  const [formData, setFormData] = useState<any>({
    skills: [],
    interests: [],
    goals: [],
  })
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(['personal'])) // Start with personal tab loaded

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
    setFormData((prev: any) => ({ ...prev, [sectionId]: data }))
    setActiveSection(sectionId)

    // For goals, also update the profileData to ensure completion calculation works
    if (sectionId === 'goals') {
      setProfileData((prev: any) => ({
        ...prev,
        goals: data
      }))

      // Recalculate completion for goals tab
      setCompletionData(prev => ({
        ...prev,
        goals: !!(data && data.length > 0)
      }))
    }

    // Track dirty state per form
    if (isDirty !== undefined) {
      setFormDirtyStates(prev => ({ ...prev, [sectionId]: isDirty }))
      // Update overall dirty state based on any form being dirty
      const hasAnyDirtyForm = Object.values({ ...formDirtyStates, [sectionId]: isDirty }).some(dirty => dirty)
      setHasUnsavedChanges(hasAnyDirtyForm)
    }
  }, [formDirtyStates])

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
      required: true
    },
    {
      id: "interests",
      label: "Interests & Passions",
      icon: <Heart className="h-4 w-4" />,
      required: true
    },
    {
      id: "skills",
      label: "Skills & Abilities",
      icon: <Palette className="h-4 w-4" />,
    },
    {
      id: "goals",
      label: "Goals & Aspirations",
      icon: <Target className="h-4 w-4" />,
    },
    {
      id: "social",
      label: "Social & Contact",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      id: "education",
      label: "Education History",
      icon: <GraduationCap className="h-4 w-4" />,
      required: true
    },
    {
      id: "media",
      label: "Mood Board & Media",
      icon: <ImageIcon className="h-4 w-4" />,
    },
    {
      id: "privacy",
      label: "Privacy & Settings",
      icon: <Shield className="h-4 w-4" />,
    },
        {
      id: "achievements",
      label: "Achievements",
      icon: <ImageIcon className="h-4 w-4" />,
    }
  ]

  // Load profile data in background after initial render
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Set empty completion data immediately for instant render
        const emptyCompletion: Record<string, boolean> = {}
        tabs.forEach(tab => {
          emptyCompletion[tab.id] = false
        })
        setCompletionData(emptyCompletion)

        // Fetch data in background
        const response = await fetch('/api/profile/personal-info')
        if (!response.ok) throw new Error('Failed to load profile')

        const userData = await response.json()
        setProfileData(userData)

        // Calculate completion status for each section
        const completion: Record<string, boolean> = {}
        tabs.forEach(tab => {
          completion[tab.id] = calculateSectionCompletion(tab.id, userData)
        })
        setCompletionData(completion)

      } catch (error) {
        console.error('Error loading profile:', error)
        toast.error('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    // Start loading immediately but don't block render
    loadProfileData()
  }, [userId])

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
        return true // Always considered complete
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

      if (sectionId === 'personal') {
        console.log('💾 Saving personal info section:', data)

        const response = await fetch('/api/profile/personal-info', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save personal info')
        }

        const result = await response.json()
        console.log('✅ Personal info saved successfully:', result)

        // Update the profile data with the saved data
        setProfileData((prev: any) => ({
          ...prev,
          ...data
        }))

        toast.success('Personal information updated successfully!')
      }
      // Add other section save logic here as needed

      setHasUnsavedChanges(false)

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
        handleSave().then(() => {
          setActiveTab(tabId)
          setLoadedTabs(prev => new Set([...prev, tabId]))
        })
        return
      }
    }
    setActiveTab(tabId)
    setLoadedTabs(prev => new Set([...prev, tabId]))
  }

  // Handle back navigation
  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?')
      if (!confirmed) return
    }
    router.push('/student/profile')
  }

  // Use the dynamically imported components conditionally based on loadedTabs state
  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case "personal":
        return loadedTabs.has('personal') && (
              <PersonalInfoForm data={profileData} onChange={handleFormChange} onSave={(data) => handleSectionSave('personal', data)} />
            )
      case "interests":
        return loadedTabs.has('interests') && (
              <InterestsPassionsForm data={profileData} onChange={handleFormChange} />
            )
      case "skills":
        return loadedTabs.has('skills') && (
              <SkillsAbilitiesForm data={profileData} onChange={handleFormChange} />
            )
      case "goals":
        return loadedTabs.has('goals') && (
              <GoalsAspirationsForm data={formData.goals} onChange={handleFormChange} />
            )
      case "social":
        return (() => {
          console.log('🔧 ProfileEditForm: Rendering SocialContactForm with userId:', user?.id)
          if (!user?.id) {
            console.log('⚠️ ProfileEditForm: User ID not available yet, showing loading...')
            return <div className="p-8 text-center">Loading user data...</div>
          }
          return loadedTabs.has('social') && (
            <SocialContactForm
              data={formData.social}
              onChange={handleFormChange}
              userId={user.id}
            />
          )
        })()
      case "education":
        return loadedTabs.has('education') && (
              <EducationHistoryForm data={profileData} onChange={handleFormChange} />
            )
      case "media":
        return loadedTabs.has('media') && (
              <MoodBoardMediaForm data={profileData} onChange={handleFormChange} />
            )
      case "privacy":
        return loadedTabs.has('privacy') && (
              <PrivacySettingsForm data={profileData} onChange={handleFormChange} />
            )
      case "achievements":
        return loadedTabs.has('achievements') && (
              <AchievementsForm data={profileData} onChange={handleFormChange} />
            )
      default:
        return null
    }
  }

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
        <div className="mt-4">
          <Progress value={completionPercentage} className="h-2 bg-white/50" />
          <p className="text-xs mt-1 text-white/80">{completionPercentage}% Profile Complete</p>
        </div>
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
          <div className="p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Conditionally render content only if the tab has been loaded */}
                {renderTabContent(activeTab) || <FormSkeleton />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}