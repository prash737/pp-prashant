
"use client"

import { useState, useEffect } from "react"
import { Search, User, Users, Building, UserPlus, UserCheck, UserMinus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface User {
  id: string
  firstName: string
  lastName: string
  role: string
  profileImageUrl?: string
  bio?: string
  location?: string
}

interface UserSearchProps {
  onUserSelect?: (user: User) => void
  placeholder?: string
  showFilters?: boolean
}

export default function UserSearch({ onUserSelect, placeholder = "Search for people...", showFilters = true }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({})
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({})

  const searchUsers = async (query: string, role?: string) => {
    if (query.length < 2) {
      setSearchResults([])
      setFollowStatus({})
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({ q: query })
      if (role) params.append('role', role)
      
      const response = await fetch(`/api/users/search?${params}`)
      if (response.ok) {
        const users = await response.json()
        setSearchResults(users)
        
        // Get follow status for institutions
        const institutionIds = users.filter((user: User) => user.role === 'institution').map((user: User) => user.id)
        if (institutionIds.length > 0) {
          await checkFollowStatus(institutionIds)
        }
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkFollowStatus = async (institutionIds: string[]) => {
    try {
      const response = await fetch(`/api/institutions/follow-status?ids=${institutionIds.join(',')}`)
      if (response.ok) {
        const data = await response.json()
        setFollowStatus(data.followStatus)
      }
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  const handleFollowToggle = async (institutionId: string, isFollowing: boolean) => {
    setFollowLoading(prev => ({ ...prev, [institutionId]: true }))
    
    try {
      const method = isFollowing ? 'DELETE' : 'POST'
      const response = await fetch('/api/institutions/follow', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ institutionId })
      })

      if (response.ok) {
        setFollowStatus(prev => ({
          ...prev,
          [institutionId]: !isFollowing
        }))
      } else {
        console.error('Failed to toggle follow status')
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setFollowLoading(prev => ({ ...prev, [institutionId]: false }))
    }
  }

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchUsers(searchQuery, selectedRole)
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery, selectedRole])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'mentor': return <User className="h-4 w-4" />
      case 'institution': return <Building className="h-4 w-4" />
      case 'student': return <Users className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'mentor': return 'bg-green-100 text-green-800'
      case 'institution': return 'bg-purple-100 text-purple-800'
      case 'student': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleUserClick = (user: User) => {
    if (onUserSelect) {
      onUserSelect(user)
    } else {
      // Default behavior: navigate to profile
      if (user.role === 'student') {
        window.open(`/student/profile/view/${user.id}`, '_blank')
      }
      // Add mentor and institution profile routes as needed
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Find People</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {showFilters && (
          <div className="flex space-x-2">
            <Button
              variant={selectedRole === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRole("")}
            >
              All
            </Button>
            <Button
              variant={selectedRole === "student" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRole("student")}
            >
              Students
            </Button>
            <Button
              variant={selectedRole === "mentor" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRole("mentor")}
            >
              Mentors
            </Button>
            <Button
              variant={selectedRole === "institution" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRole("institution")}
            >
              Institutions
            </Button>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pathpiper-teal mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div 
                  className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleUserClick(user)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback>
                      {user.firstName[0]}{user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-sm">
                        {user.firstName} {user.lastName}
                      </h4>
                      <Badge variant="outline" className={`text-xs ${getRoleColor(user.role)}`}>
                        <span className="flex items-center space-x-1">
                          {getRoleIcon(user.role)}
                          <span>{user.role}</span>
                        </span>
                      </Badge>
                    </div>
                    
                    {user.bio && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user.bio}</p>
                    )}
                    
                    {user.location && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">{user.location}</p>
                    )}
                  </div>
                </div>

                {user.role === 'institution' && (
                  <div className="flex items-center space-x-2">
                    {followStatus[user.id] ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="text-xs px-3 py-1 h-7"
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          Following
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFollowToggle(user.id, true)
                          }}
                          disabled={followLoading[user.id]}
                          className="text-xs px-2 py-1 h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <UserMinus className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFollowToggle(user.id, false)
                        }}
                        disabled={followLoading[user.id]}
                        className="text-xs px-3 py-1 h-7 bg-blue-600 hover:bg-blue-700"
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Follow
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : searchQuery.length >= 2 ? (
            <div className="text-center py-4">
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">Start typing to search for people</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
