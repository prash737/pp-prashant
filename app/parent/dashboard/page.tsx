"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { LogOut, User, Calendar, GraduationCap, MapPin } from "lucide-react"
import PipLoader from '@/components/loading/pip-loader'

interface ChildProfile {
  id: string
  firstName: string
  lastName: string
  profileImageUrl?: string
  bio?: string
  location?: string
  parentVerified?: boolean
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [parentName, setParentName] = useState("")
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchParentData = async () => {
      try {
        setLoading(true)

        const childrenResponse = await fetch('/api/parent/children', {
          credentials: 'include'
        })

        if (!childrenResponse.ok) {
          if (childrenResponse.status === 401) {
            // Clear any stale local storage and redirect to login
            try {
              localStorage.removeItem('parent_session')
              localStorage.removeItem('parent_id')
              sessionStorage.removeItem('parent_session')
              sessionStorage.removeItem('parent_id')
            } catch (error) {
              console.error('Error clearing storage:', error)
            }
            router.push('/parent/login')
            return
          }
          throw new Error('Failed to fetch children')
        }

        const childrenData = await childrenResponse.json()
        setChildren(childrenData.children || [])
        setParentName(childrenData.parentName || 'Parent')

      } catch (error) {
        console.error('Error fetching parent data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchParentData()
  }, [router])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/parent/logout', {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        // Clear all client-side storage if indicated by server
        if (data.clearStorage) {
          try {
            // Clear localStorage
            localStorage.clear()

            // Clear sessionStorage
            sessionStorage.clear()

            // Clear IndexedDB if it exists
            if ('indexedDB' in window) {
              indexedDB.databases?.().then(databases => {
                databases.forEach(db => {
                  if (db.name) {
                    indexedDB.deleteDatabase(db.name)
                  }
                })
              }).catch(() => {
                // Ignore errors when clearing IndexedDB
              })
            }

            // Clear any parent-specific storage
            const parentKeys = [
              'parent_session',
              'parent_id',
              'parent-auth-token',
              'parent_access_token',
              'parent_refresh_token'
            ]

            parentKeys.forEach(key => {
              localStorage.removeItem(key)
              sessionStorage.removeItem(key)
            })

            console.log('✅ All parent storage cleared')
          } catch (error) {
            console.error('Error clearing storage:', error)
          }
        }

        router.push('/login')
      } else {
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleApproveAccount = async (childId: string) => {
    try {
      const response = await fetch('/api/parent/approve-child', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ childId })
      })

      if (!response.ok) {
        throw new Error('Failed to approve account')
      }

      // Update the local state to reflect the change
      setChildren(prevChildren => 
        prevChildren.map(child => 
          child.id === childId 
            ? { ...child, parentVerified: true }
            : child
        )
      )

      toast.success('Account approved successfully!')
    } catch (error) {
      console.error('Error approving account:', error)
      toast.error('Failed to approve account')
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getAgeFromBirth = (birthMonth?: string, birthYear?: string) => {
    if (!birthMonth || !birthYear) return null

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    const birthYearNum = parseInt(birthYear)
    const birthMonthNum = parseInt(birthMonth)

    let age = currentYear - birthYearNum
    if (currentMonth < birthMonthNum) {
      age--
    }

    return age
  }

  const formatEducationLevel = (level?: string) => {
    if (!level) return null
    return level.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatAgeGroup = (ageGroup?: string) => {
    if (!ageGroup) return null
    return ageGroup.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <header className="w-full py-4 px-6 flex justify-between items-center bg-white border-b border-slate-200">
          <Link href="/" className="h-10">
            <Image
              src="/images/pathpiper-logo-full.png"
              width={180}
              height={40}
              alt="PathPiper Logo"
              className="h-full w-auto"
            />
          </Link>
        </header>
        <main className="flex-grow flex items-center justify-center">
          <PipLoader />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center bg-white border-b border-slate-200">
        <Link href="/" className="h-10">
          <Image
            src="/images/pathpiper-logo-full.png"
            width={180}
            height={40}
            alt="PathPiper Logo"
            className="h-full w-auto"
          />
        </Link>
        <div className="flex items-center space-x-4">
          <span className="text-gray-700 font-medium">Welcome, {parentName}</span>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Parent Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and support your children's educational journey
            </p>
          </div>

          {children.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Children Found</h3>
                <p className="text-gray-600 mb-6">
                  No children are currently linked to your account. Children will appear here once they sign up with your email as their parent.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <Card key={child.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={child.profileImageUrl} alt={`${child.firstName} ${child.lastName}`} />
                        <AvatarFallback className="bg-gradient-to-r from-teal-400 to-blue-500 text-white text-lg font-semibold">
                          {getInitials(child.firstName, child.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">
                          {child.firstName} {child.lastName}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {child.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {child.bio}
                      </p>
                    )}

                    <div className="space-y-2">
                      {child.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {child.location}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t space-y-4">
                      {child.parentVerified === false && (
                        <Button 
                          onClick={() => handleApproveAccount(child.id)}
                          className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 font-medium"
                        >
                          Approve Account
                        </Button>
                      )}
                      {child.parentVerified === true && (
                        <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg text-center text-sm text-green-700 font-medium">
                          ✅ Account Approved
                        </div>
                      )}

                      <div className="pt-2">
                        <Link href={`/parent/child-profile/${child.id}`}>
                          <Button 
                            className="w-full bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white py-2.5 font-medium"
                          >
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-6 bg-white border-t border-slate-200">
        <div className="container mx-auto flex justify-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} PathPiper. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}