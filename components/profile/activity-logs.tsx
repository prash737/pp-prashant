
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar,
  Send, 
  Inbox, 
  Users, 
  Crown,
  Shield,
  Star,
  GraduationCap,
  Building,
  MessageCircle,
  UserPlus,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react"
import { format } from "date-fns"

interface User {
  id: string
  firstName: string
  lastName: string
  profileImageUrl?: string
  role: string
}

interface Circle {
  id: string
  name: string
  color: string
  icon: string
}

interface ConnectionRequest {
  id: string
  status: string
  message?: string
  createdAt: string
  sender?: User
  receiver?: User
}

interface CircleInvitation {
  id: string
  status: string
  message?: string
  createdAt: string
  inviter?: User
  invitee?: User
  circle: Circle
}

interface ActivityLogsData {
  connectionRequests: {
    sent: ConnectionRequest[]
    received: ConnectionRequest[]
  }
  circleInvitations: {
    sent: CircleInvitation[]
    received: CircleInvitation[]
  }
}

interface ActivityLogsProps {
  childId: string
}

export default function ActivityLogs({ childId }: ActivityLogsProps) {
  const [data, setData] = useState<ActivityLogsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDays, setSelectedDays] = useState("7")

  const fetchActivityLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/parent/child-profile/${childId}/activity-logs?days=${selectedDays}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivityLogs()
  }, [childId, selectedDays])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'declined': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const getIconComponent = (iconName: string) => {
    if (iconName?.startsWith('data:image') || iconName?.startsWith('/uploads/')) {
      return (
        <img 
          src={iconName} 
          alt="Circle icon" 
          className="h-4 w-4 object-cover rounded"
        />
      )
    }

    switch (iconName) {
      case 'crown': return <Crown className="h-4 w-4" />
      case 'shield': return <Shield className="h-4 w-4" />
      case 'star': return <Star className="h-4 w-4" />
      case 'graduation-cap': return <GraduationCap className="h-4 w-4" />
      case 'building': return <Building className="h-4 w-4" />
      case 'message-circle': return <MessageCircle className="h-4 w-4" />
      case 'user-plus': return <UserPlus className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-500">Loading activity logs...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Activity Logs</CardTitle>
          <p className="text-sm text-gray-600">Connection requests and circle invitations</p>
        </div>
        <Select value={selectedDays} onValueChange={setSelectedDays}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">Last 2 days</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="10">Last 10 days</SelectItem>
            <SelectItem value="9999">All time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connections" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connections">
              Connection Requests ({(data?.connectionRequests.sent.length || 0) + (data?.connectionRequests.received.length || 0)})
            </TabsTrigger>
            <TabsTrigger value="circles">
              Circle Invitations ({(data?.circleInvitations.sent.length || 0) + (data?.circleInvitations.received.length || 0)})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="mt-4">
            <div className="space-y-6">
              {/* Sent Connection Requests */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowUpRight className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Sent Requests ({data?.connectionRequests.sent.length || 0})</h4>
                </div>
                {data?.connectionRequests.sent && data.connectionRequests.sent.length > 0 ? (
                  <div className="space-y-3">
                    {data.connectionRequests.sent.map((request) => (
                      <div key={request.id} className="border rounded-lg p-3 bg-blue-50/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={request.receiver?.profileImageUrl} />
                              <AvatarFallback>
                                {getInitials(request.receiver?.firstName || '', request.receiver?.lastName || '')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h5 className="font-medium">
                                  {request.receiver?.firstName} {request.receiver?.lastName}
                                </h5>
                                <Badge variant="outline" className={`text-xs ${getRoleColor(request.receiver?.role || '')}`}>
                                  {request.receiver?.role}
                                </Badge>
                              </div>
                              {request.message && (
                                <p className="text-sm text-gray-600 italic mt-1">"{request.message}"</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                              {request.status}
                            </Badge>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No connection requests sent</p>
                )}
              </div>

              {/* Received Connection Requests */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowDownLeft className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium text-gray-900">Received Requests ({data?.connectionRequests.received.length || 0})</h4>
                </div>
                {data?.connectionRequests.received && data.connectionRequests.received.length > 0 ? (
                  <div className="space-y-3">
                    {data.connectionRequests.received.map((request) => (
                      <div key={request.id} className="border rounded-lg p-3 bg-green-50/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={request.sender?.profileImageUrl} />
                              <AvatarFallback>
                                {getInitials(request.sender?.firstName || '', request.sender?.lastName || '')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h5 className="font-medium">
                                  {request.sender?.firstName} {request.sender?.lastName}
                                </h5>
                                <Badge variant="outline" className={`text-xs ${getRoleColor(request.sender?.role || '')}`}>
                                  {request.sender?.role}
                                </Badge>
                              </div>
                              {request.message && (
                                <p className="text-sm text-gray-600 italic mt-1">"{request.message}"</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                              {request.status}
                            </Badge>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No connection requests received</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="circles" className="mt-4">
            <div className="space-y-6">
              {/* Sent Circle Invitations */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowUpRight className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Sent Invitations ({data?.circleInvitations.sent.length || 0})</h4>
                </div>
                {data?.circleInvitations.sent && data.circleInvitations.sent.length > 0 ? (
                  <div className="space-y-3">
                    {data.circleInvitations.sent.map((invitation) => (
                      <div key={invitation.id} className="border rounded-lg p-3 bg-blue-50/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={invitation.invitee?.profileImageUrl} />
                              <AvatarFallback>
                                {getInitials(invitation.invitee?.firstName || '', invitation.invitee?.lastName || '')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h5 className="font-medium">
                                  {invitation.invitee?.firstName} {invitation.invitee?.lastName}
                                </h5>
                                <Badge variant="outline" className={`text-xs ${getRoleColor(invitation.invitee?.role || '')}`}>
                                  {invitation.invitee?.role}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <div 
                                  className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                                  style={{ backgroundColor: invitation.circle.color }}
                                >
                                  <div className="scale-50">
                                    {getIconComponent(invitation.circle.icon)}
                                  </div>
                                </div>
                                <span className="text-sm text-gray-600">to {invitation.circle.name}</span>
                              </div>
                              {invitation.message && (
                                <p className="text-sm text-gray-600 italic mt-1">"{invitation.message}"</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs ${getStatusColor(invitation.status)}`}>
                              {invitation.status}
                            </Badge>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(invitation.createdAt), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No circle invitations sent</p>
                )}
              </div>

              {/* Received Circle Invitations */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowDownLeft className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium text-gray-900">Received Invitations ({data?.circleInvitations.received.length || 0})</h4>
                </div>
                {data?.circleInvitations.received && data.circleInvitations.received.length > 0 ? (
                  <div className="space-y-3">
                    {data.circleInvitations.received.map((invitation) => (
                      <div key={invitation.id} className="border rounded-lg p-3 bg-green-50/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={invitation.inviter?.profileImageUrl} />
                              <AvatarFallback>
                                {getInitials(invitation.inviter?.firstName || '', invitation.inviter?.lastName || '')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h5 className="font-medium">
                                  {invitation.inviter?.firstName} {invitation.inviter?.lastName}
                                </h5>
                                <Badge variant="outline" className={`text-xs ${getRoleColor(invitation.inviter?.role || '')}`}>
                                  {invitation.inviter?.role}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <div 
                                  className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                                  style={{ backgroundColor: invitation.circle.color }}
                                >
                                  <div className="scale-50">
                                    {getIconComponent(invitation.circle.icon)}
                                  </div>
                                </div>
                                <span className="text-sm text-gray-600">to {invitation.circle.name}</span>
                              </div>
                              {invitation.message && (
                                <p className="text-sm text-gray-600 italic mt-1">"{invitation.message}"</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs ${getStatusColor(invitation.status)}`}>
                              {invitation.status}
                            </Badge>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(invitation.createdAt), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No circle invitations received</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
