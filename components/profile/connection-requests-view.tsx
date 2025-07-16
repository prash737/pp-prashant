"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  UserPlus,
  X,
  Check,
  Clock,
  MessageCircle,
  Crown,
  Shield,
  Star,
  GraduationCap,
  Building,
} from "lucide-react"

interface ConnectionRequest {
  id: string
  status: string
  message?: string
  createdAt: string
  sender?: {
    id: string
    firstName: string
    lastName: string
    profileImageUrl?: string
    role: string
    bio?: string
  }
  receiver?: {
    id: string
    firstName: string
    lastName: string
    profileImageUrl?: string
    role: string
    bio?: string
  }
}

interface CircleInvitation {
  id: string
  status: string
  message?: string
  createdAt: string
  circle: {
    id: string
    name: string
    color: string
    icon: string
  }
  inviter: {
    id: string
    firstName: string
    lastName: string
    profileImageUrl?: string
    role: string
  }
}

export default function ConnectionRequestsView() {
  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequest[]>([])
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([])
  const [circleInvitations, setCircleInvitations] = useState<CircleInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)

  const fetchConnectionRequests = async () => {
    try {
      const [receivedResponse, sentResponse, circleInvitationsResponse] = await Promise.all([
        fetch('/api/connections/requests?type=received'),
        fetch('/api/connections/requests?type=sent'),
        fetch('/api/circles/invitations?type=received')
      ])

      if (receivedResponse.ok) {
        const received = await receivedResponse.json()
        setReceivedRequests(received)
      }

      if (sentResponse.ok) {
        const sent = await sentResponse.json()
        setSentRequests(sent)
      }

      if (circleInvitationsResponse.ok) {
        const invitations = await circleInvitationsResponse.json()
        setCircleInvitations(invitations)
      }
    } catch (error) {
      console.error('Error fetching connection requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestResponse = async (requestId: string, action: 'accept' | 'decline') => {
    setProcessingRequest(requestId)
    try {
      const response = await fetch(`/api/connections/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        // Refresh the requests
        fetchConnectionRequests()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to process request')
      }
    } catch (error) {
      console.error('Error processing request:', error)
      alert('Failed to process request')
    } finally {
      setProcessingRequest(null)
    }
  }

  useEffect(() => {
    fetchConnectionRequests()
  }, [])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'mentor': return 'bg-green-100 text-green-800'
      case 'institution': return 'bg-purple-100 text-purple-800'
      case 'student': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'declined': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getIconComponent = (iconName: string) => {
    // Check if it's a base64 image (starts with data:image)
    if (iconName?.startsWith('data:image')) {
      return (
        <img 
          src={iconName} 
          alt="Circle icon" 
          className="h-4 w-4 object-cover rounded"
        />
      )
    }

    // Check if it's an uploaded image (legacy path format)
    if (iconName?.startsWith('/uploads/')) {
      return (
        <img 
          src={iconName} 
          alt="Circle icon" 
          className="h-4 w-4 object-cover rounded"
        />
      )
    }

    // Otherwise render as lucide icon
    switch (iconName) {
      case 'crown':
        return <Crown className="h-4 w-4" />
      case 'shield':
        return <Shield className="h-4 w-4" />
      case 'star':
        return <Star className="h-4 w-4" />
      case 'graduation-cap':
        return <GraduationCap className="h-4 w-4" />
      case 'building':
        return <Building className="h-4 w-4" />
      case 'message-circle':
        return <MessageCircle className="h-4 w-4" />
      case 'user-plus':
        return <UserPlus className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const handleInvitationResponse = async (invitationId: string, action: 'accept' | 'decline') => {
    setProcessingRequest(invitationId)
    try {
      const response = await fetch(`/api/circles/invitations/${invitationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        // Refresh the invitations
        fetchConnectionRequests()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to process invitation')
      }
    } catch (error) {
      console.error('Error processing invitation:', error)
      alert('Failed to process invitation')
    } finally {
      setProcessingRequest(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connection Requests</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your connection requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="received" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="received">
                Connections ({receivedRequests.filter(r => r.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="circles">
                Circle Requests ({circleInvitations.filter(inv => inv.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="sent">
                Sent ({sentRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="mt-4">
              <div className="space-y-3">
                {receivedRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No connection requests received</p>
                  </div>
                ) : (
                  receivedRequests.map((request) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage 
                                src={request.sender?.profileImageUrl} 
                                alt={`${request.sender?.firstName} ${request.sender?.lastName}`} 
                              />
                              <AvatarFallback>
                                {request.sender?.firstName[0]}{request.sender?.lastName[0]}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">
                                  {request.sender?.firstName} {request.sender?.lastName}
                                </h3>
                                <Badge variant="outline" className={`text-xs ${getRoleColor(request.sender?.role || '')}`}>
                                  {request.sender?.role}
                                </Badge>
                                <Badge variant="outline" className={`text-xs ${getStatusColor(request.status)}`}>
                                  {request.status}
                                </Badge>
                              </div>
                              {request.sender?.bio && (
                                <p className="text-sm text-gray-600">{request.sender.bio}</p>
                              )}
                              {request.message && (
                                <p className="text-sm text-gray-500 italic mt-1">"{request.message}"</p>
                              )}
                            </div>
                          </div>

                          {request.status === 'pending' && (
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRequestResponse(request.id, 'decline')}
                                disabled={processingRequest === request.id}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleRequestResponse(request.id, 'accept')}
                                disabled={processingRequest === request.id}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="circles" className="mt-4">
              <div className="space-y-3">
                {circleInvitations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No circle requests received</p>
                  </div>
                ) : (
                  circleInvitations.map((invitation) => (
                    <Card key={invitation.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {/* Circle Badge */}
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-sm overflow-hidden"
                              style={{ backgroundColor: invitation.circle.color }}
                            >
                              {invitation.circle.icon && (invitation.circle.icon.startsWith('data:image') || invitation.circle.icon.startsWith('/uploads/')) ? (
                                <img
                                  src={invitation.circle.icon}
                                  alt={invitation.circle.name}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                getIconComponent(invitation.circle.icon)
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{invitation.circle.name}</h3>
                                <Badge variant="outline" className={`text-xs ${getStatusColor(invitation.status)}`}>
                                  {invitation.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                from {invitation.inviter.firstName} {invitation.inviter.lastName}
                              </p>
                              {invitation.message && (
                                <p className="text-sm text-gray-500 italic mt-1">"{invitation.message}"</p>
                              )}
                            </div>
                          </div>

                          {invitation.status === 'pending' && (
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleInvitationResponse(invitation.id, 'decline')}
                                disabled={processingRequest === invitation.id}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleInvitationResponse(invitation.id, 'accept')}
                                disabled={processingRequest === invitation.id}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="sent" className="mt-4">
              <div className="space-y-3">
                {sentRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No connection requests sent</p>
                  </div>
                ) : (
                  sentRequests.map((request) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage 
                                src={request.receiver?.profileImageUrl} 
                                alt={`${request.receiver?.firstName} ${request.receiver?.lastName}`} 
                              />
                              <AvatarFallback>
                                {request.receiver?.firstName[0]}{request.receiver?.lastName[0]}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">
                                  {request.receiver?.firstName} {request.receiver?.lastName}
                                </h3>
                                <Badge variant="outline" className={`text-xs ${getRoleColor(request.receiver?.role || '')}`}>
                                  {request.receiver?.role}
                                </Badge>
                                <Badge variant="outline" className={`text-xs ${getStatusColor(request.status)}`}>
                                  {request.status}
                                </Badge>
                              </div>
                              {request.receiver?.bio && (
                                <p className="text-sm text-gray-600">{request.receiver.bio}</p>
                              )}
                              {request.message && (
                                <p className="text-sm text-gray-500 italic mt-1">"{request.message}"</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}