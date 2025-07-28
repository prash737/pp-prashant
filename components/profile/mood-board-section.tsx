"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { BrainIcon, Folder, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MoodBoardItem {
  id: string
  imageUrl: string
  caption?: string
  position: number
  collectionId?: number
}

interface UserCollection {
  id: number
  name: string
  description?: string
  moodBoard: MoodBoardItem[]
}

interface MoodBoardSectionProps {
  studentId: string
  isOwnProfile: boolean
  onEdit?: () => void
  isViewMode?: boolean
}

export default function MoodBoardSection({ studentId, isOwnProfile, onEdit, isViewMode = false }: MoodBoardSectionProps) {
  const [collections, setCollections] = useState<UserCollection[]>([])
  const [uncategorizedItems, setUncategorizedItems] = useState<MoodBoardItem[]>([])
  const [expandedCollections, setExpandedCollections] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMoodBoard = async () => {
      try {
        const isPublicView = !isOwnProfile
        console.log('🎨 Mood Board Section Debug:', {
          studentId: studentId?.substring(0, 8) + '...',
          isOwnProfile,
          isPublicView,
          componentProps: { isOwnProfile, isViewMode }
        })
        
        const response = await fetch(`/api/mood-board?userId=${studentId}&isPublicView=${isPublicView}`)
        if (response.ok) {
          const data = await response.json()
          console.log('🎨 Mood Board Response:', {
            collectionsCount: data.collections?.length || 0,
            collections: data.collections?.map((c: UserCollection) => ({
              id: c.id,
              name: c.name,
              isPrivate: (c as any).isPrivate,
              itemCount: c.moodBoard?.length || 0
            }))
          })
          setCollections(data.collections || [])
          setUncategorizedItems(data.uncategorizedItems || [])
          // Expand all collections by default
          setExpandedCollections(new Set(data.collections?.map((c: UserCollection) => c.id) || []))
        }
      } catch (error) {
        console.error('Error fetching mood board:', error)
      } finally {
        setLoading(false)
      }
    }

    if (studentId) {
      fetchMoodBoard()
    }
  }, [studentId, isOwnProfile])

  const toggleCollection = (collectionId: number) => {
    setExpandedCollections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId)
      } else {
        newSet.add(collectionId)
      }
      return newSet
    })
  }

  const totalImages = collections.reduce((acc, collection) => acc + collection.moodBoard.length, 0) + uncategorizedItems.length

  if (loading) {
    return (
      <motion.div
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BrainIcon className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold">Mood Board</h3>
        </div>
        <p className="text-gray-500">Loading mood board...</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BrainIcon className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold">Mood Board</h3>
          <span className="text-sm text-gray-500">({totalImages} images, {collections.length} collections)</span>
        </div>
        {isOwnProfile && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/student/profile/edit?section=media'}
            >
              Add
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/student/profile/edit?section=media'}
            >
              Manage
            </Button>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
          </div>
        )}
      </div>

      {collections.length === 0 && uncategorizedItems.length === 0 ? (
        <div className="text-center py-8">
          <BrainIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No mood board content yet</p>
          <p className="text-sm text-gray-400">
            {isOwnProfile ? "Start creating collections to organize your inspiration" : "This user hasn't added any mood board content yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Collections */}
          {collections.map((collection) => (
            <div key={collection.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCollection(collection.id)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Folder className="h-5 w-5 text-blue-500" />
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900 dark:text-white">{collection.name}</h4>
                    {collection.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{collection.description}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 ml-auto mr-4">
                    {collection.moodBoard.length} images
                  </span>
                </div>
                {expandedCollections.has(collection.id) ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {expandedCollections.has(collection.id) && collection.moodBoard.length > 0 && (
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {collection.moodBoard.map((item) => (
                      <div key={item.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={item.imageUrl}
                          alt={item.caption || `Image from ${collection.name}`}
                          className="w-full h-full object-cover"
                        />
                        {item.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs">{item.caption}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expandedCollections.has(collection.id) && collection.moodBoard.length === 0 && (
                <div className="p-8 text-center">
                  <BrainIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No images in this collection</p>
                </div>
              )}
            </div>
          ))}

          {/* Uncategorized Items */}
          {uncategorizedItems.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <BrainIcon className="h-5 w-5 text-gray-500" />
                  <h4 className="font-medium text-gray-900 dark:text-white">Uncategorized</h4>
                  <span className="text-sm text-gray-500">{uncategorizedItems.length} images</span>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uncategorizedItems.map((item) => (
                    <div key={item.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={item.imageUrl}
                        alt={item.caption || 'Mood board item'}
                        className="w-full h-full object-cover"
                      />
                      {item.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs">{item.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}