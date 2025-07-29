"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { Plus, Upload, X, Folder, FolderPlus, Trash2, ImageIcon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
  isPrivate?: boolean
  moodBoard: MoodBoardItem[]
}

interface MoodBoardMediaFormProps {
  data: any
  onChange: (sectionId: string, data: { collections: UserCollection[], uncategorizedItems: MoodBoardItem[] }) => void
}

export default function MoodBoardMediaForm({ data, onChange }: MoodBoardMediaFormProps) {
  const { user } = useAuth()
  const [collections, setCollections] = useState<UserCollection[]>([])
  const [uncategorizedItems, setUncategorizedItems] = useState<MoodBoardItem[]>([])
  const [selectedCollection, setSelectedCollection] = useState<UserCollection | null>(null)
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [newCollectionDescription, setNewCollectionDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

  // Load existing collections and mood board items
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const response = await fetch(`/api/mood-board?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setCollections(data.collections || [])
          setUncategorizedItems(data.uncategorizedItems || [])
        }
      } catch (error) {
        console.error('Error fetching mood board data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Notify parent of changes
  useEffect(() => {
    onChange("media", { collections, uncategorizedItems })
  }, [collections, uncategorizedItems, onChange])

  const handleCreateCollection = async () => {
    if (!user || !newCollectionName.trim()) return

    try {
      const response = await fetch('/api/user-collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCollectionName,
          description: newCollectionDescription
        })
      })

      if (response.ok) {
        const data = await response.json()
        setCollections(prev => [data.collection, ...prev])
        setNewCollectionName("")
        setNewCollectionDescription("")
        setIsCreateCollectionOpen(false)
      }
    } catch (error) {
      console.error('Error creating collection:', error)
    }
  }

  const handleImageUpload = async (files: FileList, collection?: UserCollection) => {
    if (!user) return

    Array.from(files).forEach(async (file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const result = e.target?.result as string

          try {
            const response = await fetch('/api/mood-board', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                imageUrl: result,
                caption: '',
                position: collection ? collection.moodBoard.length : uncategorizedItems.length,
                collectionId: collection?.id
              })
            })

            if (response.ok) {
              const data = await response.json()

              if (collection) {
                setCollections(prev => prev.map(c => 
                  c.id === collection.id 
                    ? { ...c, moodBoard: [...c.moodBoard, data.item] }
                    : c
                ))
              } else {
                setUncategorizedItems(prev => [...prev, data.item])
              }
            }
          } catch (error) {
            console.error('Error saving mood board item:', error)
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeItem = async (itemId: string, collectionId?: number) => {
    try {
      const response = await fetch(`/api/mood-board?itemId=${itemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        if (collectionId) {
          setCollections(prev => prev.map(c => 
            c.id === collectionId
              ? { ...c, moodBoard: c.moodBoard.filter(item => item.id !== itemId) }
              : c
          ))
        } else {
          setUncategorizedItems(prev => prev.filter(item => item.id !== itemId))
        }
      }
    } catch (error) {
      console.error('Error removing mood board item:', error)
    }
  }

  const updateCaption = async (itemId: string, caption: string, collectionId?: number) => {
    try {
      await fetch('/api/mood-board', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itemId, 
          caption 
        })
      })

      if (collectionId) {
        setCollections(prev => prev.map(c => 
          c.id === collectionId
            ? { 
                ...c, 
                moodBoard: c.moodBoard.map(item => 
                  item.id === itemId ? { ...item, caption } : item
                )
              }
            : c
        ))
      } else {
        setUncategorizedItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, caption } : item
        ))
      }
    } catch (error) {
      console.error('Error updating caption:', error)
    }
  }

  const removeCollection = async (collectionId: number) => {
    try {
      const response = await fetch(`/api/user-collections?collectionId=${collectionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCollections(prev => prev.filter(c => c.id !== collectionId))
      }
    } catch (error) {
      console.error('Error removing collection:', error)
    }
  }

    const handleUploadClick = (collectionId: number) => {
    // Programmatically trigger the file input
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: any, collectionId: number) => {
    if (e.target.files) {
      handleImageUpload(e.target.files, collections.find(c => c.id === collectionId));
    }
  };

    const deleteCollection = async (collectionId: number) => {
    try {
      const response = await fetch(`/api/user-collections?collectionId=${collectionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCollections((prev) => prev.filter((c) => c.id !== collectionId));
        toast.success("Collection deleted successfully!");
      } else {
        toast.error("Failed to delete collection.");
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error("Error deleting collection.");
    }
  };

  const updateCollectionPrivacy = async (collectionId: number, isPrivate: boolean) => {
    try {
      const response = await fetch('/api/user-collections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionId,
          isPrivate
        })
      });

      if (response.ok) {
        setCollections(prev => prev.map(c => 
          c.id === collectionId ? { ...c, isPrivate } : c
        ));
      }
    } catch (error) {
      console.error('Error updating collection privacy:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mood Board & Media</h3>
          <p className="text-gray-600 dark:text-gray-400">Loading your collections...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mood Board & Media</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Organize your visual inspiration into collections. Create themed collections and add images that represent your interests and goals.
        </p>
      </div>

      <div className="space-y-6">
        {/* Create Collection Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-lg font-medium">Collections</Label>
            <Dialog open={isCreateCollectionOpen} onOpenChange={setIsCreateCollectionOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create Collection
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Collection</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="collection-name">Collection Name</Label>
                    <Input
                      id="collection-name"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="Enter collection name..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="collection-description">Description (Optional)</Label>
                    <Textarea
                      id="collection-description"
                      value={newCollectionDescription}
                      onChange={(e) => setNewCollectionDescription(e.target.value)}
                      placeholder="Describe your collection..."
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateCollectionOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCollection} disabled={!newCollectionName.trim()}>
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Collections - Vertical Grid Layout */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <div key={collection.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {selectedCollection?.id === collection.id ? (
                  // Expanded view
                  <div className="w-full">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <Folder className="h-5 w-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{collection.name}</h4>
                          {collection.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{collection.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`private-${collection.id}`}
                            checked={collection.isPrivate || false}
                            onChange={(e) => updateCollectionPrivacy(collection.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label 
                            htmlFor={`private-${collection.id}`}
                            className="text-sm text-gray-600 dark:text-gray-400"
                          >
                            Keep private
                          </label>
                        </div>
                        <span className="text-sm text-gray-500">{collection.moodBoard.length} images</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCollection(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={16} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{collection.name}"? This will permanently delete the collection and all {collection.moodBoard.length} images in it. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteCollection(collection.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Collection
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {/* Upload Area */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, collection.id)}
                        multiple
                        className="hidden"
                      />
                      <button
                        onClick={() => handleUploadClick(collection.id)}
                        className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center hover:border-pathpiper-teal hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400">Add images to {collection.name}</p>
                      </button>
                    </div>

                    {/* Collection Images */}
                    {collection.moodBoard.length > 0 ? (
                      <div className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {collection.moodBoard.map((item) => (
                            <div
                              key={item.id}
                              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.caption || 'Mood board item'}
                                className="w-full h-full object-cover"
                              />

                              {/* Remove button */}
                              <button
                                onClick={() => removeItem(item.id, collection.id)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={14} />
                              </button>

                              {/* Caption overlay with editing */}
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <input
                                  type="text"
                                  value={item.caption || ''}
                                  onChange={(e) => updateCaption(item.id, e.target.value, collection.id)}
                                  placeholder="Add caption..."
                                  className="w-full bg-transparent text-xs placeholder-gray-300 outline-none"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <ImageIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No images in this collection</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Compact card view
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    onClick={() => setSelectedCollection(collection)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Folder className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">{collection.name}</h4>
                        {collection.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{collection.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Preview images - Improved layout */}
                    {collection.moodBoard.length > 0 ? (
                      <div className="grid grid-cols-2 gap-1 mb-3 h-24">
                        {collection.moodBoard.slice(0, 4).map((item, index) => (
                          <div key={item.id} className="aspect-square rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <img
                              src={item.imageUrl}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {collection.moodBoard.length > 4 && (
                          <div className="aspect-square rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                            +{collection.moodBoard.length - 4}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded mb-3 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-300" />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">{collection.moodBoard.length} images</span>
                      <div className="flex items-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button 
                              className="text-red-500 hover:text-red-700 p-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{collection.name}"? This will permanently delete the collection and all {collection.moodBoard.length} images in it. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteCollection(collection.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Collection
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <span className="text-pathpiper-teal text-sm">Click to expand</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Uncategorized Items (for backward compatibility) */}
        {uncategorizedItems.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Uncategorized Items</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uncategorizedItems.map((item) => (
                <div
                  key={item.id}
                  className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.caption || 'Mood board item'}
                    className="w-full h-full object-cover"
                  />

                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input
                      type="text"
                      value={item.caption || ''}
                      onChange={(e) => updateCaption(item.id, e.target.value)}
                      placeholder="Add caption..."
                      className="w-full bg-transparent text-xs placeholder-gray-300 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Collection Tips</h5>
          <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
            <li>• Create themed collections like "Career Goals", "Hobbies", or "Travel Dreams"</li>
            <li>• Add meaningful captions to help others understand your inspiration</li>
            <li>• Collections help organize your mood board and make it easier to find images</li>
            <li>• You can delete entire collections or individual images anytime</li>
          </ul>
        </div>
      </div>
    </div>
  )
}