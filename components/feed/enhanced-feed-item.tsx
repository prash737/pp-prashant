
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
  Plus,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface EnhancedFeedItemProps {
  item: any
  isActive: boolean
}

export default function EnhancedFeedItem({ item, isActive }: EnhancedFeedItemProps) {
  const [liked, setLiked] = useState(item.isLikedByUser || false)
  const [saved, setSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(item.likesCount || item.stats?.likes || 0)
  const [showComments, setShowComments] = useState(false)
  const [showAddTrail, setShowAddTrail] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [trailText, setTrailText] = useState("")
  const [comments, setComments] = useState([])
  const [trails, setTrails] = useState(item.trails || [])

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
      setLiked(data.reactionType === 'like')

      if (data.reactionType === 'like') {
        setLikeCount(prev => prev + 1)
      } else {
        setLikeCount(prev => Math.max(0, prev - 1))
      }

    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleSave = () => {
    setSaved(!saved)
  }

  const handleAddComment = async () => {
    if (!commentText.trim()) return

    try {
      const response = await fetch(`/api/feed/posts/${item.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          content: commentText.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      const data = await response.json()
      setComments(prev => [...prev, data.comment])
      setCommentText("")
      
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleAddTrail = async () => {
    if (!trailText.trim()) return

    try {
      const response = await fetch(`/api/feed/posts/${item.id}/trails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          content: trailText.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add trail')
      }

      const data = await response.json()
      setTrails(prev => [...prev, data.trail])
      setTrailText("")
      setShowAddTrail(false)
      
    } catch (error) {
      console.error('Error adding trail:', error)
    }
  }

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/feed/posts/${item.id}/comment`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error loading comments:', error)
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200">
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
            <h3 className="font-medium text-sm text-gray-900">{item.author.name}</h3>
            <p className="text-xs text-gray-500">
              {item.author.role === "Student" && item.author.school}
              {item.author.role === "Mentor" && `Mentor • ${item.author.expertise}`}
              {item.author.role === "Institution" && item.author.location}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {getBadgeText()}
        </Badge>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            {getIcon()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{item.title}</h2>
            {item.subtitle && <p className="text-sm text-gray-600">{item.subtitle}</p>}
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-4">{item.description}</p>

        {/* Image */}
        {item.backgroundImage && (
          <div className="relative h-48 rounded-lg overflow-hidden mb-4">
            <Image
              src={item.backgroundImage}
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Event Details */}
        {item.type === "event" && item.eventDetails && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {item.eventDetails.date} • {item.eventDetails.time}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
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

        {/* Trails */}
        {trails.length > 0 && (
          <div className="mb-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Trail Messages</h4>
            {trails.map((trail, index) => (
              <div key={trail.id || index} className="bg-purple-50 border-l-4 border-purple-200 p-3 rounded-r-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-6 w-6 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-xs font-bold">
                    #{trail.trailOrder || index + 1}
                  </div>
                  <span className="text-sm font-medium text-purple-800">
                    {trail.author?.firstName} {trail.author?.lastName}
                  </span>
                </div>
                <p className="text-sm text-gray-700 ml-8">{trail.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-6">
            <button
              className={`flex items-center gap-2 ${liked ? "text-red-500" : "text-gray-600"} hover:text-red-500 transition-colors`}
              onClick={handleLike}
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-red-500" : ""}`} />
              <span className="text-sm font-medium">{likeCount}</span>
            </button>
            
            <button
              className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
              onClick={() => {
                setShowComments(!showComments)
                if (!showComments) {
                  loadComments()
                }
              }}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{comments.length || item.stats?.comments || 0}</span>
            </button>

            <button
              className="flex items-center gap-2 text-gray-600 hover:text-purple-500 transition-colors"
              onClick={() => setShowAddTrail(!showAddTrail)}
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">Trail</span>
            </button>

            <button className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors">
              <Share2 className="h-5 w-5" />
              <span className="text-sm font-medium">{item.stats?.shares || 0}</span>
            </button>
          </div>

          <button 
            className={`${saved ? "text-pathpiper-teal" : "text-gray-600"} hover:text-pathpiper-teal transition-colors`} 
            onClick={handleSave}
          >
            <Bookmark className={`h-5 w-5 ${saved ? "fill-pathpiper-teal" : ""}`} />
          </button>
        </div>

        {/* Add Trail Section */}
        <Collapsible open={showAddTrail} onOpenChange={setShowAddTrail}>
          <CollapsibleContent className="mt-4">
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Plus className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium text-purple-800">Add to Trail</h4>
                </div>
                <Textarea
                  value={trailText}
                  onChange={(e) => setTrailText(e.target.value)}
                  placeholder="Continue the conversation..."
                  className="mb-3 border-purple-200 focus:border-purple-500"
                  rows={3}
                />
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleAddTrail}
                    disabled={!trailText.trim()}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Add Trail
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowAddTrail(false)
                      setTrailText("")
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Comments Section */}
        <Collapsible open={showComments} onOpenChange={setShowComments}>
          <CollapsibleContent className="mt-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-800">Comments</h4>
                </div>
                
                {/* Existing Comments */}
                {comments.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {comments.map((comment, index) => (
                      <div key={comment.id || index} className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-700">
                              {comment.author?.firstName?.[0]}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-blue-800">
                            {comment.author?.firstName} {comment.author?.lastName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 ml-8">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment */}
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="mb-3 border-blue-200 focus:border-blue-500"
                  rows={2}
                />
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Comment
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowComments(false)
                      setCommentText("")
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
