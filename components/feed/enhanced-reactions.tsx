
"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useCustomToast } from '@/hooks/use-custom-toast'

interface ReactionType {
  type: string
  emoji: string
  label: string
}

interface EnhancedReactionsProps {
  postId?: string
  initialLikes?: number
  isLiked?: boolean
  size?: 'sm' | 'md' | 'lg'
  onReactionChange?: (reactionType: string | null) => void
  reactionCounts?: Record<string, number>
  userReaction?: string | null
  onReact?: (reactionType: string) => void
}

const REACTION_TYPES: ReactionType[] = [
  { type: 'like', emoji: '❤️', label: 'Like' },
  { type: 'love', emoji: '😍', label: 'Love' },
  { type: 'laugh', emoji: '😂', label: 'Haha' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😠', label: 'Angry' },
  { type: 'celebrate', emoji: '🎉', label: 'Celebrate' },
  { type: 'think', emoji: '🤔', label: 'Thinking' }
]

export default function EnhancedReactions({ 
  postId, 
  initialLikes = 0, 
  isLiked = false,
  size = 'sm',
  onReactionChange,
  reactionCounts = {},
  userReaction = null,
  onReact
}: EnhancedReactionsProps) {
  const { user } = useAuth()
  const { toast } = useCustomToast()
  const [showReactions, setShowReactions] = useState(false)
  const [currentReaction, setCurrentReaction] = useState<string | null>(userReaction || (isLiked ? 'like' : null))
  const [reactionCount, setReactionCount] = useState(initialLikes || Object.values(reactionCounts).reduce((sum, count) => sum + count, 0))
  const [isHoveringReactions, setIsHoveringReactions] = useState(false)

  // Sync with parent state changes
  useEffect(() => {
    setCurrentReaction(userReaction || (isLiked ? 'like' : null))
  }, [userReaction, isLiked])

  useEffect(() => {
    const totalCount = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0)
    setReactionCount(totalCount || initialLikes)
  }, [reactionCounts, initialLikes])

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', 
    lg: 'h-6 w-6'
  }

  const emojiSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  const handleReaction = async (reactionType: string) => {
    if (!user) {
      toast.error("Please log in to react to posts")
      return
    }

    // Use passed onReact function if available (preferred)
    if (onReact) {
      onReact(reactionType)
      return
    }

    // Fallback to direct API call if no onReact prop
    if (!postId) {
      toast.error("Cannot react to post")
      return
    }

    try {
      const response = await fetch(`/api/feed/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reactionType })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json().catch(() => ({ error: 'Invalid response format' }))
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Handle enhanced reactions response
      if (data.reactionCounts) {
        setCurrentReaction(data.userReaction)
        setReactionCount(Object.values(data.reactionCounts).reduce((sum: number, count: number) => sum + count, 0))
        onReactionChange?.(data.userReaction)
      } 
      // Handle fallback like system response
      else if (reactionType === 'like') {
        const wasLiked = data.liked
        setCurrentReaction(wasLiked ? 'like' : null)
        setReactionCount(data.likeCount || data.likesCount || 0)
        onReactionChange?.(wasLiked ? 'like' : null)
      } 
      // Handle successful reaction change
      else if (data.success !== false) {
        if (currentReaction === reactionType) {
          // Removing reaction
          setCurrentReaction(null)
          setReactionCount(prev => Math.max(0, prev - 1))
        } else {
          // Adding or changing reaction
          if (!currentReaction) {
            setReactionCount(prev => prev + 1)
          }
          setCurrentReaction(reactionType)
        }
        onReactionChange?.(data.reactionType || null)
      }

    } catch (error) {
      console.error('Error adding reaction:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add reaction'
      toast.error(errorMessage)
    }
  }

  const handleLikeClick = () => {
    handleReaction('like')
  }

  const getCurrentReactionEmoji = () => {
    if (!currentReaction) return null
    return REACTION_TYPES.find(r => r.type === currentReaction)?.emoji
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size={size}
        onClick={handleLikeClick}
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => {
          if (!isHoveringReactions) {
            setTimeout(() => setShowReactions(false), 100)
          }
        }}
        className={`transition-all duration-200 ${
          currentReaction
            ? 'text-red-500 hover:text-red-600' 
            : 'text-gray-500 hover:text-red-500'
        }`}
      >
        {getCurrentReactionEmoji() ? (
          <span className="mr-2">{getCurrentReactionEmoji()}</span>
        ) : (
          <Heart className={`${sizeClasses[size]} mr-2 ${currentReaction ? 'fill-current' : ''}`} />
        )}
        {reactionCount}
      </Button>
      
      {/* Reaction Picker */}
      {showReactions && (
        <div 
          className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2 flex space-x-2 z-50"
          onMouseEnter={() => {
            setIsHoveringReactions(true)
            setShowReactions(true)
          }}
          onMouseLeave={() => {
            setIsHoveringReactions(false)
            setTimeout(() => setShowReactions(false), 100)
          }}
        >
          {REACTION_TYPES.map((reaction) => (
            <button
              key={reaction.type}
              onClick={(e) => {
                e.stopPropagation()
                handleReaction(reaction.type)
                setIsHoveringReactions(false)
                setShowReactions(false)
              }}
              className={`${emojiSizes[size]} hover:scale-125 transition-all duration-200 hover:bg-gray-100 rounded-full p-1 ${
                currentReaction === reaction.type ? 'scale-110 bg-gray-100' : ''
              }`}
              title={reaction.label}
            >
              {reaction.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
