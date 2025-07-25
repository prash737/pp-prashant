
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface MoodBoardItem {
  id: string
  imageUrl: string
  caption?: string
  position: number
}

interface MoodBoardMediaFormProps {
  data: any
  onChange: (sectionId: string, data: { moodBoard: MoodBoardItem[] }) => void
}

export default function MoodBoardMediaForm({ data, onChange }: MoodBoardMediaFormProps) {
  const { user } = useAuth()
  const [moodBoard, setMoodBoard] = useState<MoodBoardItem[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load existing mood board items from database
  useEffect(() => {
    const fetchMoodBoard = async () => {
      if (!user) return
      
      try {
        const response = await fetch(`/api/mood-board?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setMoodBoard(data.moodBoard || [])
        }
      } catch (error) {
        console.error('Error fetching mood board:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMoodBoard()
  }, [user])

  // Notify parent of changes
  useEffect(() => {
    onChange("media", { moodBoard })
  }, [moodBoard, onChange])

  const handleImageUpload = async (files: FileList) => {
    if (!user) return

    Array.from(files).forEach(async (file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const result = e.target?.result as string
          
          try {
            // Save to database
            const response = await fetch('/api/mood-board', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                imageUrl: result,
                caption: '',
                position: moodBoard.length
              })
            })

            if (response.ok) {
              const data = await response.json()
              setMoodBoard(prev => [...prev, data.item])
            }
          } catch (error) {
            console.error('Error saving mood board item:', error)
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeItem = async (id: string) => {
    try {
      const response = await fetch(`/api/mood-board?itemId=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMoodBoard(prev => prev.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error('Error removing mood board item:', error)
    }
  }

  const updateCaption = async (id: string, caption: string) => {
    const updatedItems = moodBoard.map(item => 
      item.id === id ? { ...item, caption } : item
    )
    setMoodBoard(updatedItems)

    // Update in database
    try {
      await fetch('/api/mood-board', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems })
      })
    } catch (error) {
      console.error('Error updating caption:', error)
    }
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedItem) return

    const draggedIndex = moodBoard.findIndex(item => item.id === draggedItem)
    const targetIndex = moodBoard.findIndex(item => item.id === targetId)

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newMoodBoard = [...moodBoard]
      const [draggedElement] = newMoodBoard.splice(draggedIndex, 1)
      newMoodBoard.splice(targetIndex, 0, draggedElement)
      setMoodBoard(newMoodBoard)

      // Update positions in database
      try {
        await fetch('/api/mood-board', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: newMoodBoard })
        })
      } catch (error) {
        console.error('Error updating positions:', error)
      }
    }
    setDraggedItem(null)
  }

  // Predefined inspirational images
  const inspirationalImages = [
    { id: 'preset1', url: '/images/coding-topic.png', caption: 'Programming' },
    { id: 'preset2', url: '/images/science-topic.png', caption: 'Science' },
    { id: 'preset3', url: '/images/arts-topic.png', caption: 'Arts' },
    { id: 'preset4', url: '/images/music-topic.png', caption: 'Music' },
    { id: 'preset5', url: '/images/sports-topic.png', caption: 'Sports' },
    { id: 'preset6', url: '/images/math-topic.png', caption: 'Mathematics' },
  ]

  const addPresetImage = async (presetImage: { id: string; url: string; caption: string }) => {
    if (!user || moodBoard.some(item => item.imageUrl === presetImage.url)) return

    try {
      const response = await fetch('/api/mood-board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          imageUrl: presetImage.url,
          caption: presetImage.caption,
          position: moodBoard.length
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMoodBoard(prev => [...prev, data.item])
      }
    } catch (error) {
      console.error('Error adding preset image:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mood Board & Media</h3>
          <p className="text-gray-600 dark:text-gray-400">Loading your mood board...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mood Board & Media</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Create a visual representation of your interests, goals, and inspiration. Add up to 12 images that represent who you are.
        </p>
      </div>

      <div className="space-y-6">
        {/* Upload Section */}
        <div>
          <Label className="text-lg font-medium mb-4 block">Upload Your Images</Label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
              className="hidden"
              id="mood-board-upload"
            />
            <label htmlFor="mood-board-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Images
              </p>
              <p className="text-gray-500">
                Click to browse or drag and drop images here
              </p>
              <p className="text-sm text-gray-400 mt-2">
                JPG, PNG up to 5MB each
              </p>
            </label>
          </div>
        </div>

        {/* Preset Images */}
        <div>
          <Label className="text-lg font-medium mb-4 block">Choose from Our Collection</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {inspirationalImages.map((preset) => (
              <div key={preset.id} className="relative group">
                <button
                  onClick={() => addPresetImage(preset)}
                  className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 hover:ring-2 hover:ring-pathpiper-teal transition-all"
                  disabled={moodBoard.some(item => item.imageUrl === preset.url)}
                >
                  <img
                    src={preset.url}
                    alt={preset.caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <Plus className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
                <p className="text-xs text-center mt-2 text-gray-600 dark:text-gray-400">
                  {preset.caption}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mood Board Grid */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <Label className="text-lg font-medium">Your Mood Board ({moodBoard.length}/12)</Label>
            {moodBoard.length > 0 && (
              <p className="text-sm text-gray-500">Drag to reorder</p>
            )}
          </div>

          {moodBoard.length === 0 ? (
            <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center bg-gray-50 dark:bg-gray-800">
              <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Your mood board is empty</p>
              <p className="text-sm text-gray-400">
                Upload images or choose from our collection to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {moodBoard.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item.id)}
                  className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-move"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.caption || 'Mood board item'}
                    className="w-full h-full object-cover"
                  />

                  {/* Remove button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>

                  {/* Caption overlay */}
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

              {/* Add more placeholder */}
              {moodBoard.length < 12 && (
                <label htmlFor="mood-board-upload" className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-pathpiper-teal transition-colors">
                  <div className="text-center">
                    <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Add Image</p>
                  </div>
                </label>
              )}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Mood Board Tips</h5>
          <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
            <li>• Include images that represent your interests, goals, and values</li>
            <li>• Add captions to help others understand what inspires you</li>
            <li>• You can rearrange images by dragging them around</li>
            <li>• Keep it authentic - choose images that truly represent you</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
