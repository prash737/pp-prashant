"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, UserPlus, Mail, Plus, X, Send, Loader2, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

interface Circle {
  id: string
  name: string
  color: string
  icon: string
  memberships: Array<{
    user: {
      id: string
      firstName: string
      lastName: string
      profileImageUrl?: string
      role: string
    }
  }>
  _count: {
    memberships: number
  }
  creator?: {
    id: string
    firstName: string
    lastName: string
    profileImageUrl?: string
  }
}

interface Connection {
  id: string
  user: {
    id: string
    firstName: string
    lastName: string
    profileImageUrl?: string
    role: string
  }
}

interface ExistingInvitation {
  id: string
  inviteeId: string
  status: 'pending' | 'accepted' | 'declined'
}

interface CircleManagementDialogProps {
  circle: Circle | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCircleUpdated: () => void
  isViewMode?: boolean // Add isViewMode prop
}

export default function CircleManagementDialog({
  circle,
  open,
  onOpenChange,
  onCircleUpdated,
  isViewMode = false // Default to false if not provided
}: CircleManagementDialogProps) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedConnections, setSelectedConnections] = useState<string[]>([])
  const [inviteMessage, setInviteMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingInvitations, setExistingInvitations] = useState<ExistingInvitation[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (open && circle) {
      fetchConnections()
    }
  }, [open, circle])

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/connections', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()

        // For Friends circle, show all connections and no invite functionality
        if (circle?.id === 'friends') {
          setConnections(data)
          setExistingInvitations([])
          return
        }

        // For custom circles, show all connections (we'll handle status display in UI)
        setConnections(data)

        // Fetch existing invitations for this circle
        if (circle?.id) {
          await fetchExistingInvitations()
        }
      }
    } catch (error) {
      console.error('Error fetching connections:', error)
    }
  }

  const fetchExistingInvitations = async () => {
    try {
      const response = await fetch(`/api/circles/invitations?type=sent&circleId=${circle?.id}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const invitations = await response.json()
        setExistingInvitations(invitations)
      }
    } catch (error) {
      console.error('Error fetching existing invitations:', error)
    }
  }

  const handleSendInvitations = async () => {
    if (!circle || selectedConnections.length === 0) return

    setLoading(true)
    try {
      const promises = selectedConnections.map(connectionId =>
        fetch('/api/circles/invitations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            circleId: circle.id,
            inviteeId: connectionId,
            message: inviteMessage.trim() || `Join my "${circle.name}" circle!`
          })
        })
      )

      const responses = await Promise.all(promises)

      // Check if all requests were successful
      const allSuccessful = responses.every(response => response.ok)

      if (allSuccessful) {
        setSelectedConnections([])
        setInviteMessage('')
        await fetchExistingInvitations() // Refresh invitations list
        onCircleUpdated()
        onOpenChange(false)
      } else {
        console.error('Some invitations failed to send')
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error('Error sending invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInvitationStatus = (userId: string) => {
    return existingInvitations.find(inv => inv.inviteeId === userId)?.status || null
  }

  const isAlreadyMember = (userId: string) => {
    if (!circle) return false

    // Check if user is the creator
    if (circle.creator?.id === userId) return true

    // Check if user is in memberships
    return circle.memberships?.some(membership => membership.user.id === userId) || false
  }

  const toggleConnection = (connectionId: string) => {
    // Don't allow selection if there's already an invitation or if they're already a member
    const status = getInvitationStatus(connectionId)
    const isMember = isAlreadyMember(connectionId)

    if ((status && status !== 'declined') || isMember) return

    setSelectedConnections(prev =>
      prev.includes(connectionId)
        ? prev.filter(id => id !== connectionId)
        : [...prev, connectionId]
    )
  }

  const getStatusDisplay = (userId: string) => {
    if (isAlreadyMember(userId)) {
      return { text: 'Already Member', variant: 'secondary' as const }
    }

    const invitationStatus = getInvitationStatus(userId)
    if (invitationStatus === 'pending') {
      return { text: 'Request Pending', variant: 'outline' as const }
    }
    if (invitationStatus === 'accepted') {
      return { text: 'Accepted', variant: 'default' as const }
    }

    return null
  }

  // Filter connections based on search query
  const filteredConnections = connections.filter(connection => {
    const fullName = `${connection.user.firstName} ${connection.user.lastName}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  if (!circle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: circle.color }}
            >
              {circle.icon && circle.icon.startsWith('/uploads/') ? (
                <img
                  src={circle.icon}
                  alt={circle.name}
                  className="w-full h-full object-cover"
                />
              ) : circle.icon === 'users' ? (
                <Users className="h-4 w-4 text-white" />
              ) : (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            {circle.id === 'friends' ? 'All Connections' : `Invite to ${circle.name}`}
          </DialogTitle>
          {circle.description && circle.id !== 'friends' && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {circle.description}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Current members summary */}
          <div>
            <h4 className="text-sm font-medium mb-2">
              {circle.id === 'friends' ? 'All Connections' : 'Current Members'} ({(circle._count?.memberships || 0) + (circle.creator ? 1 : 0)})
            </h4>
            <div className="flex flex-wrap gap-2">
              {/* Show creator first for custom circles */}
              {circle.id !== 'friends' && circle.creator && (
                <div className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={circle.creator.profileImageUrl} />
                    <AvatarFallback className="text-xs">
                      {circle.creator.firstName?.[0]}{circle.creator.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-16">
                    {circle.creator.firstName} 
                  </span>
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    Creator
                  </Badge>
                </div>
              )}

              {/* Show other members */}
              {circle.memberships?.slice(0, circle.id === 'friends' ? 8 : 5).map((membership) => (
                <div key={membership.user.id} className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={membership.user.profileImageUrl} />
                    <AvatarFallback className="text-xs">
                      {membership.user.firstName[0]}{membership.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-16">
                    {membership.user.firstName}
                  </span>
                </div>
              ))}

              {(circle.memberships?.length || 0) > (circle.id === 'friends' ? 8 : 5) && (
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1">
                  +{(circle.memberships?.length || 0) - (circle.id === 'friends' ? 8 : 5)} more
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* Search Bar */}
          {circle.id !== 'friends' && !isViewMode && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                placeholder={circle.id === 'friends' ? "Search connections..." : "Search connections to invite..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Connections list - Only for custom circles */}
          {circle.id !== 'friends' && !isViewMode && (
            <div>
              <h4 className="text-sm font-medium mb-3">
                All Connections ({filteredConnections.length})
              </h4>
              <div className="max-h-60 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredConnections.length === 0 ? (
                    <p className="text-sm text-gray-500 col-span-2">
                      {searchQuery ? 'No connections found matching your search' : 'No connections available'}
                    </p>
                  ) : (
                    filteredConnections.map((connection) => {
                      const statusDisplay = getStatusDisplay(connection.user.id)
                      const canInvite = !statusDisplay

                      return (
                        <div 
                          key={connection.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                            canInvite 
                              ? selectedConnections.includes(connection.user.id)
                                ? 'bg-blue-50 border-blue-200 cursor-pointer'
                                : 'hover:bg-gray-50 cursor-pointer border-gray-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                          onClick={() => canInvite && toggleConnection(connection.user.id)}
                        >
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={connection.user.profileImageUrl} />
                            <AvatarFallback className="text-xs">
                              {connection.user.firstName[0]}{connection.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {connection.user.firstName} {connection.user.lastName}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {connection.user.role}
                            </Badge>
                          </div>

                          <div className="flex-shrink-0">
                            {statusDisplay ? (
                              <Badge variant={statusDisplay.variant} className="text-xs">
                                {statusDisplay.text}
                              </Badge>
                            ) : selectedConnections.includes(connection.user.id) ? (
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            ) : (
                              <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Show filtered connections for Friends circle */}
          {circle.id === 'friends' && (
            <div>
              <h4 className="text-sm font-medium mb-3">
                All Connections ({filteredConnections.length + 1})
              </h4>
              <div className="max-h-60 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Show current user first */}
                  {circle.creator && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={circle.creator.profileImageUrl} />
                        <AvatarFallback className="text-xs">
                          {circle.creator.firstName[0]}{circle.creator.lastName[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {circle.creator.firstName} {circle.creator.lastName}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            student
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            You
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {filteredConnections.length === 0 ? (
                    <p className="text-sm text-gray-500 col-span-2">
                      {searchQuery ? 'No connections found matching your search' : 'No connections available'}
                    </p>
                  ) : (
                    filteredConnections.map((connection) => (
                      <div 
                        key={connection.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50"
                      >
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={connection.user.profileImageUrl} />
                          <AvatarFallback className="text-xs">
                            {connection.user.firstName[0]}{connection.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {connection.user.firstName} {connection.user.lastName}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {connection.user.role}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Invitation message - Only for custom circles */}
          {circle.id !== 'friends' && selectedConnections.length > 0 && !isViewMode && (
            <div>
              <label className="text-sm font-medium mb-2 block">Invitation Message</label>
              <Input
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder={`Join my "${circle.name}" circle!`}
                maxLength={200}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Close
            </Button>
            {circle.id !== 'friends' && !isViewMode && (
              <Button 
                onClick={handleSendInvitations}
                disabled={selectedConnections.length === 0 || loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Invites ({selectedConnections.length})
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}