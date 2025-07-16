
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, MapPin } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Follower {
  id: string
  firstName: string
  lastName: string
  profileImageUrl: string | null
  role: string
  bio: string | null
  location: string | null
  followedAt: string
}

interface FollowersDialogProps {
  institutionId: string
  institutionName: string
  isOpen: boolean
  onClose: () => void
  followerCount: number
}

export default function FollowersDialog({ 
  institutionId, 
  institutionName, 
  isOpen, 
  onClose, 
  followerCount 
}: FollowersDialogProps) {
  const [followers, setFollowers] = useState<Follower[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && institutionId) {
      fetchFollowers()
    }
  }, [isOpen, institutionId])

  const fetchFollowers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/institutions/followers?institutionId=${institutionId}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch followers')
      }

      const data = await response.json()
      
      if (data.success) {
        setFollowers(data.followers)
      } else {
        setError(data.error || 'Failed to load followers')
      }
    } catch (err) {
      console.error('Error fetching followers:', err)
      setError('Failed to load followers')
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800'
      case 'mentor': return 'bg-green-100 text-green-800'
      case 'institution': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            {institutionName} Followers
            <Badge variant="secondary" className="ml-2">
              {followerCount}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Error loading followers</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          ) : followers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No followers yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {followers.map((follower) => (
                <div key={follower.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage 
                      src={follower.profileImageUrl || '/placeholder-user.jpg'} 
                      alt={`${follower.firstName} ${follower.lastName}`}
                    />
                    <AvatarFallback>
                      {follower.firstName[0]}{follower.lastName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {follower.firstName} {follower.lastName}
                      </h4>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getRoleColor(follower.role)}`}
                      >
                        {follower.role}
                      </Badge>
                    </div>

                    {follower.bio && (
                      <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                        {follower.bio}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {follower.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{follower.location}</span>
                        </div>
                      )}
                      <span className="flex-shrink-0">
                        Followed {formatDistanceToNow(new Date(follower.followedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
