"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"

import InternalNavbar from "@/components/internal-navbar"
import PersonalInfoStep from "@/components/onboarding/personal-info-step"
import InterestsStep from "@/components/onboarding/interests-step"
import SkillsStep from "@/components/onboarding/skills-step"
import EducationStep from "@/components/onboarding/education-step"
import GoalsStep from "@/components/onboarding/goals-step"
import CompletionStep from "@/components/onboarding/completion-step"
import { User, BookOpen, Code, GraduationCap, Target, CheckCircle } from "lucide-react"

// Define the steps for the student onboarding process
const STEPS = [
  { id: "personal-info", title: "Personal Info", icon: <User className="h-5 w-5" /> },
  { id: "interests", title: "Interests", icon: <BookOpen className="h-5 w-5" /> },
  { id: "skills", title: "Skills", icon: <Code className="h-5 w-5" /> },
  { id: "education", title: "Education", icon: <GraduationCap className="h-5 w-5" /> },
  { id: "goals", title: "Goals", icon: <Target className="h-5 w-5" /> },
]

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthdate: "",
    location: "",
    interests: [],
    skills: [],
    skillLevels: {},
    educationHistory: [],
    goals: [],
    educationLevel: "",
    bio: "",
    birthMonth: "",
    birthYear: "",
    ageGroup: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)

  // Fetch user data and check profile completeness first
  useEffect(() => {
    const fetchUserDataAndCheckCompletion = async () => {
      try {
        console.log("Fetching user data from API...")
        setIsCheckingProfile(true)

        const response = await fetch("/api/auth/user", {
          method: "GET",
          credentials: 'include',
          cache: 'no-store'
        })

        if (response.ok) {
          const data = await response.json()
          console.log("User data received:", data)

          // FIRST: Check profile completeness before setting any user data
          if (data.user) {
            try {
              const profileResponse = await fetch('/api/student/profile/' + data.user.id, {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store'
              });

              if (profileResponse.ok) {
                const profileData = await profileResponse.json();

                // Check 1: Personal Information (first name, last name, bio)
                const hasBasicInfo = profileData.profile.firstName && 
                                   profileData.profile.lastName && 
                                   profileData.profile.bio;

                // Check 2: Interests (at least one interest)
                const hasInterests = profileData.profile.userInterests && 
                                   profileData.profile.userInterests.length > 0;

                // Check 3: Education History (at least one education entry)
                const hasEducation = profileData.educationHistory && 
                                   profileData.educationHistory.length > 0;

                console.log('🔍 Onboarding page completion check:', {
                  hasBasicInfo,
                  hasInterests: `${profileData.profile.userInterests?.length || 0} interests`,
                  hasEducation: `${profileData.educationHistory?.length || 0} education entries`
                });

                // If profile is complete, redirect immediately before loading any form data
                if (hasBasicInfo && hasInterests && hasEducation) {
                  console.log('✅ All three sections complete, redirecting to profile');
                  router.push("/student/profile")
                  return // Exit early, don't load form data
                } else {
                  console.log('❌ One or more sections incomplete, loading onboarding form');
                  setIsCheckingProfile(false)
                }
              } else {
                console.log('❌ Failed to fetch profile data, loading onboarding form');
                setIsCheckingProfile(false)
              }
            } catch (error) {
              console.error('Error checking profile completeness:', error);
              setIsCheckingProfile(false)
            }
          } else {
            console.log('❌ No user data, loading onboarding form');
            setIsCheckingProfile(false)
          }

          // ONLY load user data if profile is incomplete (we reach this point)
          if (data.user) {
            // Fetch existing goals
            let existingGoals = [];
            try {
              const goalsResponse = await fetch('/api/goals', {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store'
              });

              if (goalsResponse.ok) {
                const goalsData = await goalsResponse.json();
                existingGoals = goalsData.goals || [];
                console.log('Loaded existing goals:', existingGoals);
              }
            } catch (error) {
              console.error('Error fetching existing goals:', error);
            }

            // Set user data from API response
            setUserData({
              firstName: data.user.firstName || "",
              lastName: data.user.lastName || "",
              email: data.user.email || "",
              birthdate: data.user.birthdate || "",
              location: data.user.location || "",
              interests: [],
              skills: [],
              skillLevels: {},
              goals: existingGoals,
              educationLevel: data.user.educationLevel || "",
              bio: data.user.bio || "",
              birthMonth: data.user.birthMonth || "",
              birthYear: data.user.birthYear || "",
              ageGroup: data.user?.studentProfile?.age_group || ''
            })
          } else {
            console.warn("No user data found in response")
          }
        } else {
          console.error("Failed to fetch user data:", response.status)
          // Redirect to login if unauthorized
          if (response.status === 401) {
            router.push("/login")
            return
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Failed to load user data")
      } finally {
        setLoading(false)
      }
    }

    fetchUserDataAndCheckCompletion()
  }, [router])

  // Show loading while checking profile completeness
  if (loading || isCheckingProfile) {
    return (
      <main className="min-h-screen flex flex-col bg-slate-50">
        <InternalNavbar />
        <div className="pt-16 md:pt-14 w-full flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-slate-600">
              {isCheckingProfile ? "Checking your profile..." : "Loading your profile..."}
            </p>
          </div>
        </div>
      </main>
    )
  }

  const handleNext = () => {
    setStep(step + 1)
    window.scrollTo(0, 0)
  }

  const handleBack = () => {
    setStep(step - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          profile: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            birthdate: userData.birthdate,
            location: userData.location,
            interests: userData.interests,
            skill_levels: userData.skillLevels,
            goals: userData.goals,
            education_level: userData.educationLevel,
            bio: userData.bio,
            onboarding_completed: true,
          },
        }),
      })

      if (response.ok) {
        toast.success("Profile updated successfully!")
        setStep(5) // Move to completion step
      } else {
        const error = await response.json()
        toast.error("Failed to update profile: " + (error.message || "Unknown error"))
      }
    } catch (error) {
      toast.error("An error occurred: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  

  const handlePersonalInfoComplete = async (data: any) => {
    console.log('Personal info completed:', data);

    try {
      // Submit the form data to update profile with proper field mapping
      const response = await fetch('/api/auth/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            firstName: data.firstName,
            lastName: data.lastName,
            bio: data.bio,
            location: data.location,
            educationLevel: data.educationLevel,
            birthMonth: data.birthMonth,
            birthYear: data.birthYear,
            ageGroup: data.ageGroup
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Profile updated successfully:', result);

        // Update local state with the saved data
        setUserData({
          ...userData,
          firstName: data.firstName,
          lastName: data.lastName,
          bio: data.bio,
          location: data.location,
          educationLevel: data.educationLevel,
          birthMonth: data.birthMonth,
          birthYear: data.birthYear,
          ageGroup: data.ageGroup
        });

        // Navigate to interests step
        setStep(2);
      } else {
        const error = await response.json();
        console.error('Failed to update profile:', error);
        toast.error("Failed to update profile: " + (error.message || "Unknown error"))
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("An error occurred: " + error.message)
    }
  };

    // Function to calculate age group based on birth year
    const calculateAgeGroup = (birthYear: string) => {
      const currentYear = new Date().getFullYear();
      const age = currentYear - parseInt(birthYear);

      if (age <= 25) {
          return 'young-adult';
      } else if (age <= 40) {
          return 'adult';
      } else {
          return 'senior';
      }
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <InternalNavbar />

      {/* Add padding to account for fixed navbar */}
      <div className="pt-16 md:pt-14 w-full">
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Step navigation */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBack}
                  disabled={step === 1}
                  className={`p-2 rounded-full ${
                    step === 1
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-500 hover:text-teal-500 hover:bg-teal-50"
                  }`}
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="flex-1 mx-4">
                  <div className="flex items-center justify-between">
                    {STEPS.map((s, index) => {
                      const isActive = step === index + 1;
                      const isCompleted = step > index + 1;

                      return (
                        <div key={s.id} className="flex flex-col items-center">
                          <div
                            className={`flex items-center justify-center h-10 w-10 rounded-full 
                              ${isActive 
                                ? "bg-teal-500 text-white" 
                                : isCompleted 
                                  ? "bg-teal-100 text-teal-700" 
                                  : "bg-slate-100 text-slate-400"
                              } transition-all duration-200`}
                          >
                            {s.icon}
                          </div>
                          <span 
                            className={`mt-1 text-xs font-medium hidden sm:block
                              ${isActive 
                                ? "text-teal-600" 
                                : isCompleted 
                                  ? "text-slate-700" 
                                  : "text-slate-400"
                              }`}
                          >
                            {s.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="relative mt-2 hidden sm:block">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 rounded-full"></div>
                    <div 
                      className="absolute top-0 left-0 h-1 bg-teal-500 rounded-full" 
                      style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={step < 5 ? handleNext : () => {}}
                  disabled={step === 5}
                  className={`p-2 rounded-full ${
                    step === 5
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-500 hover:text-teal-500 hover:bg-teal-50"
                  }`}
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8">
              
{step === 1 && (
                <PersonalInfoStep
                  initialData={{
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    bio: userData.bio,
                    location: userData.location,
                    educationLevel: userData.educationLevel,
                    birthMonth: userData.birthMonth,
                    birthYear: userData.birthYear,
                    ageGroup: userData.ageGroup,
                    profileImage: null
                  }}
                  onComplete={async (data) => {
                    console.log('📝 Personal info step completed with data:', data);

                    try {
                      // Save personal info data to database immediately
                      const personalInfoResponse = await fetch("/api/auth/user", {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                          profile: {
                            firstName: data.firstName,
                            lastName: data.lastName,
                            bio: data.bio,
                            location: data.location,
                          },
                          studentProfile: {
                            educationLevel: data.educationLevel,
                            age_group: data.ageGroup,
                            birthMonth: data.birthMonth,
                            birthYear: data.birthYear
                          }
                        }),
                      });

                      if (personalInfoResponse.ok) {
                        console.log('✅ Personal info saved successfully');
                        toast.success('Personal information saved');
                        setUserData(prev => ({
                          ...prev,
                          firstName: data.firstName,
                          lastName: data.lastName,
                          bio: data.bio,
                          location: data.location,
                          educationLevel: data.educationLevel,
                          birthMonth: data.birthMonth,
                          birthYear: data.birthYear,
                          ageGroup: data.ageGroup
                        }));
                        setStep(2);
                      } else {
                        const error = await personalInfoResponse.json();
                        console.error('❌ Failed to save personal info:', error);
                        toast.error('Failed to save personal information: ' + (error.message || 'Unknown error'));
                      }
                    } catch (error) {
                      console.error('❌ Error saving personal info:', error);
                      toast.error('Failed to save personal information');
                    }
                  }}
                  onNext={handleNext}
                />
              )}

              {step === 2 && (
                <InterestsStep
                  initialData={userData.interests || []}
                  onComplete={async (interests) => {
                    console.log('🎯 Interests step completed with data:', interests);
                    
                    // Save interests data immediately (matching edit profile behavior)
                    try {
                      // Interests data is saved within the InterestsStep component itself
                      // Just update local state and proceed
                      setUserData({ ...userData, interests });
                      console.log('✅ Interests data updated in local state');
                      handleNext();
                    } catch (error) {
                      console.error('❌ Error in interests step completion:', error);
                      toast.error('Failed to save interests data');
                    }
                  }}
                  onNext={handleNext}
                  onSkip={() => {
                    console.log('🔄 Skipping interests step');
                    setUserData({ ...userData, interests: [] });
                    handleNext();
                  }}
                  ageGroup={userData.ageGroup}
                />
              )}

              {step === 3 && (
                <SkillsStep
                  initialData={userData.skills || []}
                  onComplete={async (skills) => {
                    console.log('🛠️ Skills step completed with data:', skills);
                    
                    // Skills are saved within the SkillsStep component itself
                    // Just update local state and proceed
                    setUserData({ ...userData, skills });
                    console.log('✅ Skills data updated in local state');
                    
                    // The SkillsStep component handles the database save,
                    // so we just need to proceed to the next step
                    handleNext();
                  }}
                  onNext={handleNext}
                  onSkip={() => {
                    console.log('🔄 Skipping skills step');
                    setUserData({ ...userData, skills: [] });
                    handleNext();
                  }}
                  ageGroup={userData.ageGroup}
                />
              )}

              {step === 4 && (
                <EducationStep
                  initialData={userData.educationHistory || []}
                  onComplete={async (educationHistory) => {
                    console.log('📚 Education step completed with data:', educationHistory);
                    
                    // Save education data immediately (matching edit profile behavior)
                    try {
                      // Education data is saved within the EducationStep component itself
                      // Just update local state and proceed
                      setUserData({ ...userData, educationHistory });
                      console.log('✅ Education data updated in local state');
                      handleNext();
                    } catch (error) {
                      console.error('❌ Error in education step completion:', error);
                      toast.error('Failed to save education data');
                    }
                  }}
                  onNext={handleNext}
                  onSkip={() => {
                    console.log('🔄 Skipping education step');
                    setUserData({ ...userData, educationHistory: [] });
                    handleNext();
                  }}
                  ageGroup={userData.ageGroup}
                />
              )}

              {step === 5 && (
                <GoalsStep
                  initialData={userData.goals || []}
                  onComplete={async (goals) => {
                    setUserData({ ...userData, goals });

                    // Save goals to database
                    try {
                      const response = await fetch('/api/goals', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({ goals }),
                      });

                      if (!response.ok) {
                        const error = await response.json();
                        console.error('Failed to save goals:', error);
                        toast.error('Failed to save goals: ' + (error.message || 'Unknown error'));
                        return;
                      }

                      console.log('Goals saved successfully - onboarding complete');
                      toast.success('Onboarding completed successfully!');
                      
                      // Redirect to profile page instead of moving to completion step
                      router.push('/student/profile');
                    } catch (error) {
                      console.error('Error during onboarding completion:', error);
                      toast.error('Failed to complete onboarding');
                      return;
                    }
                  }}
                  onNext={() => {
                    // This shouldn't be called now since onComplete handles the redirect
                    console.log('Goals step next clicked');
                  }}
                  onSkip={() => {
                    console.log('🔄 Skipping goals step');
                    setUserData({ ...userData, goals: [] });
                    console.log('Goals skipped - completing onboarding');
                    toast.success('Onboarding completed successfully!');
                    // Redirect to profile page
                    router.push('/student/profile');
                  }}
                />
              )}

              
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}