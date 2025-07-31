"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Award,
  Calendar,
  BookOpen,
  HelpCircle,
  Lightbulb,
  BadgeCheck,
  Play,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FeedCardProps {
  item: any
  isActive: boolean
}

export default function FeedCard({ item, isActive }: FeedCardProps) {
  const [liked, setLiked] = useState(item.isLikedByUser || false)
  const [saved, setSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(item.likesCount || item._count?.likes || item.stats?.likes || 0)

  const [currentReaction, setCurrentReaction] = useState<string | null>(item.userReaction || (item.isLikedByUser ? 'like' : null))

  const getReactionEmoji = (reactionType: string) => {
    const reactions: Record<string, string> = {
      'like': '❤️',
      'love': '😍',
      'laugh': '😂',
      'wow': '😮',
      'sad': '😢',
      'angry': '😠',
      'celebrate': '🎉',
      'think': '🤔'
    }
    return reactions[reactionType] || '❤️'
  }

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/feed/posts/${item.id}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          reactionType: 'like'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle like')
      }

      const data = await response.json()
      
      // Handle enhanced reactions response
      if (data.reactionType !== undefined) {
        setCurrentReaction(data.reactionType)
        setLiked(data.reactionType === 'like')
        
        // Update count based on reaction change
        if (data.reactionCounts) {
          const totalCount = Object.values(data.reactionCounts).reduce((sum: number, count: number) => sum + count, 0)
          setLikeCount(totalCount)
        } else {
          if (data.reactionType === 'like') {
            setLikeCount(prev => prev + 1)
          } else if (data.reactionType === null) {
            setLikeCount(prev => Math.max(0, prev - 1))
          }
        }
      }
      // Handle fallback like response
      else if (data.liked !== undefined) {
        setLiked(data.liked)
        setCurrentReaction(data.liked ? 'like' : null)
        setLikeCount(data.likeCount || data.likesCount || likeCount)
      }

    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleSave = () => {
    setSaved(!saved)
  }

  // Get the appropriate icon based on the item type
  const getIcon = () => {
    switch (item.type) {
      case "achievement":
        return <Award className="h-6 w-6" />
      case "event":
        return <Calendar className="h-6 w-6" />
      case "resource":
        return <BookOpen className="h-6 w-6" />
      case "question":
        return <HelpCircle className="h-6 w-6" />
      case "project":
        return <Lightbulb className="h-6 w-6" />
      default:
        return null
    }
  }

  // Get the appropriate badge text based on the item type
  const getBadgeText = () => {
    switch (item.type) {
      case "achievement":
        return "Achievement"
      case "event":
        return "Event"
      case "resource":
        return "Resource"
      case "question":
        return "Question"
      case "project":
        return "Project"
      default:
        return ""
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={item.backgroundImage || "/placeholder.svg"}
          alt={item.title}
          fill
          className="object-cover"
          priority={isActive}
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${item.color} opacity-70`}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6">
        {/* Top Section - Author Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white">
                <Image
                  src={item.author.avatar || "/placeholder.svg"}
                  alt={item.author.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1">
                <BadgeCheck className="h-4 w-4 text-pathpiper-teal bg-white rounded-full" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-sm text-white">{item.author.name}</h3>
              <p className="text-xs text-white/80">
                {item.author.role === "Student" && item.author.school}
                {item.author.role === "Mentor" && `Mentor • ${item.author.expertise}`}
                {item.author.role === "Institution" && item.author.location}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-white/10 backdrop-blur-md text-white border-white/20">
            {getBadgeText()}
          </Badge>
        </div>

        {/* Middle Section - Empty Space */}
        <div className="flex-grow"></div>

        {/* Bottom Section - Content and Actions */}
        <div className="space-y-4">
          {/* Title and Description */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                {getIcon()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{item.title}</h2>
                <p className="text-sm text-white/80">{item.subtitle}</p>
              </div>
            </div>
            <p className="text-sm text-white/90 line-clamp-3">{item.description}</p>
          </div>

          {/* Event Details (if applicable) */}
          {item.type === "event" && item.eventDetails && (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2 text-xs text-white">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {item.eventDetails.date} • {item.eventDetails.time}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{item.eventDetails.location}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className={`flex flex-col items-center transition-all duration-200 ${
                  currentReaction ? "text-red-500" : "text-white"
                } hover:scale-105`}
                onClick={handleLike}
              >
                <div className="flex items-center justify-center h-6 w-6 mb-1">
                  {currentReaction ? (
                    <span className="text-lg">{getReactionEmoji(currentReaction)}</span>
                  ) : (
                    <Heart className={`h-6 w-6 ${liked ? "fill-red-500" : ""}`} />
                  )}
                </div>
                <span className="text-xs">{likeCount}</span>
              </button>
              <button 
                className="flex flex-col items-center text-white hover:text-blue-400 transition-colors"
                onClick={() => {
                  // Handle comment functionality
                  console.log('Comment button clicked for post:', item.id)
                }}
              >
                <MessageCircle className="h-6 w-6" />
                <span className="text-xs mt-1">{item.stats.comments}</span>
              </button>
              <button 
                className="flex flex-col items-center text-white hover:text-purple-400 transition-colors"
                onClick={() => {
                  // Handle add trail functionality
                  console.log('Add trail button clicked for post:', item.id)
                }}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs mt-1">Trail</span>
              </button>
              <button className="flex flex-col items-center text-white hover:text-green-400 transition-colors">
                <Share2 className="h-6 w-6" />
                <span className="text-xs mt-1">{item.stats.shares}</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button className={`flex items-center justify-center h-12 w-12 rounded-full bg-white text-black hover:bg-gray-100 transition-colors`}>
                <Play className="h-6 w-6 fill-current" />
              </button>
              <button className={`${saved ? "text-pathpiper-teal" : "text-white"} hover:text-pathpiper-teal transition-colors`} onClick={handleSave}>
                <Bookmark className={`h-6 w-6 ${saved ? "fill-pathpiper-teal" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}