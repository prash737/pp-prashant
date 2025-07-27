
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import InstitutionProfile from "@/components/profile/institution-profile"
import InternalNavbar from "@/components/internal-navbar"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InstitutionData {
  id: string
  name: string
  type: string
  category?: string
  location: string
  bio: string
  logo: string
  coverImage: string
  website: string
  verified: boolean
  founded?: number | null
  tagline: string
  gallery?: Array<{
    id: string
    url: string
    caption?: string
  }>
}

export default function PublicViewInstitutionProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { user: currentUser, loading: authLoading } = useAuth()
  const [institutionData, setInstitutionData] = useState<InstitutionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const router = useRouter()

  // Resolve params first
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setProfileId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (authLoading || !profileId) return

    if (!currentUser) {
      router.push('/login')
      return
    }

    // Prevent viewing your own profile through public view (for institution users)
    if (profileId === currentUser.id && currentUser.role === 'institution') {
      router.push('/institution/profile')
      return
    }

    // Fetch institution data for the profile being viewed
    const fetchInstitutionData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/institution/public-profile/${profileId}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          if (response.status === 404) {
            setError('Institution profile not found')
          } else if (response.status === 403) {
            setError('Access denied')
          } else {
            setError('Failed to load institution profile')
          }
          return
        }

        const data = await response.json()
        setInstitutionData(data)
      } catch (err) {
        console.error('Error fetching institution data:', err)
        setError('Failed to load institution profile')
      } finally {
        setLoading(false)
      }
    }

    fetchInstitutionData()
  }, [profileId, currentUser, authLoading, router])

  const handleGoBack = () => {
    router.back()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <InternalNavbar />

        <main className="flex-grow flex items-center justify-center pt-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
            <p className="mt-4 text-gray-600">Loading institution profile...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <InternalNavbar />

        <main className="flex-grow flex items-center justify-center pt-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={handleGoBack}
              className="bg-pathpiper-teal text-white hover:bg-pathpiper-teal/90 mr-2"
            >
              Go Back
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <InternalNavbar />
      
      {/* Profile content */}
      <main className="flex-grow">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 ml-4 mt-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {institutionData && (
          <InstitutionProfile
            institutionData={institutionData}
            institutionId={profileId!}
            isViewMode={true}
          />
        )}
      </main>
    </div>
  )
}
