
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "@/app/protected-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, User, Calendar, BookOpen, Loader2 } from "lucide-react"
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

export default function VerificationRequestsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

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

      fetchVerificationRequests()
    }
  }, [user, authLoading, router])

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/education/verification', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setVerificationRequests(data.verificationRequests || [])
      } else {
        console.error('Failed to fetch verification requests')
        toast.error('Failed to load verification requests')
      }
    } catch (error) {
      console.error('Error fetching verification requests:', error)
      toast.error('Failed to load verification requests')
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (educationId: string, action: 'verify' | 'reject') => {
    setProcessingIds(prev => new Set(prev).add(educationId))
    
    try {
      const response = await fetch('/api/education/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          educationId,
          action
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Education record ${action === 'verify' ? 'verified' : 'rejected'} successfully!`)
        
        // Remove the processed request from the list
        setVerificationRequests(prev => prev.filter(req => req.id !== educationId))
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || `Failed to ${action} education record`)
      }
    } catch (error) {
      console.error(`Error ${action}ing education record:`, error)
      toast.error(`Failed to ${action} education record`)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(educationId)
        return newSet
      })
    }
  }

  if (authLoading || loading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <InternalNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Education Verification Requests
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Review and verify student education claims for your institution
              </p>
            </div>

            {verificationRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No pending verification requests
                  </h3>
                  <p className="text-gray-500">
                    When students claim to have studied at your institution, their requests will appear here for verification.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {verificationRequests.map((request) => (
                  <Card key={request.id} className="border-l-4 border-l-pathpiper-teal">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {request.studentName}
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(request.startDate).toLocaleDateString()} - {
                                request.isCurrent ? 'Present' : new Date(request.endDate).toLocaleDateString()
                              }
                            </div>
                            <Badge variant="outline">
                              {request.isCurrent ? 'Current Student' : 'Former Student'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleVerification(request.id, 'verify')}
                            disabled={processingIds.has(request.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {processingIds.has(request.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Verify
                          </Button>
                          <Button
                            onClick={() => handleVerification(request.id, 'reject')}
                            disabled={processingIds.has(request.id)}
                            variant="destructive"
                          >
                            {processingIds.has(request.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {request.degreeProgram && (
                          <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Degree/Program
                            </label>
                            <p className="text-gray-900 dark:text-white">{request.degreeProgram}</p>
                          </div>
                        )}
                        {request.fieldOfStudy && (
                          <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Field of Study
                            </label>
                            <p className="text-gray-900 dark:text-white">{request.fieldOfStudy}</p>
                          </div>
                        )}
                        {request.gradeLevel && (
                          <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Grade/Level
                            </label>
                            <p className="text-gray-900 dark:text-white">{request.gradeLevel}</p>
                          </div>
                        )}
                        {request.subjects && request.subjects.length > 0 && (
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              Subjects
                            </label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {request.subjects.map((subject, index) => (
                                <Badge key={index} variant="secondary">
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {request.description && (
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Description
                            </label>
                            <p className="text-gray-900 dark:text-white">{request.description}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}
