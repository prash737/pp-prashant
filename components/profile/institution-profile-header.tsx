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
  const [events, setEvents] = useState<any[]>([])
  const [quickFactsLoading, setQuickFactsLoading] = useState(true)
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

  // Fetch actual follower count, quick facts, and events
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
      } catch (error) {
        console.error('Error fetching data:', error)
        setFollowerCount(0)
        setQuickFacts(null)
        setEvents([])
      } finally {
        setLoading(false)
        setQuickFactsLoading(false)
        setEventsLoading(false)
      }
    }

    if (institutionData.id) {
      fetchData()
    }
  }, [institutionData.id])

  // Mock circles data
  const academicCommunities = [
    {
      id: 1,
      name: "Computer Science",
      count: 1250,
      image: "/multiple-monitor-coding.png",
      color: "from-blue-400 to-cyan-500",
    },
    {
      id: 2,
      name: "Engineering",
      count: 980,
      image: "/university-laboratory.png",
      color: "from-purple-400 to-indigo-500",
    },
    {
      id: 3,
      name: "Business",
      count: 750,
      image: "/bustling-university-campus.png",
      color: "from-amber-400 to-orange-500",
    },
    {
      id: 4,
      name: "Medicine",
      count: 620,
      image: "/college-library.png",
      color: "from-teal-400 to-emerald-500",
    },
    {
      id: 5,
      name: "Law",
      count: 480,
      image: "/placeholder.svg?key=law-school",
      color: "from-red-400 to-rose-500",
    },
    {
      id: 6,
      name: "Arts",
      count: 350,
      image: "/placeholder.svg?key=arts-department",
      color: "from-green-400 to-emerald-500",
    },
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
                      <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
                        {institution.tagline}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                        {institution.type} • Est. {institution.founded}
                      </p>
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
                    <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none w-full sm:w-auto h-9 px-4 text-sm font-medium">
                      <Users className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none w-full sm:w-auto h-9 px-4 text-sm font-medium">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
                    </Button>
                  </div>

                  {/* Quick Stats - Horizontal display with icons and pastel backgrounds */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs font-medium mt-4">
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-full">
                      <Users className="h-3.5 w-3.5 text-blue-500" data-tooltip="Total students enrolled" />
                      <span data-tooltip="Total students enrolled">
                        {institution.students.toLocaleString()} Students
                      </span>
                      <div className="ml-1.5 flex items-center gap-1 border-l border-blue-200 dark:border-blue-800/30 pl-1.5">
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
                            7,645
                          </span>
                        </div>
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
                            9,292
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 text-purple-600 dark:text-purple-300 px-3 py-1.5 rounded-full">
                      <Users className="h-3.5 w-3.5 text-purple-500" data-tooltip="Faculty members" />
                      <span data-tooltip="Faculty members">Faculty: {institution.faculty.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 text-amber-600 dark:text-amber-300 px-3 py-1.5 rounded-full">
                      <BookOpen className="h-3.5 w-3.5 text-amber-500" data-tooltip="Academic programs offered" />
                      <span data-tooltip="Academic programs offered">Programs: {institution.programs}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 text-teal-600 dark:text-teal-300 px-3 py-1.5 rounded-full">
                      <Award className="h-3.5 w-3.5 text-teal-500" data-tooltip="Global ranking" />
                      <span data-tooltip="Global ranking">Top 5 Globally</span>
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
                        {academicCommunities.map((community) => (
                          <div key={community.id} className="flex flex-col items-center min-w-[72px]">
                            <div className="relative mb-1">
                              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${community.color} p-[3px]`}>
                                <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[2px]">
                                  <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                    <Image
                                      src={community.image || "/placeholder.svg"}
                                      alt={community.name}
                                      width={64}
                                      height={64}
                                      className="object-cover"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-center text-gray-600 dark:text-gray-400 truncate w-full">
                              {community.name}
                            </span>
                            <span className="text-[10px] text-center text-gray-500 dark:text-gray-500 truncate w-full">
                              {community.count} members
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column - Institution highlights */}
                <div className="lg:col-span-2 lg:border-l lg:border-gray-200 lg:dark:border-gray-700 lg:pl-6 mt-6 lg:mt-0">
                  {/* Quick Info section */}
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Quick Info</h3>
                    {quickFactsLoading ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ) : quickFacts ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600 text-xs">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          <span>{institutionData.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-xs">
                          <Globe className="h-3 w-3 text-gray-500" />
                          <span>{institutionData.website}</span>
                        </div>
                        {(quickFacts.campus_size_acres || quickFacts.campus_size_km2) && (
                          <div className="flex items-center gap-2 text-gray-600 text-xs">
                            <Building className="h-3 w-3 text-gray-500" />
                            <span>
                              {quickFacts.campus_size_acres 
                                ? `${quickFacts.campus_size_acres.toLocaleString()} acres campus`
                                : `${quickFacts.campus_size_km2.toLocaleString()} km² campus`}
                            </span>
                          </div>
                        )}
                        {(quickFacts.undergraduate_students || quickFacts.graduate_students) && (
                          <div className="flex items-center gap-2 text-gray-600 text-xs">
                            <Users className="h-3 w-3 text-gray-500" />
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
                          <div className="flex items-center gap-2 text-gray-600 text-xs">
                            <GraduationCap className="h-3 w-3 text-gray-500" />
                            <span>{quickFacts.faculty_members.toLocaleString()} faculty</span>
                          </div>
                        )}
                        {institutionData.founded && (
                          <div className="flex items-center gap-2 text-gray-600 text-xs">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span>Established {institutionData.founded}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-xs">Not added yet</p>
                    )}
                  </div>

                  {/* Events section */}
                  <div className="mt-3">
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Events</h3>
                    {eventsLoading ? (
                      <div className="bg-sky-50 dark:bg-sky-900/20 p-2 rounded-lg flex items-center gap-3">
                        <div className="bg-gray-200 dark:bg-gray-700 h-8 w-8 rounded-full animate-pulse"></div>
                        <div className="space-y-1">
                          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ) : events.length > 0 ? (
                      <div className="space-y-2">
                        {events.map((event, index) => (
                          <div key={event.id || index} className="bg-sky-50 dark:bg-sky-900/20 p-2 rounded-lg flex items-center gap-3">
                            <div className="bg-blue-100 dark:bg-blue-900/40 h-8 w-8 rounded-full flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="text-xs font-medium">{event.title}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(event.startDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-xs">Not added yet</p>
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
    </>
  )
}