"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, Sparkles, Edit, User, Camera, Book, Music, Palette, Code, Gamepad2, Globe, Star, Search, Plus, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Interest {
  id: number
  name: string
  category?: string
}

interface InterestCategory {
  name: string
  interests: Interest[]
  icon: any
  color: string
  bgColor: string
}

interface InterestsSectionProps {
  student: any
  currentUser?: any
}

export default function InterestsSection({ student, currentUser }: InterestsSectionProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredInterests, setFilteredInterests] = useState<Interest[]>([])
  const [groupedInterests, setGroupedInterests] = useState<InterestCategory[]>([])
  const [userInterests, setUserInterests] = useState<Interest[]>([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const isOwnProfile = currentUser?.id === student?.id
  const isViewMode = false; //Placeholder, needs to be determined from props

  const handleEditInterests = () => {
    router.push('/student/profile/edit?section=interests')
  }

  // Lazy load interests when component mounts and user is available
  useEffect(() => {
    if (!hasLoaded && currentUser?.id && currentUser.role === 'student') {
      console.log('🎯 InterestsSection: Component mounted, loading user interests...')
      loadUserInterests()
    }
  }, [currentUser?.id, currentUser?.role, hasLoaded])

  const loadUserInterests = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 InterestsSection: Lazy loading user interests for user:', currentUser?.id)
      
      const response = await fetch('/api/user/onboarding-interests', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user interests')
      }

      const data = await response.json()
      console.log('✅ InterestsSection: User interests loaded from onboarding-interests API:', data.interests?.length || 0, 'interests')
      
      // Transform the data to match expected format
      const transformedInterests = (data.interests || []).map(interest => ({
        id: interest.id,
        name: interest.name,
        category: interest.categoryId ? 'Custom' : 'General'
      }))
      
      setUserInterests(transformedInterests)
      setHasLoaded(true)
    } catch (err) {
      console.error('❌ InterestsSection: Error loading interests:', err)
      setError('Failed to load interests')
    } finally {
      setLoading(false)
    }
  }

  // Category mapping with icons and colors
  const categoryMap: Record<string, { icon: any; color: string; bgColor: string }> = {
    "Arts & Design": { icon: Palette, color: "text-pink-600", bgColor: "bg-pink-50 border-pink-200" },
    "Technology": { icon: Code, color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200" },
    "Music": { icon: Music, color: "text-purple-600", bgColor: "bg-purple-50 border-purple-200" },
    "Sports": { icon: User, color: "text-green-600", bgColor: "bg-green-50 border-green-200" },
    "Academic": { icon: Book, color: "text-indigo-600", bgColor: "bg-indigo-50 border-indigo-200" },
    "Gaming": { icon: Gamepad2, color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200" },
    "Travel": { icon: Globe, color: "text-teal-600", bgColor: "bg-teal-50 border-teal-200" },
    "Photography": { icon: Camera, color: "text-yellow-600", bgColor: "bg-yellow-50 border-yellow-200" },
    "Custom": { icon: Star, color: "text-gray-600", bgColor: "bg-gray-50 border-gray-200" },
    "General": { icon: Sparkles, color: "text-pathpiper-teal", bgColor: "bg-pathpiper-teal/10 border-pathpiper-teal/20" }
  }

  useEffect(() => {
    if (userInterests && userInterests.length > 0) {
      // Filter interests based on search
      const filtered = userInterests.filter((interest: Interest) =>
        interest.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredInterests(filtered)

      // Group interests by category
      const groups: Record<string, Interest[]> = {}
      filtered.forEach((interest: Interest) => {
        const category = interest.category || "General"
        if (!groups[category]) {
          groups[category] = []
        }
        groups[category].push(interest)
      })

      // Convert to array with category info
      const groupedArray = Object.entries(groups).map(([categoryName, interests]) => ({
        name: categoryName,
        interests,
        ...categoryMap[categoryName] || categoryMap["General"]
      }))

      setGroupedInterests(groupedArray)
    }
  }, [userInterests, searchTerm])

  const getInterestColor = (index: number) => {
    const colors = [
      "bg-gradient-to-r from-pink-400 to-red-400",
      "bg-gradient-to-r from-blue-400 to-purple-400",
      "bg-gradient-to-r from-green-400 to-teal-400",
      "bg-gradient-to-r from-yellow-400 to-orange-400",
      "bg-gradient-to-r from-indigo-400 to-blue-400",
      "bg-gradient-to-r from-purple-400 to-pink-400",
      "bg-gradient-to-r from-teal-400 to-green-400",
      "bg-gradient-to-r from-orange-400 to-red-400"
    ]
    return colors[index % colors.length]
  }

  // Show loading state
  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
            <Loader2 className="w-12 h-12 text-pathpiper-teal animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading Interests...
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Fetching your interests and passions
          </p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-6">
            <X className="w-12 h-12 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Interests
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            {error}
          </p>
          <Button
            className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
            onClick={loadUserInterests}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Show empty state
  if (!userInterests || userInterests.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Interests Added Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            {isOwnProfile
              ? "Add some interests to your profile to help others get to know you better and discover relevant content."
              : "This user hasn't added any interests to their profile yet."
            }
          </p>
          {isOwnProfile && (
            <Button
              className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
              onClick={handleEditInterests}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Interests
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Interests & Passions
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {userInterests.length} interests • Discover what drives me
          </p>
        </div>
        {isOwnProfile && !isViewMode && (
          <Button
            variant="outline"
            className="border-pathpiper-teal text-pathpiper-teal hover:bg-pathpiper-teal hover:text-white"
            onClick={handleEditInterests}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Interests
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder="Search interests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Interests Grid */}
      {groupedInterests.length > 0 ? (
        <div className="space-y-8">
          {groupedInterests.map((category, categoryIndex) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className={`border-2 rounded-2xl p-6 ${category.bgColor}`}
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-white border ${category.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className={`text-xl font-semibold ${category.color}`}>
                    {category.name}
                  </h3>
                  <Badge variant="secondary" className="ml-auto">
                    {category.interests.length}
                  </Badge>
                </div>

                {/* Interests Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {category.interests.map((interest, index) => (
                    <motion.div
                      key={interest.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (categoryIndex * 0.1) + (index * 0.05) }}
                      className={`${getInterestColor(index)} text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105`}
                    >
                      <div className="flex items-center justify-center">
                        <span className="font-medium text-sm truncate">
                          {interest.name}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No interests found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search terms
          </p>
        </div>
      )}


    </div>
  )
}