"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
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
  Settings
} from "lucide-react"

export default function NotificationsPage() {
  const [notifyMe, setNotifyMe] = useState(false)

  const handleNotifyClick = () => {
    setNotifyMe(true)
    // You could add actual notification logic here
    setTimeout(() => setNotifyMe(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InternalNavbar />

      {/* Coming Soon Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 p-8 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-pink-500/20 animate-pulse"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                <Bell className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Notifications & Messages</h2>
              <div className="flex items-center justify-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Coming Soon</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Stay Connected Like Never Before!
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                We're building a comprehensive notification and messaging system that will keep you 
                updated on everything important - from mentor connections and achievement milestones 
                to circle invitations and institutional updates. Real-time communication is coming!
              </p>

              {/* Feature Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-medium text-blue-900 mb-1">Smart Notifications</h4>
                  <p className="text-sm text-blue-700">Real-time alerts & updates</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-medium text-purple-900 mb-1">Direct Messaging</h4>
                  <p className="text-sm text-purple-700">Chat with mentors & peers</p>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <UserPlus className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-medium text-pink-900 mb-1">Connection Updates</h4>
                  <p className="text-sm text-pink-700">New connections & requests</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-medium text-indigo-900 mb-1">Custom Preferences</h4>
                  <p className="text-sm text-indigo-700">Personalized notification settings</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleNotifyClick}
                disabled={notifyMe}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  notifyMe
                    ? 'bg-green-500 text-white cursor-default'
                    : 'bg-gradient-to-r from-blue-600 to-pink-500 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                }`}
              >
                {notifyMe ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Notification Set!
                  </>
                ) : (
                  <>
                    <Bell className="w-5 h-5" />
                    Notify Me When Ready
                  </>
                )}
              </button>

              <button
                onClick={() => window.location.href = '/feed'}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Go to Feed Instead
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Development Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-pink-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">60% Complete • Launching Soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Original content (blurred in background) */}
      <div className="filter blur-sm pointer-events-none pt-16 pb-16 sm:pt-24 sm:pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                <p className="text-gray-600">Stay updated with your learning journey</p>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            <Button variant="ghost" className="border-b-2 border-blue-500 text-blue-600">
              <Inbox className="w-4 h-4 mr-2" />
              All
            </Button>
            <Button variant="ghost">
              <MessageCircle className="w-4 h-4 mr-2" />
              Messages
            </Button>
            <Button variant="ghost">
              <UserPlus className="w-4 h-4 mr-2" />
              Connections
            </Button>
            <Button variant="ghost">
              <Award className="w-4 h-4 mr-2" />
              Achievements
            </Button>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {/* Sample notifications */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>DR</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">Dr. Sarah Rodriguez</p>
                        <Badge variant="secondary">New Connection</Badge>
                      </div>
                      <span className="text-sm text-gray-500">2 hours ago</span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      Accepted your connection request. Start building your mentorship relationship!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">Achievement Unlocked!</p>
                        <Badge variant="secondary">Milestone</Badge>
                      </div>
                      <span className="text-sm text-gray-500">1 day ago</span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      Congratulations! You've completed your first coding challenge.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>MIT</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">MIT OpenCourseWare</p>
                        <Badge variant="secondary">Institution</Badge>
                      </div>
                      <span className="text-sm text-gray-500">3 days ago</span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      New course available: "Introduction to Machine Learning"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}