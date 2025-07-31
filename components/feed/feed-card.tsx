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
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentCount, setCommentCount] = useState(item.commentsCount || item._count?.comments || item.stats?.comments || 0)

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
    // Optimistic update - immediate UI feedback
    const wasLiked = currentReaction === 'like'
    const newReaction = wasLiked ? null : 'like'
    const newCount = wasLiked ? Math.max(0, likeCount - 1) : likeCount + 1
    
    // Update UI immediately
    setCurrentReaction(newReaction)
    setLiked(!wasLiked)
    setLikeCount(newCount)

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
        // Revert optimistic update on error
        setCurrentReaction(wasLiked ? 'like' : null)
        setLiked(wasLiked)
        setLikeCount(likeCount)
        throw new Error('Failed to toggle like')
      }

      const data = await response.json()
      
      // Update with server response to ensure accuracy
      if (data.reactionType !== undefined) {
        setCurrentReaction(data.reactionType)
        setLiked(data.reactionType === 'like')
        
        if (data.reactionCounts) {
          const totalCount = Object.values(data.reactionCounts).reduce((sum: number, count: number) => sum + count, 0)
          setLikeCount(totalCount)
        } else if (data.likeCount !== undefined || data.likesCount !== undefined) {
          setLikeCount(data.likeCount || data.likesCount)
        }
      }
      else if (data.liked !== undefined) {
        setLiked(data.liked)
        setCurrentReaction(data.liked ? 'like' : null)
        setLikeCount(data.likeCount || data.likesCount || newCount)
      }

    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleSave = () => {
    setSaved(!saved)
  }

  const fetchComments = async () => {
    if (commentsLoading) return
    
    setCommentsLoading(true)
    try {
      const response = await fetch(`/api/feed/posts/${item.id}/comment`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/feed/posts/${item.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newComment.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev => [...prev, data.comment])
        setCommentCount(prev => prev + 1)
        setNewComment('')
      } else {
        console.error('Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleShowComments = () => {
    setShowComments(true)
    if (comments.length === 0) {
      fetchComments()
    }
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
                onClick={handleShowComments}
              >
                <MessageCircle className="h-6 w-6" />
                <span className="text-xs mt-1">{commentCount}</span>
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

      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowComments(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Comments ({commentCount})
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 max-h-96">
              {commentsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                          {comment.author?.profileImageUrl || comment.user?.profileImageUrl ? (
                            <img
                              src={comment.author?.profileImageUrl || comment.user?.profileImageUrl}
                              alt={`${comment.author?.firstName || comment.user?.firstName} ${comment.author?.lastName || comment.user?.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                              {(comment.author?.firstName || comment.user?.firstName || 'U')[0]}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-900">
                              {comment.author?.firstName || comment.user?.firstName} {comment.author?.lastName || comment.user?.lastName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Comment Form */}
            <div className="border-t p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    U
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}