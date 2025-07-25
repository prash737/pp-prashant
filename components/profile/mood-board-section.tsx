
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { BrainIcon } from "lucide-react"

interface MoodBoardItem {
  id: string
  imageUrl: string
  caption?: string
  position: number
}

interface MoodBoardSectionProps {
  studentId: string
}

export default function MoodBoardSection({ studentId }: MoodBoardSectionProps) {
  const [moodBoard, setMoodBoard] = useState<MoodBoardItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMoodBoard = async () => {
      try {
        const response = await fetch(`/api/mood-board?userId=${studentId}`)
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

    if (studentId) {
      fetchMoodBoard()
    }
  }, [studentId])

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

      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {moodBoard && moodBoard.length > 0 ? (
            moodBoard.slice(0, 9).map((item) => (
              <div key={item.id} className="aspect-square rounded-lg overflow-hidden relative group">
                <Image 
                  src={item.imageUrl} 
                  alt={item.caption || "Mood board image"} 
                  fill 
                  className="object-cover transition-transform group-hover:scale-105" 
                />
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs truncate">{item.caption}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
              <BrainIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No mood board images yet</p>
            </div>
          )}
        </div>
      )}
      
      {moodBoard.length > 9 && (
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-500">+{moodBoard.length - 9} more images</p>
        </div>
      )}
    </motion.div>
  )
}
