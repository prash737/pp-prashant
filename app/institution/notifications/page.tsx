
"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import InstitutionNavbar from "@/components/institution-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "@/app/protected-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Users, GraduationCap, MessageCircle, Calendar, CheckCircle, X } from "lucide-react"
import { toast } from "sonner"

interface VerificationRequest {
  id: string
  studentName: string
  studentId: string
  degreeProgram: string
  fieldOfStudy: string
  subjects: string[]
  startDate: string
  endDate: string
  isCurrent: boolean
  gradeLevel: string
  description: string
  createdAt: string
}

export default function InstitutionNotificationsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
        return
      }

      if (user.role !== 'institution') {
        router.push('/feed')
        return
      }

      fetchNotifications()
    }
  }, [user, authLoading, router])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/education/verification', {
        method: 'GET',
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setVerificationRequests(data.verificationRequests || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingRequest(requestId)
      const response = await fetch('/api/education/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          educationId: requestId,
          action: action === 'approve' ? 'verify' : 'reject'
        })
      })

      if (response.ok) {
        toast.success(`Request ${action}d successfully`)
        fetchNotifications() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(error.error || `Failed to ${action} request`)
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error)
      toast.error(`Failed to ${action} request`)
    } finally {
      setProcessingRequest(null)
    }
  }

  if (authLoading || loading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <InstitutionNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notifications...</p>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedLayout>
    )
  }

  if (!user || user.role !== 'institution') {
    return null
  }

  const pendingRequests = verificationRequests // API already filters to pending requests

  return (
    <ProtectedLayout>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <InstitutionNavbar />
        <main className="flex-grow pt-16 sm:pt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="h-8 w-8 text-pathpiper-teal" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                {pendingRequests.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingRequests.length} pending
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Manage verification requests and stay updated with important notifications
              </p>
            </div>

            {/* Verification Requests Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-pathpiper-teal" />
                      Education Verification Requests
                    </CardTitle>
                    {pendingRequests.length > 0 && (
                      <Badge variant="secondary">
                        {pendingRequests.length} pending
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        All caught up!
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        No pending verification requests at the moment.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <div
                          key={request.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {request.studentName}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Program: {request.degreeProgram || 'Not specified'}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Field of Study: {request.fieldOfStudy || 'Not specified'}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Grade Level: {request.gradeLevel || 'Not specified'}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Duration: {request.startDate ? new Date(request.startDate).toLocaleDateString() : 'Not specified'} - {request.isCurrent ? 'Current' : (request.endDate ? new Date(request.endDate).toLocaleDateString() : 'Not specified')}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                Requested {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerificationAction(request.id, 'reject')}
                                disabled={processingRequest === request.id}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleVerificationAction(request.id, 'approve')}
                                disabled={processingRequest === request.id}
                                className="bg-pathpiper-teal hover:bg-pathpiper-teal/90"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Other Notification Types (Placeholder for future features) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-pathpiper-teal" />
                    Connection Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No new connection requests
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-pathpiper-teal" />
                    Event Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No recent event updates
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}
