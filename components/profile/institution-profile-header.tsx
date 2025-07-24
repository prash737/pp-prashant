"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  MapPin, 
  ExternalLink, 
  Users, 
  BookOpen, 
  Award, 
  Calendar,
  Verified,
  Building,
  GraduationCap,
  Settings,
  Edit,
  Globe,
  BadgeCheck
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import FollowersDialog from "./followers-dialog"
import CreateAcademicCommunityDialog from "./create-academic-community-dialog"
import AcademicCommunityDialog from "./academic-community-dialog"

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
}

interface InstitutionProfileHeaderProps {
  institutionData: InstitutionData & {
    gallery?: Array<{
      id: string
      url: string
      caption?: string
    }>
  }
}

export default function InstitutionProfileHeader({ institutionData }: InstitutionProfileHeaderProps) {
  const [showFollowersDialog, setShowFollowersDialog] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [quickFacts, setQuickFacts] = useState<any>(null)
  const [contactInfo, setContactInfo] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [quickFactsLoading, setQuickFactsLoading] = useState(true)
  const [contactInfoLoading, setContactInfoLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(true)

  // Use real institution data
  const institution = {
    name: institutionData.name,
    tagline: institutionData.tagline,
    location: institutionData.location,
    website: institutionData.website,
    founded: institutionData.founded || new Date().getFullYear() - 50, // Default if not provided
    type: institutionData.type,
    students: 16500, // Default values - these could be added to database schema
    faculty: 1200,
    programs: 195,
    bannerColor: "from-blue-600 to-blue-800",
    profileImage: institutionData.logo,
    verified: institutionData.verified,
    specialties: ["Computer Science", "Engineering", "Business", "Medicine", "Law"], // Default - could be dynamic
    followers: followerCount, // Use actual count from API
  }

  // Fetch academic communities
  const fetchAcademicCommunities = async () => {
    setCommunitiesLoading(true)
    try {
      const response = await fetch('/api/institution/academic-communities', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setAcademicCommunities(data.communities || [])
      }
    } catch (error) {
      console.error('Error fetching academic communities:', error)
      setAcademicCommunities([])
    } finally {
      setCommunitiesLoading(false)
    }
  }

  // Fetch actual follower count, quick facts, events, and academic communities
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch follower count
        setLoading(true)
        const followerResponse = await fetch(`/api/institutions/followers?institutionId=${institutionData.id}`, {
          credentials: 'include'
        })

        if (followerResponse.ok) {
          const followerData = await followerResponse.json()
          if (followerData.success) {
            setFollowerCount(followerData.count || 0)
          }
        }

        // Fetch quick facts
        setQuickFactsLoading(true)
        const quickFactsResponse = await fetch('/api/institution/quick-facts', {
          credentials: 'include'
        })

        if (quickFactsResponse.ok) {
          const quickFactsData = await quickFactsResponse.json()
          setQuickFacts(quickFactsData.quickFacts)
        }

        // Fetch contact info
        setContactInfoLoading(true)
        const contactInfoResponse = await fetch('/api/institution/contact-info', {
          credentials: 'include'
        })

        if (contactInfoResponse.ok) {
          const contactInfoData = await contactInfoResponse.json()
          setContactInfo(contactInfoData.contactInfo)
        }

        // Fetch events
        setEventsLoading(true)
        const eventsResponse = await fetch('/api/institution/events', {
          credentials: 'include'
        })

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          if (eventsData.success && eventsData.events) {
            // Sort by start date and take top 5 most recent
            const sortedEvents = eventsData.events
              .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
              .slice(0, 5)
            setEvents(sortedEvents)
          }
        }

        // Fetch academic communities
        await fetchAcademicCommunities()
      } catch (error) {
        console.error('Error fetching data:', error)
        setFollowerCount(0)
        setQuickFacts(null)
        setContactInfo(null)
        setEvents([])
        setAcademicCommunities([])
      } finally {
        setLoading(false)
        setQuickFactsLoading(false)
        setContactInfoLoading(false)
        setEventsLoading(false)
      }
    }

    if (institutionData.id) {
      fetchData()
    }
  }, [institutionData.id])

  // Real academic communities state
  const [academicCommunities, setAcademicCommunities] = useState<any[]>([])
  const [communitiesLoading, setCommunitiesLoading] = useState(true)
  const [showCreateCommunityDialog, setShowCreateCommunityDialog] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null)
  const [showCommunityDialog, setShowCommunityDialog] = useState(false)

  // Color options for communities (same as circles)
  const colorOptions = [
    { name: 'Blue', value: '#3B82F6', gradient: 'from-blue-400 to-cyan-500' },
    { name: 'Purple', value: '#8B5CF6', gradient: 'from-purple-400 to-indigo-500' },
    { name: 'Green', value: '#10B981', gradient: 'from-green-400 to-emerald-500' },
    { name: 'Orange', value: '#F59E0B', gradient: 'from-amber-400 to-orange-500' },
    { name: 'Red', value: '#EF4444', gradient: 'from-red-400 to-rose-500' },
    { name: 'Teal', value: '#14B8A6', gradient: 'from-teal-400 to-emerald-500' }
  ]

  // Custom tooltip styles
  const scrollbarHideStyle = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  /* Custom tooltip styles */
  [data-tooltip] {
    position: relative;
    cursor: pointer;
  }

  [data-tooltip]:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
    white-space: nowrap;
    z-index: 10;
    pointer-events: none;
    margin-bottom: 4px;
  }
  `

  return (
    <>
      <style jsx>{scrollbarHideStyle}</style>
      <div className="relative">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Dynamic gallery collage or fallback */}
          <div className="h-64 w-full relative overflow-hidden">
            {institutionData.gallery && institutionData.gallery.length >= 3 ? (
              // 3+ images: Large image on left, two smaller on right
              <div className="flex h-full gap-1">
                <div className="flex-[2] relative">
                  <Image
                    src={institutionData.gallery[0].url}
                    alt="Institution gallery image 1"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex-1 relative">
                    <Image
                      src={institutionData.gallery[1].url}
                      alt="Institution gallery image 2"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <Image
                      src={institutionData.gallery[2].url}
                      alt="Institution gallery image 3"
                      fill
                      className="object-cover"
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
            ) : institutionData.gallery && institutionData.gallery.length === 2 ? (
              // 2 images: Side by side
              <div className="flex h-full gap-1">
                <div className="flex-1 relative">
                  <Image
                    src={institutionData.gallery[0].url}
                    alt="Institution gallery image 1"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 relative">
                  <Image
                    src={institutionData.gallery[1].url}
                    alt="Institution gallery image 2"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ) : institutionData.gallery && institutionData.gallery.length === 1 ? (
              // 1 image: Single image
              <div className="w-full h-full relative">
                <Image
                  src={institutionData.gallery[0].url}
                  alt="Institution gallery image"
                  fill
                  className="object-cover"
                />
              </div>
            ) : institutionData.coverImage ? (
              // Cover image fallback
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
              <div className={`w-full h-full bg-gradient-to-r ${institution.bannerColor}`}></div>
            )}

            {/* View all photos button */}
            {institutionData.gallery && institutionData.gallery.length > 0 && (
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
                  View all photos
                </button>
              </div>
            )}
          </div>

          <div className="relative mb-6">
            {/* Profile info - With profile pic inside */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left column - Profile details with profile pic */}
                <div className="lg:col-span-3">
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    {/* Profile image */}
                    <div className="relative z-10 flex-shrink-0 self-center sm:self-start">
                      <div className="rounded-full border-4 border-white dark:border-gray-800 overflow-hidden h-24 w-24 sm:h-28 sm:w-28 shadow-md bg-white flex items-center justify-center">
                        <Image
                          src={institutionData.logo || "/images/pathpiper-logo.png"}
                          alt={`${institutionData.name} Logo`}
                          width={112}
                          height={112}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>

                    {/* Name and tagline */}
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{institution.name}</h1>
                        {institution.verified && <BadgeCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 self-center" />}
                      </div>
                      {institution.tagline && (
                        <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
                          {institution.tagline}
                        </p>
                      )}
                      
                    </div>
                  </div>

                  {/* Action buttons - Connect, Visit Website, Share */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6">
                    <Link href="/institution/profile/edit" className="flex-1 sm:flex-none">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto h-9 px-4 text-sm font-medium">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                    
                    {contactInfo?.website ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 sm:flex-none w-full sm:w-auto h-9 px-4 text-sm font-medium"
                        onClick={() => window.open(contactInfo.website, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 sm:flex-none w-full sm:w-auto h-9 px-4 text-sm font-medium opacity-50 cursor-not-allowed"
                        disabled
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </Button>
                    )}
                  </div>

                  {/* Quick Stats - Horizontal display with icons and pastel backgrounds */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs font-medium mt-4">
                    {/* Students Badge - Dynamic from quickFacts */}
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-full">
                      <Users className="h-3.5 w-3.5 text-blue-500" data-tooltip="Total students enrolled" />
                      <span data-tooltip="Total students enrolled">
                        {quickFactsLoading ? 'Loading...' : 
                         quickFacts && (quickFacts.undergraduate_students || quickFacts.graduate_students) ?
                         `${((quickFacts.undergraduate_students || 0) + (quickFacts.graduate_students || 0)).toLocaleString()} Students` :
                         'No info'}
                      </span>
                      {quickFacts && (quickFacts.undergraduate_students || quickFacts.graduate_students) && (
                        <div className="ml-1.5 flex items-center gap-1 border-l border-blue-200 dark:border-blue-800/30 pl-1.5">
                          {quickFacts.undergraduate_students && (
                            <div className="flex items-center" data-tooltip="Undergraduate students">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-3 w-3 text-blue-500"
                                data-tooltip="Undergraduate"
                              >
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                              </svg>
                              <span className="text-[10px] ml-0.5" data-tooltip="Undergraduate students">
                                {quickFacts.undergraduate_students.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {quickFacts.graduate_students && (
                            <div className="flex items-center" data-tooltip="Graduate students">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-3 w-3 text-blue-500"
                                data-tooltip="Graduate"
                              >
                                <path d="M8 14v7H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h4"></path>
                                <path d="M16 14v7h4a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-4"></path>
                                <path d="M12 14v7"></path>
                                <path d="M12 4v10"></path>
                                <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"></path>
                              </svg>
                              <span className="text-[10px] ml-0.5" data-tooltip="Graduate students">
                                {quickFacts.graduate_students.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Faculty Badge - Dynamic from quickFacts */}
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 text-purple-600 dark:text-purple-300 px-3 py-1.5 rounded-full">
                      <Users className="h-3.5 w-3.5 text-purple-500" data-tooltip="Faculty members" />
                      <span data-tooltip="Faculty members">
                        Faculty: {quickFactsLoading ? 'Loading...' : 
                                 quickFacts?.faculty_members ? 
                                 quickFacts.faculty_members.toLocaleString() : 
                                 'No info'}
                      </span>
                    </div>

                    {/* Followers Count - Clickable */}
                    <button
                      onClick={() => setShowFollowersDialog(true)}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 text-rose-600 dark:text-rose-300 px-3 py-1.5 rounded-full hover:bg-gradient-to-r hover:from-rose-100 hover:to-pink-100 dark:hover:from-rose-900/30 dark:hover:to-pink-900/30 transition-all cursor-pointer"
                      data-tooltip="View followers"
                    >
                      <Users className="h-3.5 w-3.5 text-rose-500" />
                      <span>
                        {loading ? 'Loading...' : `${followerCount.toLocaleString()} Followers`}
                      </span>
                    </button>
                  </div>

                  {/* Academic Communities - Instagram-style story highlights with horizontal scroll */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Academic Communities</h3>
                    </div>

                    <div className="relative">
                      <div className="flex overflow-x-auto pb-2 hide-scrollbar gap-4">
                        {/* Add Community Button */}
                        <div className="flex flex-col items-center min-w-[72px]">
                          <button
                            onClick={() => setShowCreateCommunityDialog(true)}
                            className="relative mb-1 group"
                          >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 p-[3px] group-hover:from-gray-300 group-hover:to-gray-400 dark:group-hover:from-gray-500 dark:group-hover:to-gray-600 transition-all">
                              <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[2px]">
                                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                  <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                                  >
                                    <path
                                      d="M12 5V19M5 12H19"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </button>
                          <span className="text-xs text-center text-gray-600 dark:text-gray-400 truncate w-full">
                            Add
                          </span>
                          <span className="text-[10px] text-center text-gray-500 dark:text-gray-500 truncate w-full">
                            Community
                          </span>
                        </div>

                        {communitiesLoading ? (
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500">Loading communities...</span>
                          </div>
                        ) : (
                          academicCommunities.map((community) => {
                            const memberCount = community.academic_communities_memberships?.[0]?.count || 1
                            const colorOption = colorOptions.find(c => c.value === community.color) || colorOptions[0]

                            return (
                              <div key={community.id} className="flex flex-col items-center min-w-[72px]">
                                <button
                                  onClick={() => {
                                    setSelectedCommunity(community)
                                    setShowCommunityDialog(true)
                                  }}
                                  className="relative mb-1 group"
                                >
                                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${colorOption.gradient} p-[3px] group-hover:scale-105 transition-transform`}>
                                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[2px]">
                                      <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                        {community.image_url ? (
                                          <Image
                                            src={community.image_url}
                                            alt={community.name}
                                            width={64}
                                            height={64}
                                            className="object-cover w-full h-full"
                                          />
                                        ) : (
                                          <Building className="h-6 w-6 text-gray-400" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </button>
                                <span className="text-xs text-center text-gray-600 dark:text-gray-400 truncate w-full">
                                  {community.name}
                                </span>
                                <span className="text-[10px] text-center text-gray-500 dark:text-gray-500 truncate w-full">
                                  {memberCount} members
                                </span>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column - Institution highlights */}
                <div className="lg:col-span-2 lg:border-l lg:border-gray-200 lg:dark:border-gray-700 lg:pl-6 mt-6 lg:mt-0">
                  {/* Quick Info section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Info</h3>
                    {quickFactsLoading ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-600">
                          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ) : quickFacts || contactInfo ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-base">
                          <MapPin className="h-5 w-5 text-gray-500" />
                          <span>
                            {contactInfo && (contactInfo.city || contactInfo.state || contactInfo.country) ? (
                              [contactInfo.city, contactInfo.state, contactInfo.country]
                                .filter(Boolean)
                                .join(', ')
                            ) : (
                              institutionData.location || 'Location not specified'
                            )}
                          </span>
                        </div>
                        {institutionData.website && (
                          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-base">
                            <Globe className="h-5 w-5 text-gray-500" />
                            <span>{institutionData.website}</span>
                          </div>
                        )}
                        {(quickFacts.campus_size_acres || quickFacts.campus_size_km2) && (
                          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-base">
                            <Building className="h-5 w-5 text-gray-500" />
                            <span>
                              {quickFacts.campus_size_acres 
                                ? `${quickFacts.campus_size_acres.toLocaleString()} acres campus`
                                : `${quickFacts.campus_size_km2.toLocaleString()} km² campus`}
                            </span>
                          </div>
                        )}
                        {(quickFacts.undergraduate_students || quickFacts.graduate_students) && (
                          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-base">
                            <Users className="h-5 w-5 text-gray-500" />
                            <span>
                              {quickFacts.undergraduate_students && quickFacts.graduate_students 
                                ? `${(quickFacts.undergraduate_students + quickFacts.graduate_students).toLocaleString()} students`
                                : quickFacts.undergraduate_students 
                                  ? `${quickFacts.undergraduate_students.toLocaleString()} students`
                                  : `${quickFacts.graduate_students.toLocaleString()} students`}
                            </span>
                          </div>
                        )}
                        {quickFacts.faculty_members && (
                          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-base">
                            <GraduationCap className="h-5 w-5 text-gray-500" />
                            <span>{quickFacts.faculty_members.toLocaleString()} faculty</span>
                          </div>
                        )}
                        {institutionData.founded && (
                          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-base">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <span>Established {institutionData.founded}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-base">Not added yet</p>
                    )}
                  </div>

                  {/* Events section */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Events</h3>
                    {eventsLoading ? (
                      <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg flex items-center gap-3">
                        <div className="bg-gray-200 dark:bg-gray-700 h-12 w-12 rounded-full animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ) : events && Array.isArray(events) && events.length > 0 ? (
                      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <div className="flex space-x-3 pb-2" style={{ minWidth: 'max-content' }}>
                          {events.map((event: any) => (
                            <div key={event.id} className="flex-shrink-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
                              {(event.imageUrl || event.image_url) && (
                                <div className="w-full h-24 mb-2 rounded-md overflow-hidden">
                                  <img 
                                    src={event.imageUrl || event.image_url} 
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="space-y-1">
                                <div className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">{event.title}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {new Date(event.startDate || event.start_date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                                {(event.eventType || event.event_type) && (
                                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                    {event.eventType || event.event_type}
                                  </div>
                                )}
                                {event.location && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    📍 {event.location}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No events added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Followers Dialog */}
      <FollowersDialog
        institutionId={institutionData.id}
        institutionName={institutionData.name}
        isOpen={showFollowersDialog}
        onClose={() => setShowFollowersDialog(false)}
        followerCount={followerCount}
      />

      {/* Create Academic Community Dialog */}
      <CreateAcademicCommunityDialog
        open={showCreateCommunityDialog}
        onOpenChange={setShowCreateCommunityDialog}
        onCommunityCreated={fetchAcademicCommunities}
      />

      {/* Academic Community Management Dialog */}
      <AcademicCommunityDialog
        community={selectedCommunity}
        open={showCommunityDialog}
        onOpenChange={setShowCommunityDialog}
        onCommunityUpdated={fetchAcademicCommunities}
      />
    </>
  )
}