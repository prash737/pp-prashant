
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { BrainIcon, Folder, ChevronDown, ChevronUp, X, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
  const [selectedCollection, setSelectedCollection] = useState<UserCollection | null>(null)
  const [showCollectionModal, setShowCollectionModal] = useState(false)
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

  const openCollectionModal = (collection: UserCollection) => {
    setSelectedCollection(collection)
    setShowCollectionModal(true)
  }

  const closeCollectionModal = () => {
    setSelectedCollection(null)
    setShowCollectionModal(false)
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
    <>
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
          {isOwnProfile && !isViewMode && (
            <div className="flex items-center gap-2">
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
            {/* Collections - Horizontal Scrollable */}
            {collections.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Collections</h4>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {collections.map((collection) => (
                    <div
                      key={collection.id}
                      className="flex-shrink-0 w-64 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => openCollectionModal(collection)}
                    >
                      {/* Collection Preview */}
                      <div className="h-32 bg-gray-100 dark:bg-gray-900 relative">
                        {collection.moodBoard.length > 0 ? (
                          <div className="grid grid-cols-2 gap-1 h-full p-1">
                            {collection.moodBoard.slice(0, 4).map((item, index) => (
                              <div key={item.id} className="relative overflow-hidden rounded">
                                <img
                                  src={item.imageUrl}
                                  alt={item.caption || `Image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {collection.moodBoard.length > 4 && (
                              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                +{collection.moodBoard.length - 4}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Folder className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded">
                          <Eye className="h-4 w-4" />
                        </div>
                      </div>

                      {/* Collection Info */}
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Folder className="h-4 w-4 text-blue-500" />
                          <h5 className="font-medium text-gray-900 dark:text-white truncate">{collection.name}</h5>
                        </div>
                        {collection.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{collection.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{collection.moodBoard.length} images</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uncategorized Items */}
            {uncategorizedItems.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <BrainIcon className="h-5 w-5 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Uncategorized</h4>
                  <span className="text-xs text-gray-500">{uncategorizedItems.length} images</span>
                </div>
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
            )}
          </div>
        )}
      </motion.div>

      {/* Collection Modal */}
      <Dialog open={showCollectionModal} onOpenChange={setShowCollectionModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-blue-500" />
              {selectedCollection?.name}
            </DialogTitle>
            {selectedCollection?.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedCollection.description}
              </p>
            )}
          </DialogHeader>
          
          <div className="mt-4">
            {selectedCollection && selectedCollection.moodBoard.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedCollection.moodBoard.map((item) => (
                  <div key={item.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={item.imageUrl}
                      alt={item.caption || `Image from ${selectedCollection.name}`}
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
            ) : (
              <div className="text-center py-8">
                <BrainIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No images in this collection</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
