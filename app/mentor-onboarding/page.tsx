"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, CheckCircle, User, BookOpen, Award, MessageSquare } from "lucide-react"
import OnboardingHeader from "@/components/onboarding/onboarding-header"
import MentorPersonalInfoStep from "@/components/onboarding/mentor/personal-info-step"
import MentorExpertiseStep from "@/components/onboarding/mentor/expertise-step"
import MentorExperienceStep from "@/components/onboarding/mentor/experience-step"
import MentorAvailabilityStep from "@/components/onboarding/mentor/availability-step"
import MentorCompletionStep from "@/components/onboarding/mentor/completion-step"
import { supabase } from "@/lib/supabase"

// Define the steps for the mentor onboarding process
const STEPS = [
  { id: "personal-info", title: "Personal Info", icon: <User className="h-5 w-5" /> },
  { id: "expertise", title: "Expertise", icon: <Award className="h-5 w-5" /> },
  { id: "experience", title: "Experience", icon: <BookOpen className="h-5 w-5" /> },
  { id: "availability", title: "Availability", icon: <MessageSquare className="h-5 w-5" /> },
  { id: "completion", title: "Complete", icon: <CheckCircle className="h-5 w-5" /> },
]

export default function MentorOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    personalInfo: {
      firstName: "",
      lastName: "",
      bio: "",
      location: "",
      profession: "",
      organization: "",
      profileImage: null,
    },
    expertise: [],
    experience: [],
    availability: {
      hoursPerWeek: 0,
      preferredTimes: [],
      menteeCount: 0,
    },
  })
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({})
  
  // Fetch user data on component mount
  useEffect(() => {
    async function fetchMentorData() {
      try {
        setIsLoading(true)
        
        // Get current user session
        const { data: sessionData } = await supabase.auth.getSession()
        
        if (!sessionData.session) {
          console.error("No active session found")
          setIsLoading(false)
          return
        }
        
        // Fetch mentor profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single()
          
        if (profileError) {
          console.error("Error fetching profile:", profileError)
          setIsLoading(false)
          return
        }
        
        // Fetch mentor specific profile data
        const { data: mentorProfile, error: mentorError } = await supabase
          .from('mentor_profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single()
          
        if (mentorError && mentorError.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error("Error fetching mentor profile:", mentorError)
        }
        
        // Fetch mentor expertise
        const { data: mentorExpertise, error: expertiseError } = await supabase
          .from('mentor_expertise')
          .select('*')
          .eq('mentor_id', sessionData.session.user.id)
          
        if (expertiseError) {
          console.error("Error fetching expertise:", expertiseError)
        }
        
        // Fetch mentor experience
        const { data: mentorExperience, error: experienceError } = await supabase
          .from('mentor_experience')
          .select('*')
          .eq('mentor_id', sessionData.session.user.id)
          
        if (experienceError) {
          console.error("Error fetching experience:", experienceError)
        }
        
        // Fetch mentor availability
        const { data: mentorAvailability, error: availabilityError } = await supabase
          .from('mentor_availability')
          .select('*')
          .eq('mentor_id', sessionData.session.user.id)
          
        if (availabilityError) {
          console.error("Error fetching availability:", availabilityError)
        }
        
        // Format expertise, experience and availability data
        const expertise = mentorExpertise?.map(item => ({
          id: item.id,
          subject: item.subject,
          description: item.description,
          yearsExperience: item.years_experience
        })) || []
        
        const experience = mentorExperience?.map(item => ({
          id: item.id,
          title: item.title,
          organization: item.organization,
          startDate: item.start_date,
          endDate: item.end_date,
          current: item.current,
          description: item.description,
          type: item.type,
          credentialId: item.credential_id,
          credentialUrl: item.credential_url
        })) || []
        
        // Update state with fetched data
        setProfileData({
          personalInfo: {
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            bio: profile.bio || "",
            location: profile.location || "",
            profession: mentorProfile?.profession || "",
            organization: mentorProfile?.organization || "",
            profileImage: profile.profile_image_url || null,
          },
          expertise,
          experience,
          availability: {
            hoursPerWeek: mentorProfile?.hours_per_week || 0,
            preferredTimes: mentorAvailability?.map(item => item.time_slot) || [],
            menteeCount: mentorProfile?.max_mentees || 0,
          },
        })
        
        // Set completed steps based on data availability
        const completed: Record<string, boolean> = {}
        
        if (profile.first_name && profile.last_name) {
          completed.personalInfo = true
        }
        
        if (expertise.length > 0) {
          completed.expertise = true
        }
        
        if (experience.length > 0) {
          completed.experience = true
        }
        
        if (mentorProfile?.hours_per_week && mentorProfile.max_mentees) {
          completed.availability = true
        }
        
        setCompletedSteps(completed)
        
      } catch (error) {
        console.error("Error loading mentor data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMentorData()
  }, [])

  // Calculate completion percentage
  const completionPercentage = Math.round(
    (Object.values(completedSteps).filter(Boolean).length / (STEPS.length - 1)) * 100,
  )

  const handleStepComplete = (stepId: string, data: any) => {
    setProfileData((prev) => ({
      ...prev,
      [stepId]: data,
    }))
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: true,
    }))
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const handleJumpToStep = (index: number) => {
    setCurrentStep(index)
  }

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <OnboardingHeader completionPercentage={completionPercentage} />

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {isLoading ? (
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full border-4 border-teal-400 border-t-transparent animate-spin"></div>
              <p className="text-slate-600">Loading your mentor profile data...</p>
            </div>
          </div>
        ) : (
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Step navigation */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`p-2 rounded-full ${
                  currentStep === 0
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-500 hover:text-orange-500 hover:bg-orange-50"
                }`}
              >
                <ArrowLeft size={20} />
              </button>

              <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto py-2 scrollbar-hide">
                {STEPS.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-center"
                    onClick={() => {
                      // Only allow jumping to completed steps or the current step
                      if (completedSteps[step.id] || index <= currentStep) {
                        handleJumpToStep(index)
                      }
                    }}
                  >
                    <div
                      className={`flex items-center justify-center h-10 w-10 rounded-full ${
                        index === currentStep
                          ? "bg-orange-500 text-white"
                          : completedSteps[step.id]
                            ? "bg-orange-100 text-orange-600 cursor-pointer"
                            : "bg-slate-200 text-slate-500"
                      } ${index <= currentStep ? "cursor-pointer" : ""}`}
                    >
                      {completedSteps[step.id] ? <CheckCircle className="h-5 w-5" /> : step.icon}
                    </div>
                    <span
                      className={`hidden md:block ml-2 text-sm ${
                        index === currentStep
                          ? "text-orange-500 font-medium"
                          : completedSteps[step.id]
                            ? "text-slate-700"
                            : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </span>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`hidden md:block w-8 h-0.5 mx-2 ${
                          index < currentStep || (completedSteps[step.id] && index + 1 < STEPS.length && completedSteps[STEPS[index + 1].id])
                            ? "bg-orange-500"
                            : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {currentStep < STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="p-2 rounded-full text-slate-500 hover:text-orange-500 hover:bg-orange-50"
                >
                  <ArrowRight size={20} />
                </button>
              ) : (
                <div className="w-10"></div> // Placeholder for alignment
              )}
            </div>
          </div>

          {/* Step content */}
          <div className="p-6 md:p-8">
            {currentStep === 0 && (
              <MentorPersonalInfoStep
                initialData={profileData.personalInfo}
                onComplete={(data) => handleStepComplete("personalInfo", data)}
                onNext={handleNext}
              />
            )}
            {currentStep === 1 && (
              <MentorExpertiseStep
                initialData={profileData.expertise}
                onComplete={(data) => handleStepComplete("expertise", data)}
                onNext={handleNext}
                onSkip={handleSkip}
              />
            )}
            {currentStep === 2 && (
              <MentorExperienceStep
                initialData={profileData.experience}
                onComplete={(data) => handleStepComplete("experience", data)}
                onNext={handleNext}
                onSkip={handleSkip}
              />
            )}
            {currentStep === 3 && (
              <MentorAvailabilityStep
                initialData={profileData.availability}
                onComplete={(data) => handleStepComplete("availability", data)}
                onNext={handleNext}
                onSkip={handleSkip}
              />
            )}
            {currentStep === 4 && (
              <MentorCompletionStep profileData={profileData} completionPercentage={completionPercentage} />
            )}
          </div>
        </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full py-4 px-6 bg-white border-t border-slate-200">
        <div className="container mx-auto flex justify-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} PathPiper. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
