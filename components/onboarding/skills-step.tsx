
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Plus, X, Search, Award } from "lucide-react"
import type { AgeGroup } from "@/components/onboarding/personal-info-step"

interface Skill {
  name: string
  level: number
  id?: number
}

interface SkillsStepProps {
  initialData: Skill[]
  onComplete: (data: Skill[]) => void
  onNext: () => void
  onSkip: () => void
  ageGroup?: AgeGroup // Add ageGroup prop
}

export default function SkillsStep({
  initialData,
  onComplete,
  onNext,
  onSkip,
  ageGroup = "young_adult",
}: SkillsStepProps) {
  const [userAgeGroup, setUserAgeGroup] = useState<AgeGroup>("middle_school")
  const [skills, setSkills] = useState<Skill[]>(initialData)
  const [originalSkills, setOriginalSkills] = useState<Skill[]>(initialData)
  const [isDirty, setIsDirty] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newSkill, setNewSkill] = useState("")
  const [newSkillLevel, setNewSkillLevel] = useState(3)
  const [skillCategories, setSkillCategories] = useState<Array<{ name: string; skills: string[] }>>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Function to calculate age group from birth data
  const calculateAgeGroupFromBirth = (birthMonth: string, birthYear: string): string => {
    if (!birthMonth || !birthYear) return "young_adult";

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const birthYearNum = parseInt(birthYear);
    const birthMonthNum = parseInt(birthMonth);

    let ageInYears = currentYear - birthYearNum;
    if (currentMonth < birthMonthNum) {
      ageInYears--;
    }

    if (ageInYears < 5) {
      return "early_childhood";
    } else if (ageInYears < 11) {
      return "elementary";
    } else if (ageInYears < 13) {
      return "middle_school";
    } else if (ageInYears < 18) {
      return "high_school";
    } else {
      return "young_adult";
    }
  };

  // Fetch skills and user data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // First fetch user data to get birth date and calculate age group
        const userResponse = await fetch('/api/auth/user')
        if (userResponse.ok) {
          const userData = await userResponse.json()

          // Calculate age group from birth data
          const birthMonth = userData.user?.studentProfile?.birthMonth
          const birthYear = userData.user?.studentProfile?.birthYear
          const calculatedAgeGroup = calculateAgeGroupFromBirth(birthMonth, birthYear)

          console.log('🔍 Birth data:', { birthMonth, birthYear })
          console.log('🔍 Calculated age group:', calculatedAgeGroup)

          setUserAgeGroup(calculatedAgeGroup)

          // Fetch skill categories for the calculated age group
          const skillsResponse = await fetch(`/api/skills?ageGroup=${calculatedAgeGroup}`)
          if (skillsResponse.ok) {
            const skillsData = await skillsResponse.json()
            console.log('✅ Fetched skill categories:', skillsData.categories)

            // Filter custom category to only show user's custom skills
            const userId = userData.user.id;
            const filteredCategories = skillsData.categories.map((category: any) => {
              if (category.name === 'Custom') {
                // Only show custom skills that belong to the current user
                // Check if skill has user_id or userId property
                return {
                  ...category,
                  skills: category.skills.filter((skill: any) => {
                    // Handle both possible field names for user ID
                    const skillUserId = skill.user_id || skill.userId || skill.createdBy;
                    return skillUserId === userId;
                  })
                };
              }
              return category;
            });
            setSkillCategories(filteredCategories || [])

          } else {
            const errorText = await skillsResponse.text()
            console.error('Failed to fetch skills:', skillsResponse.status, errorText)
          }

          // Fetch existing user skills to preselect them
          try {
            const userSkillsResponse = await fetch('/api/user/skills')
            if (userSkillsResponse.ok) {
              const userSkillsData = await userSkillsResponse.json()
              console.log('✅ Fetched existing user skills:', userSkillsData.skills)

              // Convert the existing skills to the format expected by the component
              // Handle both possible API response structures
              const existingSkills = userSkillsData.skills.map((userSkill: any) => ({
                name: userSkill.skill?.name || userSkill.skills?.name || userSkill.name,
                level: userSkill.proficiencyLevel || userSkill.proficiency_level || userSkill.level || 1,
                id: userSkill.skill?.id || userSkill.skills?.id || userSkill.skill_id || userSkill.id
              }))

              setSkills(existingSkills)
              setOriginalSkills(existingSkills)
              console.log('✅ Preselected existing skills in onboarding:', existingSkills)
            } else {
              console.log('ℹ️ No existing skills found or error fetching them')
              // Start with empty skills if no existing skills
              setSkills(initialData || [])
              setOriginalSkills(initialData || [])
            }
          } catch (error) {
            console.error('Error fetching existing skills:', error)
            // Start with empty skills on error
            setSkills(initialData || [])
            setOriginalSkills(initialData || [])
          }
        } else {
          console.error('Failed to fetch user data:', userResponse.status)
          // Fallback to young_adult age group for onboarding
          const fallbackAgeGroup = "young_adult"
          setUserAgeGroup(fallbackAgeGroup)
          console.log('🔍 Using fallback age group for skills:', fallbackAgeGroup)

          const skillsResponse = await fetch(`/api/skills?ageGroup=${fallbackAgeGroup}`)
          if (skillsResponse.ok) {
            const skillsData = await skillsResponse.json()
            console.log('✅ Fetched skill categories (fallback):', skillsData.categories)

            // For fallback case, we don't have userId, so just show empty custom skills
            const filteredCategories = skillsData.categories.map((category: any) => {
              if (category.name === 'Custom') {
                // Show empty custom skills for fallback case
                return {
                  ...category,
                  skills: []
                };
              }
              return category;
            });
            setSkillCategories(filteredCategories || [])
          } else {
            const errorText = await skillsResponse.text()
            console.error('Failed to fetch skills:', skillsResponse.status, errorText)
          }

          // Start with empty skills for fallback
          setSkills(initialData || [])
          setOriginalSkills(initialData || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        // Start with empty skills on error
        setSkills(initialData || [])
        setOriginalSkills(initialData || [])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const [filteredCategories, setFilteredCategories] = useState(skillCategories)

  // Filter categories based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      // Show all categories including custom skills from user's existing skills
      const categoriesWithCustom = [...skillCategories]

      // Add custom skills from user's existing skills if any
      const customSkills = skills.filter(skill => 
        !skill.id || skill.id < 0 || skill.category === "Custom"
      ).map(skill => ({
        id: skill.id || -Date.now(),
        name: skill.name
      }))

      if (customSkills.length > 0) {
        const existingCustomCategory = categoriesWithCustom.find(cat => cat.name === "Custom")
        if (existingCustomCategory) {
          // Update existing custom category with user's custom skills
          existingCustomCategory.skills = [
            ...existingCustomCategory.skills,
            ...customSkills.filter(customSkill => 
              !existingCustomCategory.skills.some(existing => existing.name === customSkill.name)
            )
          ]
        } else {
          // Add new custom category
          categoriesWithCustom.push({
            name: "Custom",
            skills: customSkills
          })
        }
      }

      setFilteredCategories(categoriesWithCustom)
      return
    }

    const term = searchTerm.toLowerCase()

    // Include custom skills in search
    const categoriesWithCustom = [...skillCategories]
    const customSkills = skills.filter(skill => 
      !skill.id || skill.id < 0 || skill.category === "Custom"
    ).map(skill => ({
      id: skill.id || -Date.now(),
      name: skill.name
    }))

    if (customSkills.length > 0) {
      const existingCustomCategory = categoriesWithCustom.find(cat => cat.name === "Custom")
      if (existingCustomCategory) {
        existingCustomCategory.skills = [
          ...existingCustomCategory.skills,
          ...customSkills.filter(customSkill => 
            !existingCustomCategory.skills.some(existing => existing.name === customSkill.name)
          )
        ]
      } else {
        categoriesWithCustom.push({
          name: "Custom",
          skills: customSkills
        })
      }
    }

    const filtered = categoriesWithCustom
      .map((category) => ({
        name: category.name,
        skills: category.skills.filter((skill) =>
          skill.name.toLowerCase().includes(term)
        ),
      }))
      .filter((category) => category.skills.length > 0)

    setFilteredCategories(filtered)
  }, [searchTerm, skillCategories, skills])

  // Initialize filtered categories when skill categories are loaded
  useEffect(() => {
    setFilteredCategories(skillCategories)
  }, [skillCategories])

  // Track dirty state
  useEffect(() => {
    // Compare current skills with original skills
    const skillsChanged = skills.length !== originalSkills.length ||
      skills.some(skill => {
        const originalSkill = originalSkills.find(orig => orig.name === skill.name)
        return !originalSkill || originalSkill.level !== skill.level
      })

    setIsDirty(skillsChanged)
    console.log("🔍 Skills dirty bit:", skillsChanged)
  }, [skills, originalSkills])

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const addSkill = (skillName: string, skillId?: number) => {
    if (skills.some((s) => s.name === skillName)) return

    // Find the skill ID from categories if not provided
    let foundSkillId = skillId
    if (!foundSkillId) {
      for (const category of skillCategories) {
        const foundSkill = category.skills.find(s => 
          typeof s === 'object' ? s.name === skillName : s === skillName
        )
        if (foundSkill && typeof foundSkill === 'object') {
          foundSkillId = foundSkill.id
          break
        }
      }
    }

    setSkills([...skills, { 
      name: skillName, 
      level: newSkillLevel,
      id: foundSkillId 
    }])
  }

  const addCustomSkill = () => {
    if (!newSkill.trim() || skills.some((s) => s.name === newSkill)) return

    setSkills([...skills, { name: newSkill, level: newSkillLevel }])
    setNewSkill("")
  }

  const removeSkill = (skillName: string) => {
    setSkills(skills.filter((s) => s.name !== skillName))
  }

  const updateSkillLevel = (skillName: string, level: number) => {
    setSkills(skills.map((s) => (s.name === skillName ? { ...s, level } : s)))
  }

  // Determine if we should show simplified UI for younger children
  const isYoungChild = userAgeGroup === "early_childhood" || userAgeGroup === "elementary"

  const getLevelLabel = (level: number) => {
    if (isYoungChild) {
      switch (level) {
        case 1:
          return "Just Started"
        case 2:
          return "Learning"
        case 3:
          return "Getting Better"
        case 4:
          return "Pretty Good"
        case 5:
          return "Really Good"
        default:
          return "Getting Better"
      }
    } else {
      switch (level) {
        case 1:
          return "Beginner"
        case 2:
          return "Elementary"
        case 3:
          return "Intermediate"
        case 4:
          return "Advanced"
        case 5:
          return "Expert"
        default:
          return "Intermediate"
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      console.log("💾 Saving skills during onboarding...", skills)

      // Always save skills during onboarding
      if (skills.length > 0) {
        // Send all skills (including custom ones) to the API
        // The API will handle creating custom skills in the database
        const response = await fetch('/api/user/skills', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ skills }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Failed to save skills:', errorData)
          throw new Error(errorData.error || 'Failed to save skills')
        }

        console.log("✅ All skills (including custom) saved successfully during onboarding")

        setIsDirty(false)
        setOriginalSkills([...skills])
      } else {
        console.log("ℹ️ No skills to save")
      }

      onComplete(skills)
      onNext()
    } catch (error) {
      console.error('Error saving skills:', error)
      // Show error to user but don't prevent navigation
      alert('Failed to save skills. Please try again later.')
      // Still allow user to continue onboarding
      onComplete(skills)
      onNext()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div>
        Loading skills...
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{isYoungChild ? "Things You Can Do" : "Your Skills"}</h2>
      <p className="text-slate-600 mb-6">
        {isYoungChild
          ? "Tell us what you're good at or learning to do!"
          : "Add skills you already have to help us connect you with relevant opportunities and mentors"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left Column - Available Skills (3/5 width on md screens) */}
          <div className="md:col-span-3 space-y-4">
            {/* Add custom skill */}
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={isYoungChild ? "Add something you can do..." : "Add a custom skill..."}
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <Button
                type="button"
                onClick={addCustomSkill}
                disabled={!newSkill.trim()}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                <Plus size={16} className="mr-1" /> Add
              </Button>
            </div>

            {/* Search skills */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <Input
                type="text"
                placeholder={isYoungChild ? "Find skills..." : "Search skills..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>

            {/* Skill categories */}
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 border border-slate-200 rounded-lg p-4">
              {filteredCategories.map((category) => (
                <div key={category.name}>
                  <h3 className="font-semibold text-slate-800 mb-3 text-sm">{category.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => {
                      const skillName = typeof skill === 'object' ? skill.name : skill
                      const skillId = typeof skill === 'object' ? skill.id : undefined
                      const isSelected = skills.some((s) => s.name === skillName)
                      return (
                        <button
                          key={skillId || skillName}
                          type="button"
                          onClick={() => (isSelected ? removeSkill(skillName) : addSkill(skillName, skillId))}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            isSelected ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {skillName}
                          {isSelected ? (
                            <X size={14} className="ml-1 inline" />
                          ) : (
                            <Plus size={14} className="ml-1 inline" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Selected Skills (2/5 width on md screens) */}
          <div className="md:col-span-2">
            <div className="border border-slate-200 rounded-lg p-4 h-full">
              <Label className="mb-4 block text-lg font-medium">
                {isYoungChild ? "My Skills" : "Your Skills"} ({skills.length})
              </Label>

              {skills.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="bg-slate-100 rounded-full p-4 mb-4">
                    <Award className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mb-2">
                    {isYoungChild ? "You haven't added any skills yet" : "No skills added yet"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {isYoungChild ? "Add skills from the left side" : "Add skills from the left or create your own"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {skills.map((skill) => (
                    <div key={skill.name} className="border border-slate-200 rounded-lg p-3 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-slate-800">{skill.name}</h4>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill.name)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">
                            {isYoungChild ? "How good are you at this?" : "Proficiency Level"}
                          </span>
                          <span className="font-medium text-teal-600">{getLevelLabel(skill.level)}</span>
                        </div>
                        <Slider
                          value={[skill.level]}
                          min={1}
                          max={5}
                          step={1}
                          onValueChange={(value) => updateSkillLevel(skill.name, value[0])}
                          className="py-2"
                        />
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>{isYoungChild ? "Just Started" : "Beginner"}</span>
                          <span>{isYoungChild ? "Really Good" : "Expert"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="ghost" onClick={onSkip} className="text-slate-500 hover:text-slate-700">
            {isYoungChild ? "Skip for now" : "Skip for now"}
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full px-8"
          >
            {saving ? "Saving..." : (isYoungChild ? "Next" : "Continue")}
          </Button>
        </div>
      </form>
    </div>
  )
}
