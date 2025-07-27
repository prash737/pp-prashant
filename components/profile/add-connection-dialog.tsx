"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Search, Users, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useCustomToast } from "@/hooks/use-custom-toast"

interface User {
  id: string
  firstName: string
  lastName: string
  role: string
  profileImageUrl?: string
  bio?: string
  location?: string
}

interface AddConnectionDialogProps {
  onConnectionRequestSent?: () => void
}

export default function AddConnectionDialog({ onConnectionRequestSent }: AddConnectionDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [sendingRequest, setSendingRequest] = useState<string | null>(null)
  const { user } = useAuth()
    const [connections, setConnections] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const { connectionToast } = useCustomToast()

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/connections", {
        credentials: "include",
      });
      if (response.ok) {
        const connectionsData = await response.json();
        setConnections(connectionsData);
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch("/api/connections/requests?type=sent", {
        credentials: "include",
      });
      if (response.ok) {
        const requestsData = await response.json();
        setPendingRequests(requestsData);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setSearchLoading(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const users = await response.json()
        setSearchResults(users)
        setShowResults(true)
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const getConnectionStatus = (userId: string) => {
    // Check if already connected
    const isConnected = connections.some(conn => conn.user.id === userId);
    if (isConnected) return 'connected';

    // Check if request is pending
    const isPending = pendingRequests.some(req => req.receiverId === userId);
    if (isPending) return 'pending';

    return 'none';
  };

  const sendConnectionRequest = async (receiverId: string) => {
    setSendingRequest(receiverId)
    try {
      const response = await fetch('/api/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId,
          message: `Hi! I'd like to connect with you on PathPiper.`,
        }),
      })

      if (response.ok) {
        // Add to pending requests instead of removing from search
        setPendingRequests(prev => [...prev, { receiverId, status: 'pending' }]);
        onConnectionRequestSent?.()
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
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

    useEffect(() => {
    fetchConnections();
    fetchPendingRequests();
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'mentor': return 'bg-green-100 text-green-800'
      case 'institution': return 'bg-purple-100 text-purple-800'
      case 'student': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Connection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Add New Connection</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for people to connect with..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm text-gray-500">Searching...</span>
              </div>
            )}

            {!loading && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No users found matching "{searchQuery}"</p>
              </div>
            )}

            {searchResults.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  if (user.role === 'student') {
                    window.open(`/public-view/student/profile/${user.id}`, '_blank');
                  } else if (user.role === 'institution') {
                    window.open(`/public-view/institution/profile/${user.id}`, '_blank');
                  }
                }}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback>
                    {user.firstName[0]}{user.lastName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-sm">
                      {user.firstName} {user.lastName}
                    </h4>
                    <Badge variant="outline" className={`text-xs ${getRoleColor(user.role)}`}>
                      {user.role}
                    </Badge>
                  </div>
                  {user.bio && (
                    <p className="text-xs text-gray-600 truncate">{user.bio}</p>
                  )}
                  {user.location && (
                    <p className="text-xs text-gray-500">{user.location}</p>
                  )}
                </div>

                {getConnectionStatus(user.id) === 'connected' ? (
                  <Button variant="secondary" disabled>Connected</Button>
                ) : getConnectionStatus(user.id) === 'pending' ? (
                  <Button variant="secondary" disabled>Pending</Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      sendConnectionRequest(user.id);
                    }}
                    disabled={sendingRequest === user.id}
                    className="shrink-0"
                  >
                    {sendingRequest === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Connect
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {searchQuery.length < 2 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Type at least 2 characters to search for users</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}