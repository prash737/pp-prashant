"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface FollowingInstitution {
  id: string
  institutionName: string
  institutionType: string
  institutionCategory: string
  website?: string
  logoUrl?: string
  coverImageUrl?: string
  verified: boolean
  bio?: string
  location?: string
  followedAt: string
}

interface FollowingInstitutionsProps {
  userId?: string
  followingInstitutions?: any[]
}

export default function FollowingInstitutions({ userId, followingInstitutions: propInstitutions }: FollowingInstitutionsProps) {
  const [institutions, setInstitutions] = useState<FollowingInstitution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isParentContext, setIsParentContext] = useState(false)

  useEffect(() => {
    // If institutions are provided via props, use them directly
    if (propInstitutions !== undefined) {
      setInstitutions(propInstitutions)
      setLoading(false)
      return
    }

    const fetchFollowingInstitutions = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if we're in parent context by looking at the current URL
        const parentContext = window.location.pathname.includes('/parent/child-profile/')
        setIsParentContext(parentContext)
        const apiEndpoint = parentContext 
          ? `/api/parent/child-profile/${userId}/following`
          : '/api/student/following'

        const response = await fetch(apiEndpoint, {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Failed to fetch following institutions')
        }

        const data = await response.json()

        if (data.success) {
          setInstitutions(data.following)
        } else {
          setError(data.error || 'Failed to load institutions')
        }
      } catch (err) {
        console.error('Error fetching following institutions:', err)
        setError('Failed to load institutions')
      } finally {
        setLoading(false)
      }
    }

    fetchFollowingInstitutions()
  }, [userId, propInstitutions]) // Depend on propInstitutions as well

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isParentContext ? "Child's Following" : "Following"}
          </h2>
          <Badge variant="secondary" className="animate-pulse px-3 py-1.5 text-sm font-medium">Loading...</Badge>
        </div>
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex-shrink-0 w-80 animate-pulse bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isParentContext ? "Child's Following" : "Following"}
          </h2>
          <Badge variant="destructive" className="px-3 py-1.5 text-sm font-medium">Error</Badge>
        </div>
        <div className="text-center py-16">
          <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 h-10"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (institutions.length === 0) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isParentContext ? "Child's Following" : "Following"}
          </h2>
          <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">0 institutions</Badge>
        </div>
        <div className="text-center py-16">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {isParentContext ? "No institutions followed yet" : "No institutions followed yet"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {isParentContext 
              ? "Your child hasn't followed any institutions yet." 
              : "Start following institutions to stay updated with their latest news and opportunities."
            }
          </p>
          <Button variant="outline" className="px-6 py-2 h-10">
            Explore Institutions
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isParentContext ? "Child's Following" : "Following"}
        </h2>
        <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
          {institutions.length} institution{institutions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {institutions.map((institution) => (
          <Card 
            key={institution.id} 
            className="flex-shrink-0 w-64 hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            {/* Cover Image */}
            <div className="h-32 bg-gradient-to-r from-pathpiper-teal to-blue-500 rounded-t-lg overflow-hidden">
              {institution.coverImageUrl ? (
                <img 
                  src={institution.coverImageUrl} 
                  alt={`${institution.institutionName} cover`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-pathpiper-teal to-blue-500" />
              )}
            </div>

            <CardContent className="p-4">
              <div className="text-center">
                {/* Institution Name */}
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 truncate">
                  {institution.institutionName}
                </h3>

                {/* Following Date */}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Following since {(() => {
                    try {
                      const date = new Date(institution.followedAt);
                      if (isNaN(date.getTime())) {
                        return 'recently';
                      }
                      return formatDistanceToNow(date, { addSuffix: true });
                    } catch (error) {
                      return 'recently';
                    }
                  })()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}