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
  overview?: string
  mission?: string
  coreValues?: string[]
  gallery?: Array<{
    id: string
    url: string
    caption?: string
  }>
  programs?: any[]
  faculty?: any[]
  facilities?: any[]
  events?: any[]
  followers?: number
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

    // Fetch comprehensive institution data using the same approach as institution profile page
    const fetchInstitutionData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🏛️ Fetching comprehensive institution data for public view:', profileId)

        // Fetch all data in parallel using the same approach as institution profile page
        const [
          profileResponse,
          programsResponse,
          facultyResponse,
          facilitiesResponse,
          eventsResponse,
          galleryResponse,
          followersResponse
        ] = await Promise.all([
          fetch(`/api/institution/public-profile/${profileId}`, { credentials: 'include' }),
          fetch(`/api/institution/programs?institutionId=${profileId}`, { credentials: 'include' }),
          fetch(`/api/institution/faculty?institutionId=${profileId}`, { credentials: 'include' }),
          fetch(`/api/institution/facilities?institutionId=${profileId}`, { credentials: 'include' }),
          fetch(`/api/institution/events?institutionId=${profileId}`, { credentials: 'include' }),
          fetch(`/api/institution/gallery?institutionId=${profileId}`, { credentials: 'include' }),
          fetch(`/api/institutions/followers?institutionId=${profileId}`, { credentials: 'include' })
        ])

        if (!profileResponse.ok) {
          if (profileResponse.status === 404) {
            setError('Institution profile not found')
          } else if (profileResponse.status === 403) {
            setError('Access denied')
          } else {
            setError('Failed to load institution profile')
          }
          return
        }

        // Parse all responses
        const [
          profileData,
          programsData,
          facultyData,
          facilitiesData,
          eventsData,
          galleryData,
          followersData
        ] = await Promise.all([
          profileResponse.json(),
          programsResponse.ok ? programsResponse.json() : { programs: [] },
          facultyResponse.ok ? facultyResponse.json() : { faculty: [] },
          facilitiesResponse.ok ? facilitiesResponse.json() : { facilities: [] },
          eventsResponse.ok ? eventsResponse.json() : { events: [] },
          galleryResponse.ok ? galleryResponse.json() : { gallery: [] },
          followersResponse.ok ? followersResponse.json() : { followers: [] }
        ])

        // Combine all data into comprehensive institution object
        const comprehensiveInstitutionData: InstitutionData = {
          id: profileData.id,
          name: profileData.name,
          type: profileData.type,
          category: profileData.category,
          location: profileData.location,
          bio: profileData.bio || '',
          logo: profileData.logo || '/images/pathpiper-logo.png',
          coverImage: profileData.coverImage || '/university-classroom.png',
          website: profileData.website || '',
          verified: profileData.verified || false,
          founded: profileData.founded,
          tagline: profileData.tagline || '',
          overview: profileData.overview || '',
          mission: profileData.mission || '',
          coreValues: profileData.coreValues || [],
          gallery: galleryData.images && Array.isArray(galleryData.images) ? galleryData.images : 
                   galleryData.gallery && Array.isArray(galleryData.gallery) ? galleryData.gallery :
                   Array.isArray(galleryData) ? galleryData :
                   Array.isArray(profileData.gallery) ? profileData.gallery : [],
          programs: programsData.programs || [],
          faculty: facultyData.faculty || [],
          facilities: facilitiesData.facilities || [],
          events: eventsData.events || [],
          followers: followersData?.followers?.length || 0
        }

        console.log('✅ Comprehensive institution data loaded for public view:', {
          name: comprehensiveInstitutionData.name,
          programs: comprehensiveInstitutionData.programs?.length || 0,
          faculty: comprehensiveInstitutionData.faculty?.length || 0,
          facilities: comprehensiveInstitutionData.facilities?.length || 0,
          events: comprehensiveInstitutionData.events?.length || 0,
          gallery: comprehensiveInstitutionData.gallery?.length || 0,
          followers: comprehensiveInstitutionData.followers
        })

        setInstitutionData(comprehensiveInstitutionData)
      } catch (err) {
        console.error('Error fetching comprehensive institution data:', err)
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
          <>
            {/* Profile Header with Gallery Collage */}
            <div className="relative">
              <div className="container mx-auto px-4 max-w-7xl">
                {/* Dynamic gallery collage or fallback */}
                <div className="h-64 w-full relative overflow-hidden">
                  {/* Only show gallery collage if we have actual gallery images, not cover image */}
                  {institutionData.gallery && Array.isArray(institutionData.gallery) && institutionData.gallery.length >= 3 ? (
                    // 3+ images: Large image on left, two smaller on right
                    <div className="flex h-full gap-1">
                      <div className="flex-[2] relative">
                        <img
                          src={institutionData.gallery[0].url || institutionData.gallery[0].imageUrl}
                          alt="Institution gallery image 1"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex-1 relative">
                          <img
                            src={institutionData.gallery[1].url || institutionData.gallery[1].imageUrl}
                            alt="Institution gallery image 2"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 relative">
                          <img
                            src={institutionData.gallery[2].url || institutionData.gallery[2].imageUrl}
                            alt="Institution gallery image 3"
                            className="w-full h-full object-cover"
                          />
                          {institutionData.gallery.length > 3 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white font-semibold text-lg">
                                +{institutionData.gallery.length - 3} more
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : institutionData.gallery && Array.isArray(institutionData.gallery) && institutionData.gallery.length === 2 ? (
                    // 2 images: Side by side
                    <div className="flex h-full gap-1">
                      <div className="flex-1 relative">
                        <img
                          src={institutionData.gallery[0].url || institutionData.gallery[0].imageUrl}
                          alt="Institution gallery image 1"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 relative">
                        <img
                          src={institutionData.gallery[1].url || institutionData.gallery[1].imageUrl}
                          alt="Institution gallery image 2"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ) : institutionData.gallery && Array.isArray(institutionData.gallery) && institutionData.gallery.length === 1 ? (
                    // 1 image: Single image
                    <div className="w-full h-full relative">
                      <img
                        src={institutionData.gallery[0].url || institutionData.gallery[0].imageUrl}
                        alt="Institution gallery image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : institutionData.coverImage ? (
                    // Cover image fallback only when no gallery images exist
                    <div 
                      className="w-full h-full bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage: `url(${institutionData.coverImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    ></div>
                  ) : (
                    // Blue gradient fallback
                    <div className="w-full h-full bg-gradient-to-r from-blue-600 to-blue-800"></div>
                  )}

                  {/* View all photos button - only show if we have gallery images */}
                  {institutionData.gallery && Array.isArray(institutionData.gallery) && institutionData.gallery.length > 0 && (
                    <div className="absolute top-4 right-4">
                      <button 
                        onClick={() => {
                          const gallerySection = document.getElementById('gallery');
                          if (gallerySection) {
                            gallerySection.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="bg-white bg-opacity-90 hover:bg-opacity-100 text-black px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 transition-all"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="9" cy="9" r="2"/>
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                        View all photos ({institutionData.gallery.length})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <InstitutionProfile
              institutionData={institutionData}
              institutionId={profileId!}
              isViewMode={true}
            />
          </>
        )}
      </main>
    </div>
  )
}