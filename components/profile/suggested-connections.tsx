
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Users, Loader2, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface SuggestedUser {
  id: string
  firstName: string
  lastName: string
  role: string
  profileImageUrl?: string
  bio?: string
  location?: string
  sharedInterests: string[]
  totalSharedInterests: number
}

interface SuggestedConnectionsProps {
  student: any
}

export default function SuggestedConnections({ student }: SuggestedConnectionsProps) {
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingRequest, setSendingRequest] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchSuggestedConnections = async () => {
    if (!student?.interests || student.interests.length === 0) {
      setLoading(false)
      return
    }

    try {
      const interestIds = student.interests.map((interest: any) => interest.id)
      const response = await fetch(`/api/users/suggested-connections?interests=${interestIds.join(',')}`)
      
      if (response.ok) {
        const suggestions = await response.json()
        setSuggestedUsers(suggestions.slice(0, 5)) // Show top 5
      }
    } catch (error) {
      console.error('Error fetching suggested connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendConnectionRequest = async (receiverId: string) => {
    if (!user) return

    setSendingRequest(receiverId)
    try {
      const response = await fetch('/api/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId,
          message: `Hi! I noticed we share similar interests and would love to connect with you on PathPiper.`
        }),
      })

      if (response.ok) {
        // Remove the user from suggestions since request is sent
        setSuggestedUsers(prev => prev.filter(u => u.id !== receiverId))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send connection request')
      }
    } catch (error) {
      console.error('Error sending connection request:', error)
      alert('Failed to send connection request')
    } finally {
      setSendingRequest(null)
    }
  }

  useEffect(() => {
    fetchSuggestedConnections()
  }, [student?.interests])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'mentor': return 'bg-green-100 text-green-800'
      case 'institution': return 'bg-purple-100 text-purple-800'
      case 'student': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!student?.interests || student.interests.length === 0) {
    return (
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-pathpiper-teal" />
            <span>Suggested Connections</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-sm">
              Add interests to your profile to discover people with similar passions!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-pathpiper-teal" />
          <span>Suggested Connections</span>
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          People who share your interests
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-pathpiper-teal" />
            <span className="ml-2 text-sm text-gray-500">Finding connections...</span>
          </div>
        ) : suggestedUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-sm">
              No suggestions found at the moment. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {suggestedUsers.map((suggestedUser) => (
              <div 
                key={suggestedUser.id} 
                className="relative bg-white dark:bg-gray-800 border rounded-xl p-3 hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => window.open(`/student/profile/view/${suggestedUser.id}`, '_blank')}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={suggestedUser.profileImageUrl} alt={`${suggestedUser.firstName} ${suggestedUser.lastName}`} />
                    <AvatarFallback className="text-sm">
                      {suggestedUser.firstName[0]}{suggestedUser.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="w-full">
                    <h4 className="font-medium text-xs truncate">
                      {suggestedUser.firstName} {suggestedUser.lastName}
                    </h4>
                    <Badge variant="outline" className={`text-xs mt-1 ${getRoleColor(suggestedUser.role)}`}>
                      {suggestedUser.role}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-pathpiper-teal font-medium">
                    {suggestedUser.totalSharedInterests} shared
                  </div>
                  
                  <div className="flex flex-wrap gap-1 justify-center">
                    {suggestedUser.sharedInterests.slice(0, 1).map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-pathpiper-teal/10 text-pathpiper-teal border border-pathpiper-teal/20 truncate max-w-full"
                      >
                        {interest}
                      </span>
                    ))}
                    {suggestedUser.sharedInterests.length > 1 && (
                      <span className="text-xs text-gray-500">
                        +{suggestedUser.sharedInterests.length - 1}
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      sendConnectionRequest(suggestedUser.id)
                    }}
                    disabled={sendingRequest === suggestedUser.id}
                    className="w-full h-7 text-xs bg-pathpiper-teal hover:bg-pathpiper-teal/90"
                  >
                    {sendingRequest === suggestedUser.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3 mr-1" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
