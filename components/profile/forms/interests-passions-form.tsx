"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, Search, Heart } from "lucide-react"
import { toast } from "sonner"

interface Interest {
  id: number
  name: string
  category?: string
}

interface InterestCategory {
  name: string
  interests: Interest[]
}

interface InterestsPassionsFormProps {
  data: any
  onChange: (sectionId: string, data: Interest[], isDirty?: boolean) => void
}

export default function InterestsPassionsForm({ data, onChange }: InterestsPassionsFormProps) {
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [customInterest, setCustomInterest] = useState("")
  const [interestCategories, setInterestCategories] = useState<InterestCategory[]>([])
  const [filteredCategories, setFilteredCategories] = useState<InterestCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDirty, setIsDirty] = useState(false)
  const [initialInterests, setInitialInterests] = useState<string[]>([])
  const [userAgeGroup, setUserAgeGroup] = useState<string>("young_adult")

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
          setUserAgeGroup(user.ageGroup)
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
        setInterestCategories(categories)
        setFilteredCategories(categories)

        // Load user's existing interests
        const userInterestsResponse = await fetch('/api/user/interests')
        if (userInterestsResponse.ok) {
          const { interests } = await userInterestsResponse.json()
          console.log('✅ User existing interests loaded:', interests.length, 'interests:', interests)
          setSelectedInterests(interests)

          // Store initial interests for dirty tracking
          const interestNames = interests.map((interest: Interest) => interest.name)
          setInitialInterests(interestNames)
        } else {
          console.log('❌ Failed to load user interests:', userInterestsResponse.status)
        }
      } catch (error) {
        console.error('Error fetching user data and interests:', error)
        toast.error('Failed to load interests. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserDataAndInterests()
  }, [])

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

  // Filter interest categories to only show user's own custom interests
  useEffect(() => {
    if (interestCategories.length > 0) {
      const filteredCategories = interestCategories.map(category => {
        if (category.name === "Custom") {
          // For custom category, only show interests that the user has selected
          const userCustomInterests = selectedInterests.filter(selected => 
            category.interests.some(categoryInterest => 
              categoryInterest.id === selected.id && (selected.id < 0 || selected.category === "Custom")
            )
          )

          return {
            ...category,
            interests: userCustomInterests.map(interest => ({
              id: interest.id,
              name: interest.name
            }))
          }
        }
        return category
      })

      setFilteredCategories(filteredCategories)
    }
  }, [interestCategories, selectedInterests])

  // Track dirty state - compare current interests with initial data
  useEffect(() => {
    const selectedNames = selectedInterests.map(interest => interest.name).sort()
    const initialNames = [...initialInterests].sort()

    // Check if arrays are different
    const hasChanges = selectedNames.length !== initialNames.length || 
                      !selectedNames.every((name, index) => name === initialNames[index])

    if (isDirty !== hasChanges) {
      setIsDirty(hasChanges)
      // Notify parent about dirty state change
      onChange("interests", selectedInterests, hasChanges)
      console.log("🔍 Interests dirty bit:", hasChanges)
    }
  }, [selectedInterests, initialInterests, isDirty, onChange])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      // Apply custom interest filtering when no search term
      const filteredCategories = interestCategories.map(category => {
        if (category.name === "Custom") {
          // For custom category, only show interests that the user has selected
          const userCustomInterests = selectedInterests.filter(selected => 
            category.interests.some(categoryInterest => 
              categoryInterest.id === selected.id && (selected.id < 0 || selected.category === "Custom")
            )
          )

          return {
            ...category,
            interests: userCustomInterests.map(interest => ({
              id: interest.id,
              name: interest.name
            }))
          }
        }
        return category
      })

      setFilteredCategories(filteredCategories)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = interestCategories
      .map((category) => {
        if (category.name === "Custom") {
          // For custom category, only show user's own custom interests that match search
          const userCustomInterests = selectedInterests.filter(selected => 
            category.interests.some(categoryInterest => 
              categoryInterest.id === selected.id && (selected.id < 0 || selected.category === "Custom")
            ) && selected.name.toLowerCase().includes(term)
          )

          return {
            name: category.name,
            interests: userCustomInterests.map(interest => ({
              id: interest.id,
              name: interest.name
            }))
          }
        }

        return {
          name: category.name,
          interests: category.interests.filter((interest) => interest.name.toLowerCase().includes(term)),
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
  }



  const addCustomInterest = () => {
    const trimmedInterest = customInterest.trim()
    if (trimmedInterest === "" || selectedInterests.some(i => i.name === trimmedInterest)) return

    // Create a temporary interest object for custom interests (negative ID to distinguish)
    const customInterestObj: Interest = {
      id: -Date.now(), // Use negative timestamp as temporary ID
      name: trimmedInterest,
      category: "Custom"
    }

    setSelectedInterests([...selectedInterests, customInterestObj])
    setCustomInterest("")
  }

  const removeInterest = (interestId: number) => {
    setSelectedInterests(selectedInterests.filter(i => i.id !== interestId))
  }

  const handleSave = async () => {
    try {
      // Convert interest objects to names for API
      const interestNames = selectedInterests.map(interest => interest.name)

      console.log("🔍 Interests dirty bit:", isDirty)

      if (isDirty) {
        console.log("💾 Interests have changes, saving to database...")
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

        // Update initial interests to new saved state
        setInitialInterests(interestNames)

        // Notify parent component
        onChange("interests", selectedInterests)
      } else {
        console.log("✅ Interests unchanged, skipping database save")
        toast.success('No changes to save!')
      }
    } catch (error) {
      console.error('Error saving interests:', error)
      toast.error('Failed to save interests. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pathpiper-teal mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading interests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Interests & Passions</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Select topics you're passionate about to help us connect you with like-minded people and relevant content
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Interests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search interests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Add Custom Interest */}
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Add a custom interest..."
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
              />
              <Button
                type="button"
                onClick={addCustomInterest}
                disabled={!customInterest.trim()}
                className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Interest Categories */}
          <div className="space-h-[500px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {filteredCategories.map((category) => (
              <div key={category.name}>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  {category.name}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {category.interests.map((interest) => {
                    const isSelected = selectedInterests.some(i => i.id === interest.id)
                    return (
                      <Button
                        key={interest.id}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleInterest(interest)}
                        className={`transition-all ${
                          isSelected
                            ? 'bg-pathpiper-teal hover:bg-pathpiper-teal/90 text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {interest.name}
                        {isSelected ? (
                          <X size={14} className="ml-1" />
                        ) : (
                          <Plus size={14} className="ml-1" />
                        )}
                      </Button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Interests */}
        <div className="space-y-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-[500px] flex flex-col">
            <Label className="text-lg font-medium mb-4 block">
              Your Interests ({selectedInterests.length})
            </Label>

            {selectedInterests.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Heart className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No interests selected yet</p>
                <p className="text-sm text-gray-400">
                  Choose interests from the left or add your own
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {selectedInterests.map((interest) => (
                    <div
                      key={interest.id}
                      className="flex items-center bg-pathpiper-teal text-white px-3 py-1 rounded-full text-sm"
                    >
                      <span className="font-medium">{interest.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInterest(interest.id)}
                        className="ml-2 p-0 h-auto text-white hover:text-red-200 hover:bg-transparent"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6">
        <Button
          onClick={handleSave}
          disabled={!isDirty}
          className={`w-full max-w-md mx-auto block ${
            isDirty 
              ? 'bg-pathpiper-teal hover:bg-pathpiper-teal/90' 
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {isDirty ? 'Save Changes' : 'No Changes'}
        </Button>
      </div>
    </div>
  )
}