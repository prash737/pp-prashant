"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, Search } from "lucide-react"
import { toast } from "sonner"
import type { AgeGroup } from "@/components/onboarding/personal-info-step"

interface Interest {
  id: number
  name: string
}

interface InterestCategory {
  name: string
  interests: Interest[]
}

interface InterestsStepProps {
  initialData: string[]
  onComplete: (data: string[]) => void
  onNext: () => void
  onSkip: () => void
  ageGroup?: AgeGroup // Add ageGroup prop
}

export default function InterestsStep({
  initialData,
  onComplete,
  onNext,
  onSkip,
  ageGroup = "young-adult",
}: InterestsStepProps) {
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [customInterest, setCustomInterest] = useState("")
  const [interestCategories, setInterestCategories] = useState<InterestCategory[]>([])
  const [filteredCategories, setFilteredCategories] = useState<InterestCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDirty, setIsDirty] = useState(false)
  const [userAgeGroup, setUserAgeGroup] = useState<AgeGroup>(ageGroup)

  // Fetch user data and interests from database
  useEffect(() => {
    const fetchUserDataAndInterests = async () => {
      try {
        // First, get user data to determine age group
        const userResponse = await fetch('/api/auth/user')
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data')
        }
        const { user } = await userResponse.json()
        console.log('🔍 User data for interests:', user)

        if (user.ageGroup) {
          setUserAgeGroup(user.ageGroup as AgeGroup)
          console.log('✅ User age group set to:', user.ageGroup)
        }

        // Fetch interests based on user's age group
        const interestsUrl = user.ageGroup 
          ? `/api/interests?ageGroup=${user.ageGroup}` 
          : '/api/interests'

        console.log('🔍 Fetching interests from:', interestsUrl)
        const interestsResponse = await fetch(interestsUrl)
        if (!interestsResponse.ok) {
          throw new Error('Failed to fetch interests')
        }
        const categories = await interestsResponse.json()
        console.log('✅ Interest categories loaded:', categories.length, 'categories')

        // Load user's existing interests first to filter custom interests
        let userSelectedInterests = []
        if (initialData.length === 0) {
          const userInterestsResponse = await fetch('/api/user/interests')
          if (userInterestsResponse.ok) {
            const { interests } = await userInterestsResponse.json()
            console.log('✅ User existing interests loaded:', interests.length, 'interests:', interests)
            userSelectedInterests = interests
            setSelectedInterests(interests)
          } else {
            console.log('❌ Failed to load user interests:', userInterestsResponse.status)
          }
        } else if (initialData.length > 0) {
          // Convert initial data (names) to interest objects if any match available interests
          const availableInterests = categories.flatMap(category => category.interests)
          const matchedInterests = availableInterests.filter(interest => 
            initialData.includes(interest.name)
          )
          console.log('✅ Matched initial interests for age group', user.ageGroup, ':', matchedInterests.length, 'out of', initialData.length)
          userSelectedInterests = matchedInterests
          setSelectedInterests(matchedInterests)
        }

        // Filter custom interests to show only those selected by the user
        const filteredCategories = categories.map(category => {
          if (category.name === 'Custom') {
            // Only show custom interests that the user has actually selected
            const userSelectedCustomInterests = category.interests.filter(interest =>
              userSelectedInterests.some(selectedInterest => selectedInterest.id === interest.id)
            )
            return {
              ...category,
              interests: userSelectedCustomInterests
            }
          }
          return category
        }).filter(category => 
          // Remove Custom category entirely if user has no custom interests selected
          category.name !== 'Custom' || category.interests.length > 0
        )

        console.log('✅ Filtered categories (Custom interests filtered to user-selected only):', filteredCategories.length, 'categories')
        setInterestCategories(filteredCategories)
        setFilteredCategories(filteredCategories)

      } catch (error) {
        console.error('Error fetching user data and interests:', error)
        toast.error('Failed to load interests. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserDataAndInterests()
  }, [initialData])

  // Re-filter selected interests when interest categories change (age group change)
  useEffect(() => {
    if (interestCategories.length > 0 && selectedInterests.length > 0) {
      const availableInterestIds = interestCategories.flatMap(category => 
        category.interests.map(interest => interest.id)
      )
      const filteredInterests = selectedInterests.filter(interest => 
        availableInterestIds.includes(interest.id)
      )

      // Only update if the filtered list is different
      if (filteredInterests.length !== selectedInterests.length) {
        console.log('🔄 Re-filtering interests for new age group. Before:', selectedInterests.length, 'After:', filteredInterests.length)
        setSelectedInterests(filteredInterests)
      }
    }
  }, [interestCategories])

  // Track dirty state - compare current interests with initial data
  useEffect(() => {
    const selectedNames = selectedInterests.map(interest => interest.name).sort()
    const initialNames = [...initialData].sort()

    // Check if arrays are different
    const hasChanges = selectedNames.length !== initialNames.length || 
                      !selectedNames.every((name, index) => name === initialNames[index])

    setIsDirty(hasChanges)
    console.log("🔍 Interests dirty bit:", hasChanges)
  }, [selectedInterests, initialData])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      // When no search term, show all categories but filter custom interests
      const categoriesWithFilteredCustom = interestCategories.map(category => {
        if (category.name === 'Custom') {
          // For custom category, only show interests that are selected by the user
          const userSelectedCustomInterests = category.interests.filter(interest =>
            selectedInterests.some(selectedInterest => selectedInterest.id === interest.id)
          )
          return {
            ...category,
            interests: userSelectedCustomInterests
          }
        }
        return category
      }).filter(category => 
        // Remove Custom category entirely if no custom interests are selected
        category.name !== 'Custom' || category.interests.length > 0
      )

      setFilteredCategories(categoriesWithFilteredCustom)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = interestCategories
      .map((category) => {
        let filteredInterests = category.interests.filter((interest) => interest.name.toLowerCase().includes(term))

        // For custom category, also filter to only show user-selected interests
        if (category.name === 'Custom') {
          filteredInterests = filteredInterests.filter(interest =>
            selectedInterests.some(selectedInterest => selectedInterest.id === interest.id)
          )
        }

        return {
          name: category.name,
          interests: filteredInterests,
        }
      })
      .filter((category) => category.interests.length > 0)

    setFilteredCategories(filtered)
  }, [searchTerm, interestCategories, selectedInterests])

  const toggleInterest = (interest: Interest) => {
    const isSelected = selectedInterests.some(i => i.id === interest.id)
    if (isSelected) {
      setSelectedInterests(selectedInterests.filter((i) => i.id !== interest.id))
    } else {
      setSelectedInterests([...selectedInterests, interest])
    }
    setIsDirty(true)
  }

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeUnload', handleBeforeUnload)
  }, [isDirty])

  const addCustomInterest = () => {
    const trimmedInterest = customInterest.trim()
    if (trimmedInterest === "" || selectedInterests.some(i => i.name === trimmedInterest)) return

    // Create a temporary interest object for custom interests (negative ID to distinguish)
    const customInterestObj: Interest = {
      id: -Date.now(), // Use negative timestamp as temporary ID
      name: trimmedInterest
    }

    setSelectedInterests([...selectedInterests, customInterestObj])

    // Add the custom interest to the Custom category in interestCategories if it doesn't exist
    setInterestCategories(prevCategories => {
      const updatedCategories = prevCategories.map(category => {
        if (category.name === 'Custom') {
          // Add the new custom interest if it's not already there
          if (!category.interests.some(interest => interest.name === trimmedInterest)) {
            return {
              ...category,
              interests: [...category.interests, customInterestObj]
            }
          }
        }
        return category
      })

      // If no Custom category exists, create one
      if (!updatedCategories.some(cat => cat.name === 'Custom')) {
        updatedCategories.push({
          name: 'Custom',
          interests: [customInterestObj]
        })
      }

      return updatedCategories
    })

    setCustomInterest("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Convert interest objects to names for API
      const interestNames = selectedInterests.map(interest => interest.name)

      console.log("🔍 Interests dirty bit:", isDirty)

      if (isDirty) {
        console.log("💾 Interests have changes, saving to database...")

         // Separate interests with and without IDs
        const interestsWithIds = selectedInterests.filter(i => i.id > 0)
        const customInterests = selectedInterests.filter(i => i.id <= 0)

        console.log("📊 Interests breakdown:", {
          total: selectedInterests.length,
          withIds: interestsWithIds.length,
          custom: customInterests.length
        })

        if (customInterests.length > 0) {
          console.log("ℹ️ Custom interests will be created in database:", customInterests.map(i => i.name))
        }
        // Save interests to database
        const response = await fetch('/api/user/interests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ interests: interestNames }),
        })

        if (!response.ok) {
          throw new Error('Failed to save interests')
        }

        toast.success('Interests saved successfully!')
        setIsDirty(false)
      } else {
        console.log("✅ Interests unchanged, skipping database save")
      }

      onComplete(interestNames)
      onNext()
    } catch (error) {
      console.error('Error saving interests:', error)
      toast.error('Failed to save interests. Please try again.')
    }
  }

  // Determine if we should show simplified UI for younger children
  const isYoungChild = userAgeGroup === "early_childhood" || userAgeGroup === "elementary"

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading interests...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Your Interests</h2>
      <p className="text-slate-600 mb-6">
        {isYoungChild
          ? "Select things you like to do and learn about!"
          : "Select topics you're interested in to help us personalize your experience and connect you with relevant mentors and content"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left Column - Available Interests (3/5 width on md screens) */}
          <div className="md:col-span-3 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <Input
                type="text"
                placeholder={isYoungChild ? "Find what you like..." : "Search interests..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>

            {/* Add custom interest */}
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder={isYoungChild ? "Add something you like..." : "Add a custom interest..."}
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                className="rounded-lg"
              />
              <Button
                type="button"
                onClick={addCustomInterest}
                disabled={!customInterest.trim()}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                <Plus size={16} className="mr-1" /> Add
              </Button>
            </div>

            {/* Interest categories */}
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 border border-slate-200 rounded-lg p-4">
              {filteredCategories.map((category) => (
                <div key={category.name}>
                  <h3 className="font-semibold text-slate-800 mb-3">{category.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.interests.map((interest) => {
                      const isSelected = selectedInterests.some(si => si.id === interest.id)
                      return (
                        <button
                          key={`interest-${interest.id}`}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            isSelected
                              ? "bg-teal-100 text-teal-700"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {interest.name}
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

          {/* Right Column - Selected Interests (2/5 width on md screens) */}
          <div className="md:col-span-2">
            <div className="border border-slate-200 rounded-lg p-4 h-full">
              <Label className="mb-4 block text-lg font-medium">
                {isYoungChild ? "Things I Like" : "Selected Interests"} ({selectedInterests.length})
              </Label>

              {selectedInterests.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="bg-slate-100 rounded-full p-4 mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mb-2">
                    {isYoungChild ? "You haven't picked anything yet" : "No interests selected yet"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {isYoungChild
                      ? "Pick things you like from the left"
                      : "Select interests from the left or add your own"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto">
                  {selectedInterests.map((interest) => (
                    <div
                      key={`selected-${interest.id}`}
                      className="flex items-center bg-teal-100 text-teal-700 px-3 py-2 rounded-full text-sm"
                    >
                      {interest.name}
                      <button
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className="ml-2 text-teal-500 hover:text-teal-700"
                      >
                        <X size={14} />
                      </button>
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
            className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full px-8"
          >
            {isYoungChild ? "Next" : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  )
}