"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Award,
  Calendar,
  FileText,
  HelpCircle,
  Pin,
  BadgeCheck,
} from "lucide-react"

interface FeedItemProps {
  item: any
}

export default function FeedItem({ item }: FeedItemProps) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(item.likes)

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setLiked(!liked)
  }

  const handleSave = () => {
    setSaved(!saved)
  }

  // Determine the icon based on the post type
  const renderTypeIcon = () => {
    switch (item.type) {
      case "achievement":
        return <Award className="h-4 w-4 text-amber-500" />
      case "event":
        return <Calendar className="h-4 w-4 text-purple-500" />
      case "resource":
        return <FileText className="h-4 w-4 text-teal-500" />
      case "question":
        return <HelpCircle className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Card Header - Author Info */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full overflow-hidden">
              <Image
                src={item.author.avatar || "/placeholder.svg"}
                alt={item.author.name}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            {item.author.verified && (
              <div className="absolute -bottom-1 -right-1">
                <BadgeCheck className="h-4 w-4 text-pathpiper-teal bg-white rounded-full" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-medium text-sm">{item.author.name}</h3>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{item.timestamp}</span>
            </div>
            <p className="text-xs text-gray-500">
              {item.author.role === "student" && item.author.school}
              {item.author.role === "mentor" && `Mentor • ${item.author.expertise}`}
              {item.author.role === "institution" && item.author.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {item.isPinned && <Pin className="h-3.5 w-3.5 text-gray-400 rotate-45" />}
          {renderTypeIcon()}
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <CardContent className="p-4">
        {/* Post Content */}
        <p className="text-sm text-gray-700 mb-3">{item.content}</p>

        {/* Tags */}
        {item.tags && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.tags.map((tag: string) => (
              <Badge
                key={tag}
                variant="outline"
                className="bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200 text-xs py-0 px-2"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Achievement Card */}
        {item.type === "achievement" && item.achievement && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-3 flex items-center gap-3">
            <div className="bg-amber-100 h-10 w-10 rounded-full flex items-center justify-center">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-amber-800">{item.achievement.title}</h4>
              <p className="text-xs text-amber-600">Achievement Unlocked</p>
            </div>
          </div>
        )}

        {/* Event Card */}
        {item.type === "event" && item.event && (
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
            {item.event.image && (
              <div className="relative h-48 w-full">
                <Image
                  src={item.event.image || "/placeholder.svg"}
                  alt={item.event.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-3 bg-white">
              <h4 className="font-medium text-sm">{item.event.title}</h4>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {item.event.date} • {item.event.time}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
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
                <span>{item.event.location}</span>
              </div>
            </div>
          </div>
        )}

        {/* Resource Card */}
        {item.type === "resource" && item.resource && (
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-3 flex">
            {item.resource.thumbnail && (
              <div className="relative h-24 w-24 flex-shrink-0">
                <Image
                  src={item.resource.thumbnail || "/placeholder.svg"}
                  alt={item.resource.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-3 flex-1">
              <h4 className="font-medium text-sm">{item.resource.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{item.resource.type}</p>
              <Button variant="link" className="text-xs h-auto p-0 mt-1 text-pathpiper-teal">
                View Resource
              </Button>
            </div>
          </div>
        )}

        {/* Media Gallery */}
        {item.media && item.media.length > 0 && (
          <div className={`grid ${item.media.length > 1 ? "grid-cols-2 gap-2" : "grid-cols-1"} mb-3`}>
            {item.media.map((media: string, index: number) => (
              <div key={index} className="relative rounded-lg overflow-hidden aspect-video">
                <Image src={media || "/placeholder.svg"} alt={`Media ${index + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Card Footer - Engagement Actions */}
      <CardFooter className="p-2 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`text-xs h-8 px-2 ${liked ? "text-red-500" : "text-gray-600"}`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 mr-1 ${liked ? "fill-red-500" : ""}`} />
            {likeCount}
          </Button>
          <Button variant="ghost" size="sm" className="text-xs h-8 px-2 text-gray-600">
            <MessageCircle className="h-4 w-4 mr-1" />
            {item.comments}
          </Button>
          <Button variant="ghost" size="sm" className="text-xs h-8 px-2 text-gray-600">
            <Share2 className="h-4 w-4 mr-1" />
            {item.shares}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={`text-xs h-8 px-2 ${saved ? "text-pathpiper-teal" : "text-gray-600"}`}
          onClick={handleSave}
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-pathpiper-teal" : ""}`} />
        </Button>
      </CardFooter>
    </Card>
  )
}
