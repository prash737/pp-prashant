
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import { useAuth } from "@/hooks/use-auth"
import { 
  Bell, 
  MessageCircle, 
  UserPlus, 
  Calendar, 
  Award, 
  Clock,
  Sparkles,
  ArrowRight,
  Inbox,
  Settings,
  CheckCircle,
  Circle,
  Trash2
} from "lucide-react"

interface Notification {
  id: string
  type: 'connection' | 'achievement' | 'message' | 'institution' | 'circle'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  avatar?: string
  badge?: string
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    // Simulate loading notifications
    setTimeout(() => {
      setNotifications([
        {
          id: '1',
          type: 'connection',
          title: 'Dr. Sarah Rodriguez',
          message: 'Accepted your connection request. Start building your mentorship relationship!',
          timestamp: '2 hours ago',
          isRead: false,
          avatar: '/placeholder-user.jpg',
          badge: 'New Connection'
        },
        {
          id: '2',
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: 'Congratulations! You\'ve completed your first coding challenge.',
          timestamp: '1 day ago',
          isRead: false,
          badge: 'Milestone'
        },
        {
          id: '3',
          type: 'institution',
          title: 'MIT OpenCourseWare',
          message: 'New course available: "Introduction to Machine Learning"',
          timestamp: '3 days ago',
          isRead: true,
          avatar: '/placeholder-user.jpg',
          badge: 'Institution'
        },
        {
          id: '4',
          type: 'circle',
          title: 'Study Group - AI Enthusiasts',
          message: 'You\'ve been invited to join a new study circle focused on AI and machine learning.',
          timestamp: '5 days ago',
          isRead: true,
          badge: 'Circle Invitation'
        },
        {
          id: '5',
          type: 'message',
          title: 'Alex Chen',
          message: 'Sent you a message about the upcoming hackathon project.',
          timestamp: '1 week ago',
          isRead: true,
          avatar: '/placeholder-user.jpg',
          badge: 'Message'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })))
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notif.isRead
    return notif.type === filter
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection': return <UserPlus className="w-5 h-5 text-blue-600" />
      case 'achievement': return <Award className="w-5 h-5 text-yellow-600" />
      case 'message': return <MessageCircle className="w-5 h-5 text-green-600" />
      case 'institution': return <Sparkles className="w-5 h-5 text-purple-600" />
      case 'circle': return <Inbox className="w-5 h-5 text-indigo-600" />
      default: return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <InternalNavbar />
        <div className="pt-16 pb-16 sm:pt-24 sm:pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InternalNavbar />

      <div className="pt-16 pb-16 sm:pt-24 sm:pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <Bell className="w-8 h-8 text-blue-600" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount} new
                    </Badge>
                  )}
                </h1>
                <p className="text-gray-600">Stay updated with your learning journey</p>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button onClick={markAllAsRead} variant="outline" size="sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark all as read
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 border-b overflow-x-auto">
            {[
              { key: 'all', label: 'All', icon: Inbox },
              { key: 'unread', label: 'Unread', icon: Circle },
              { key: 'connection', label: 'Connections', icon: UserPlus },
              { key: 'achievement', label: 'Achievements', icon: Award },
              { key: 'message', label: 'Messages', icon: MessageCircle },
              { key: 'institution', label: 'Institutions', icon: Sparkles }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant="ghost"
                className={`whitespace-nowrap ${
                  filter === key 
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setFilter(key)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
                {key === 'unread' && unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                  </h3>
                  <p className="text-gray-500">
                    {filter === 'unread' 
                      ? 'You\'re all caught up!' 
                      : 'We\'ll notify you when something important happens.'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card key={notification.id} className={`transition-all hover:shadow-md ${
                  !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {notification.avatar ? (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={notification.avatar} />
                          <AvatarFallback>
                            {notification.title.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{notification.title}</p>
                            {notification.badge && (
                              <Badge variant="secondary">{notification.badge}</Badge>
                            )}
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{notification.timestamp}</span>
                            <div className="flex space-x-1">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {filteredNotifications.length > 0 && (
            <div className="mt-8 text-center">
              <Button variant="outline">
                Load more notifications
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
