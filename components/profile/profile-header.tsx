"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, Plus, Users, MessageSquare, Share2, Calendar, MapPin, Briefcase, GraduationCap, Mail, Phone, Globe, Instagram, Twitter, Linkedin, Github, Youtube, Facebook, UserPlus, BadgeCheck, Edit, MessageCircle, UserIcon, FolderKanban, Award, BrainIcon, UserCheck, UserX } from "lucide-react"
import { getDefaultIcon, getDefaultIconData } from "@/lib/achievement-icons"
import { format } from "date-fns"
import CircleManagementDialog from "./circle-management-dialog"

interface ProfileHeaderProps {
  student: any
  currentUser?: any
  connectionCounts?: {
    total: number
    students: number
    mentors: number
    institutions: number
  }
  isViewMode?: boolean
}

interface Achievement {
  id: number
  name: string
  description: string
  dateOfAchievement: string
  createdAt: string
  achievementImageIcon?: string
}

export default function ProfileHeader({ student, currentUser, connectionCounts, isViewMode = false }: ProfileHeaderProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [actualConnectionCounts, setActualConnectionCounts] = useState(connectionCounts)
  const [circles, setCircles] = useState<any[]>([])
  const [showCreateCircle, setShowCreateCircle] = useState(false)
  const [newCircleName, setNewCircleName] = useState('')
  const [newCircleColor, setNewCircleColor] = useState('#3B82F6')
  const [newCircleDescription, setNewCircleDescription] = useState('')
  const [newCircleImageFile, setNewCircleImageFile] = useState<File | null>(null)
  const [newCircleImageUrl, setNewCircleImageUrl] = useState('')
  const [selectedCircle, setSelectedCircle] = useState<any>(null)
  const [showCircleManagement, setShowCircleManagement] = useState(false)
  const [connections, setConnections] = useState<any[]>([])

  // Use passed student data or fallback to mock data
  const studentProp = student || {
    id: "",
    profile: {
      firstName: "Alex",
      lastName: "Johnson", 
      profileImageUrl: "/images/student-profile.png",
    },
    educationHistory: [
      {
        gradeLevel: "11th Grade",
        institutionName: "Westlake High School",
        isCurrent: true
      }
    ],
    projects: [],
    customBadges: [],
    skills: []
  }

  const displayName = studentProp.profile ? `${studentProp.profile.firstName} ${studentProp.profile.lastName}` : "Student"
  const currentEducation = studentProp.educationHistory?.find((edu: any) => edu.is_current || edu.isCurrent)
  const gradeLevel = currentEducation?.gradeLevel || currentEducation?.grade_level || "Student"
  const schoolName = currentEducation?.institutionName || currentEducation?.institution_name || "School"
  const profileImage = studentProp.profile?.profileImageUrl || "/images/student-profile.png"
  // Fix tagline access - check multiple possible locations
  const tagline = studentProp.profile?.tagline || studentProp.tagline || studentProp.profile?.bio || "Passionate learner exploring new horizons"

  // Check if this is the current user's own profile
  const isOwnProfile = currentUser && currentUser.id === studentProp.id

  // Initialize and fetch connection counts
  React.useEffect(() => {
    if (isOwnProfile) {
      // For own profile, use the passed connectionCounts if available
      if (connectionCounts) {
        setActualConnectionCounts(connectionCounts)
      } else {
        // If no connectionCounts passed, fetch for current user
        const fetchOwnConnectionCounts = async () => {
          try {
            const response = await fetch(`/api/connections`, {
              credentials: 'include'
            })
            if (response.ok) {
              const connections = await response.json()

              const counts = {
                total: connections.length,
                students: connections.filter((conn: any) => conn.user.role === 'student').length,
                mentors: connections.filter((conn: any) => conn.user.role === 'mentor').length,
                institutions: connections.filter((conn: any) => conn.user.role === 'institution').length
              }

              setActualConnectionCounts(counts)
            }
          } catch (error) {
            console.error('Error fetching own connection counts:', error)
          }
        }
        fetchOwnConnectionCounts()
      }
    } else {
      // For viewing someone else's profile, always fetch their connection counts
      const fetchViewedUserConnectionCounts = async () => {
        try {
          const response = await fetch(`/api/connections?userId=${studentProp.id}`, {
            credentials: 'include'
          })
          if (response.ok) {
            const connections = await response.json()

            // Count connections by role
            const counts = {
              total: connections.length,
              students: connections.filter((conn: any) => conn.user.role === 'student').length,
              mentors: connections.filter((conn: any) => conn.user.role === 'mentor').length,
              institutions: connections.filter((conn: any) => conn.user.role === 'institution').length
            }

            setActualConnectionCounts(counts)
          }
        } catch (error) {
          console.error('Error fetching connection counts for viewed user:', error)
        }
      }

      if (studentProp.id) {
        fetchViewedUserConnectionCounts()
      }
    }
  }, [isOwnProfile, studentProp.id, connectionCounts])

  // State for recent achievements
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([])
  const [achievementLoading, setAchievementLoading] = useState(true)
  const [followingCount, setFollowingCount] = useState(0)

  // Fetch user's circles, connections, and achievements
  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const response = await fetch('/api/circles', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setCircles(data)
        } else {
          console.error('Error fetching circles:', response.status)
        }
      } catch (error) {
        console.error('Error fetching circles:', error)
      }
    }

    const fetchConnections = async () => {
      try {
        const response = await fetch('/api/connections', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setConnections(data)
        }
      } catch (error) {
        console.error('Error fetching connections:', error)
      }
    }

    const fetchRecentAchievements = async () => {
      try {
        const response = await fetch('/api/achievements', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          // Get the recent achievements (they're already sorted by date desc in the API)
          if (data.achievements && data.achievements.length > 0) {
            setRecentAchievements(data.achievements)
          }
        }
      } catch (error) {
        console.error('Error fetching achievements:', error)
      } finally {
        setAchievementLoading(false)
      }
    }

    const fetchFollowingCount = async () => {
      try {
        const response = await fetch('/api/student/following', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setFollowingCount(data.count || 0)
          }
        }
      } catch (error) {
        console.error('Error fetching following count:', error)
      }
    }

    if (isOwnProfile) {
      fetchCircles()
      fetchConnections()
      fetchRecentAchievements()
      fetchFollowingCount()
    } else {
      setAchievementLoading(false)
    }
  }, [isOwnProfile])

  const handleCreateCircle = async () => {
    if (!newCircleName.trim()) return

    try {
      let iconPath = 'users' // default icon

      // Upload image if provided
      if (newCircleImageFile) {
        const formData = new FormData()
        formData.append('image', newCircleImageFile)
        formData.append('type', 'circle-icon')

        const uploadResponse = await fetch('/api/upload/circle-icon', {
          method: 'POST',
          credentials: 'include',
          body: formData
        })

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          iconPath = uploadResult.path
        }
      }

      const response = await fetch('/api/circles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newCircleName.trim(),
          description: newCircleDescription.trim() || null,
          color: newCircleColor,
          icon: iconPath
        })
      })

      if (response.ok) {
        // Reset form
        setNewCircleName('')
        setNewCircleDescription('')
        setNewCircleColor('#3B82F6')
        setNewCircleImageFile(null)
        setNewCircleImageUrl('')
        setShowCreateCircle(false)

        // Refresh circles
        await fetchCircles()
      } else {
        console.error('Failed to create circle')
      }
    } catch (error) {
      console.error('Error creating circle:', error)
    }
  }

  const [searchQuery, setSearchQuery] = useState('')

  // Function to check if circle should be disabled for current user
  const isCircleDisabled = (circle: any, currentUserId: string) => {
    // 1. Check if circle is globally disabled
    if (circle.isDisabled) {
      return true;
    }

    // 2. Check if creator is disabled and current user is the creator
    if (circle.isCreatorDisabled && circle.creator?.id === currentUserId) {
      return true;
    }

    // 3. Check if current user's membership is disabled
    const userMembership = circle.memberships?.find(
      (membership: any) => membership.user.id === currentUserId
    );
    if (userMembership && userMembership.isDisabledMember) {
      return true;
    }

    return false;
  };

  const handleCircleClick = (circle: any) => {
    const disabled = isCircleDisabled(circle, studentProp.id);
    if (!disabled) {
      setSelectedCircle(circle)
      setShowCircleManagement(true)
    }
  }

  const handleCircleUpdated = async () => {
    // Refresh circles after invitations are sent
    try {
      const response = await fetch('/api/circles', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setCircles(data)
      }
    } catch (error) {
      console.error('Error refreshing circles:', error)
    }
  }

  // Mock circle members (would come from API in real app)
  const circleMembers = [
    { id: 1, name: "Emma W.", image: "/diverse-students-studying.png", type: "student" },
    { id: 2, name: "Noah T.", image: "/placeholder.svg?key=hwap2", type: "student" },
    { id: 3, name: "Olivia R.", image: "/placeholder.svg?key=oez43", type: "student" },
    { id: 4, name: "Ms. Chen", image: "/diverse-classroom-teacher.png", type: "mentor" },
    { id: 5, name: "Riverdale High", image: "/university-classroom.png", type: "institution" },
  ]

    const handleAddCircle = () => {
        setShowCreateCircle(true)
    }

  const colorOptions = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCircleImageFile(file);
      setNewCircleImageUrl(URL.createObjectURL(file));
    }
  };

  const fetchCircles = async () => {
    try {
      const response = await fetch('/api/circles', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setCircles(data)
      } else {
        console.error('Error fetching circles:', response.status)
      }
    } catch (error) {
      console.error('Error fetching circles:', error)
    }
  }

  return (
    <div>
      <div className="relative">
        {/* Customizable banner */}
        <div className={`h-48 w-full bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue`}></div>

        <div className="container mx-auto px-4 max-w-7xl">
          <div className="relative -mt-24 sm:-mt-16 mb-6">
            {/* Profile info - With profile pic inside */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Left column - Profile details with profile pic */}
                <div className="md:col-span-3">
                  <div className="flex flex-row gap-4 mb-4">
                    {/* Profile image */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="rounded-full border-4 border-white dark:border-gray-800 overflow-hidden h-20 w-20 sm:h-28 sm:w-28 shadow-md">
                        <Image
                          src={profileImage || "/placeholder.svg"}
                          alt={displayName}
                          width={112}
                          height={112}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Name and tagline */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <h1 className="text-xl sm:text-3xl font-bold truncate">{displayName}</h1>
                          {true && <BadgeCheck className="h-6 w-6 text-pathpiper-teal" />}
                        </div>
                        {/* Edit Profile button moved here */}
                        {isOwnProfile && (
                          <Button 
                            size="sm" 
                            className="bg-pathpiper-teal hover:bg-pathpiper-teal/90 shrink-0"
                            onClick={() => router.push('/student/profile/edit')}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        )}
                      </div>
                      {tagline && (
                        <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base truncate">
                          {tagline}
                        </p>
                      )}
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                        {gradeLevel} • {schoolName}
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats - Horizontal display with icons and pastel backgrounds */}
                  <div className="flex flex-wrap gap-3 text-xs font-medium mt-4">
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 text-pink-600 dark:text-pink-300 px-3 py-1.5 rounded-full">
                      <Users className="h-3.5 w-3.5 text-pink-500" data-tooltip="Total connections in their circle" />
                      <span data-tooltip="Total connections in their circle">
                        {actualConnectionCounts?.total || 0} in {isOwnProfile ? 'My' : 'Their'} Circle
                      </span>
                      <div className="ml-1.5 flex items-center gap-1 border-l border-pink-200 dark:border-pink-800/30 pl-1.5">
                        <div className="flex items-center" data-tooltip="Students in their circle">
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
                            className="h-3 w-3 text-pink-500"
                            data-tooltip="Students"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                          <span className="text-[10px] ml-0.5" data-tooltip="Students in their circle">
                            {actualConnectionCounts?.students || 0}
                          </span>
                        </div>
                        <div className="flex items-center" data-tooltip="Mentors guiding them">
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
                            className="h-3 w-3 text-pink-500"
                            data-tooltip="Mentors"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                          <span className="text-[10px] ml-0.5" data-tooltip="Mentors guiding them">
                            {actualConnectionCounts?.mentors || 0}
                          </span>
                        </div>
                        
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-full">
                      <FolderKanban
                        className="h-3.5 w-3.5 text-blue-500"
                        data-tooltip={`Projects ${isOwnProfile ? "you've" : "they've"} created or contributed to`}
                      />
                      <span data-tooltip={`Projects ${isOwnProfile ? "you've" : "they've"} created or contributed to`}>
                        Projects: {studentProp?.projects?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 text-amber-600 dark:text-amber-300 px-3 py-1.5 rounded-full">
                      <Award className="h-3.5 w-3.5 text-amber-500" data-tooltip={`Badges ${isOwnProfile ? "you've" : "they've"} earned`} />
                      <span data-tooltip={`Badges ${isOwnProfile ? "you've" : "they've"} earned`}>
                        Badges: {studentProp?.customBadges?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 text-teal-600 dark:text-teal-300 px-3 py-1.5 rounded-full">
                      <BrainIcon className="h-3.5 w-3.5 text-teal-500" data-tooltip={`Skills ${isOwnProfile ? "you've" : "they've"} developed`} />
                      <span data-tooltip={`Skills ${isOwnProfile ? "you've" : "they've"} developed`}>
                        Skills: {studentProp?.skills?.length || 0}
                      </span>
                    </div>
                    <div 
                      className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 text-emerald-600 dark:text-emerald-300 px-3 py-1.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        // Find the parent component that has setActiveTab
                        const event = new CustomEvent('switchToFollowingTab');
                        window.dispatchEvent(event);
                      }}
                      data-tooltip={`Institutions ${isOwnProfile ? "you're" : "they're"} following`}
                    >
                      <svg 
                        className="h-3.5 w-3.5 text-emerald-500" 
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span data-tooltip={`Institutions ${isOwnProfile ? "you're" : "they're"} following`}>
                        Following: {studentProp?.followingInstitutions?.length || 0}
                      </span>e" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        data-tooltip="Following institutions"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span data-tooltip={`Institutions ${isOwnProfile ? "you're" : "they're"} following`}>
                        Following: {followingCount}
                      </span>
                    </div>
                  </div>

                  {/* Circle preview - Friends circle with add button */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">My Circles</h3>
                      {isOwnProfile && (
                        <button
                          onClick={() => setShowCreateCircle(true)}
                          className="text-xs text-pathpiper-teal hover:text-pathpiper-teal/80 font-medium transition-colors"
                        >
                          + Add
                        </button>
                      )}
                    </div>

                    <div className="relative flex items-center">
                      {/* Check if scrolling is needed */}
                      {(() => {
                        const totalCircles = (isOwnProfile ? 1 : 0) + circles.length; // Friends circle + custom circles
                        const needsScrolling = totalCircles > 4; // Adjust threshold as needed

                        return (
                          <>
                            {/* Scrollable circles container */}
                            <div className={needsScrolling ? "flex-1 overflow-hidden" : "flex-1"}>
                              <div className={`flex ${needsScrolling ? 'overflow-x-auto pb-2 hide-scrollbar' : ''} gap-4 ${needsScrolling ? 'pr-4' : ''}`}>
                                {/* Default Friends Circle - Only show for own profile */}
                                {isOwnProfile && (
                                  <div className="flex flex-col items-center min-w-[72px] shrink-0">
                                    <div className="relative mb-1">
                                      <button
                                        onClick={() => handleCircleClick({
                                          id: 'friends',
                                          name: 'Friends',
                                          color: '#ec4899',
                                          icon: 'users',
                                          memberships: connections?.map(conn => ({
                                            user: conn.user
                                          })) || [],
                                          _count: {
                                            memberships: actualConnectionCounts?.total || 0
                                          },
                                          creator: studentProp.profile,
                                          isDefault: true
                                        })}
                                        className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 p-[3px] hover:from-pink-500 hover:to-purple-600 transition-all duration-200"
                                      >
                                        <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[2px]">
                                          <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                            <Users className="h-6 w-6 text-pink-500 dark:text-pink-400" />
                                          </div>
                                        </div>
                                      </button>
                                    </div>
                                    <span className="text-xs text-center text-gray-600 dark:text-gray-400 truncate w-full">
                                      Friends ({(actualConnectionCounts?.total || 0) + 1})
                                    </span>
                                  </div>
                                )}

                                {/* Dynamic Circles from Database */}
                                {circles.map((circle) => {
                                  const isDisabled = isCircleDisabled(circle, studentProp.id);
                                  
                                  return (
                                    <div 
                                      key={circle.id}
                                      className="flex flex-col items-center min-w-[72px] shrink-0"
                                    >
                                      <div className="relative mb-1">
                                        <button
                                          onClick={() => handleCircleClick(circle)}
                                          disabled={isDisabled}
                                          className={`w-16 h-16 rounded-full p-[3px] transition-all duration-200 relative ${
                                            isDisabled 
                                              ? 'cursor-not-allowed opacity-50 grayscale' 
                                              : 'hover:opacity-80'
                                          }`}
                                          style={{ 
                                            background: isDisabled 
                                              ? 'linear-gradient(135deg, #9CA3AF, #9CA3AFdd)'
                                              : `linear-gradient(135deg, ${circle.color}, ${circle.color}dd)`
                                          }}
                                        >
                                          <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[2px]">
                                            <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                              {circle.icon && (circle.icon.startsWith('data:image') || circle.icon.startsWith('/uploads/')) ? (
                                                <img
                                                  src={circle.icon}
                                                  alt={circle.name}
                                                  className={`w-full h-full object-cover rounded-full ${
                                                    isDisabled ? 'grayscale' : ''
                                                  }`}
                                                />
                                              ) : (
                                                <div 
                                                  className="w-3 h-3 rounded-full"
                                                  style={{ backgroundColor: isDisabled ? '#9CA3AF' : circle.color }}
                                                />
                                              )}
                                            </div>
                                          </div>
                                          {isDisabled && (
                                            <div className="absolute inset-0 rounded-full bg-gray-500 bg-opacity-30 flex items-center justify-center">
                                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
                                              </svg>
                                            </div>
                                          )}
                                        </button>
                                      </div>
                                      <span className={`text-xs text-center truncate w-full ${
                                        isDisabled 
                                          ? 'text-gray-400 dark:text-gray-500' 
                                          : 'text-gray-600 dark:text-gray-400'
                                      }`}>
                                        {circle.name} ({(circle._count?.memberships || 0) + 1})
                                        {isDisabled && (
                                          <div className="text-[10px] text-gray-400">Disabled</div>
                                        )}
                                      </span>
                                    </div>
                                  );
                                })}

                                
                              </div>
                            </div>

                            
                          </>
                        );
                      })()}
                    </div>

                    {/* Create Circle Modal */}
                    {showCreateCircle && (
                      <Dialog open={showCreateCircle} onOpenChange={setShowCreateCircle}>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                          <DialogHeader>
                            <DialogTitle>Create New Circle Badge</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Circle Name</label>
                              <Input
                                value={newCircleName}
                                onChange={(e) => setNewCircleName(e.target.value)}
                                placeholder="Enter circle name"
                                maxLength={50}
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium">Description (Optional)</label>
                              <Input
                                value={newCircleDescription}
                                onChange={(e) => setNewCircleDescription(e.target.value)}
                                placeholder="Enter circle description"
                                maxLength={200}
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium">Circle Icon</label>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="flex-1"
                                  />
                                  {newCircleImageUrl && (
                                    <div className="flex items-center gap-2">
                                      <img
                                        src={newCircleImageUrl}
                                        alt="Circle icon preview"
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setNewCircleImageUrl('')
                                          setNewCircleImageFile(null)
                                        }}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">
                                  Upload a custom icon or leave empty to use default icon
                                </p>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium">Color</label>
                              <div className="flex gap-2 mt-2">
                                {colorOptions.map((colorOption) => (
                                  <button
                                    key={colorOption}
                                    className={`w-8 h-8 rounded-full border-2 ${
                                      newCircleColor === colorOption ? 'border-gray-800' : 'border-gray-300'
                                    }`}
                                    style={{ backgroundColor: colorOption }}
                                    onClick={() => setNewCircleColor(colorOption)}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button variant="outline" onClick={() => setShowCreateCircle(false)} className="flex-1">
                                Cancel
                              </Button>
                              <Button onClick={handleCreateCircle} disabled={!newCircleName.trim()} className="flex-1">
                                Create Circle
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                {/* Right column - Profile highlights */}
                <div className="md:col-span-2 md:border-l md:border-gray-200 md:dark:border-gray-700 md:pl-6">
                  {/* Circle Invitations Section - Only show for own profile */}
                  {isOwnProfile && (
                    <div className="mb-6">
                      <CircleInvitationsSection onInvitationHandled={handleCircleUpdated} />
                    </div>
                  )}

                  {/* Top Skills section - Dynamic from Database with sorting by proficiency */}
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Top Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {student?.skills && student.skills.length > 0 ? (
                        student.skills
                          .sort((a: any, b: any) => (b.proficiencyLevel || 0) - (a.proficiencyLevel || 0))
                          .slice(0, 5)
                          .map((skill: any, i: number) => (
                          <div
                            key={skill.id || i}
                            className={`px-3 py-1 rounded-full text-xs ${
                              i % 4 === 0
                                ? "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300"
                                : i % 4 === 1
                                  ? "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300"
                                  : i % 4 === 2
                                    ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                                    : "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300"
                            }`}
                          >
                            {skill.name}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">No skills added yet</span>
                      )}
                    </div>
                  </div>

                  {/* Recent Achievements section */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Recent Achievements</h3>
                      {isOwnProfile && (
                        <button
                          onClick={() => router.push('/student/profile/edit?section=achievements')}
                          className="text-xs text-pathpiper-teal hover:text-pathpiper-teal/80 font-medium transition-colors"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                    {achievementLoading ? (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="min-w-[220px] shrink-0">
                            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 w-full rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : recentAchievements && recentAchievements.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                        {recentAchievements.slice(0, 5).map((achievement, index) => (
                          <div 
                            key={achievement.id} 
                            className="min-w-[220px] shrink-0 cursor-pointer"
                            title={`${achievement.name} - Awarded ${format(new Date(achievement.dateOfAchievement), 'MMM dd, yyyy')}`}
                          >
                            <div 
                              className={`p-3 rounded-lg border h-16 ${
                                index % 4 === 0
                                  ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800"
                                  : index % 4 === 1
                                    ? "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800"
                                    : index % 4 === 2
                                      ? "bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800"
                                      : "bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-green-200 dark:border-green-800"
                              }`}
                            >
                              <div className="flex items-center gap-3 h-full">
                                <div className="flex-shrink-0">
                                  {achievement.achievementImageIcon ? (
                                    <img
                                      src={achievement.achievementImageIcon}
                                      alt={achievement.name}
                                      className="h-8 w-8 rounded-full object-cover"
                                    />
                                  ) : achievement.achievementTypeId ? (
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                                         style={{
                                           background: `linear-gradient(135deg, ${getDefaultIconData(achievement.achievementTypeId).color}20, ${getDefaultIconData(achievement.achievementTypeId).color}40)`,
                                           border: `1px solid ${getDefaultIconData(achievement.achievementTypeId).color}30`,
                                           boxShadow: `0 1px 4px ${getDefaultIconData(achievement.achievementTypeId).color}20`
                                         }}>
                                      {getDefaultIcon(achievement.achievementTypeId)}
                                    </div>
                                  ) : (
                                    <div 
                                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                        index % 4 === 0
                                          ? "bg-yellow-100 dark:bg-yellow-900/40"
                                          : index % 4 === 1
                                            ? "bg-blue-100 dark:bg-blue-900/40"
                                            : index % 4 === 2
                                              ? "bg-purple-100 dark:bg-purple-900/40"
                                              : "bg-green-100 dark:bg-green-900/40"
                                      }`}
                                    >
                                      <Award 
                                        className={`h-4 w-4 ${
                                          index % 4 === 0
                                            ? "text-yellow-600 dark:text-yellow-400"
                                            : index % 4 === 1
                                              ? "text-blue-600 dark:text-blue-400"
                                              : index % 4 === 2
                                                ? "text-purple-600 dark:text-purple-400"
                                                : "text-green-600 dark:text-green-400"
                                        }`}
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                      {achievement.name}
                                    </h5>
                                    <div className="flex items-center gap-1 ml-2">
                                      <Calendar className="h-3 w-3 text-gray-400" />
                                      <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                        {format(new Date(achievement.dateOfAchievement), 'MMM dd')}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1 truncate">
                                    {achievement.description || "Achievement earned"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg flex items-center gap-3 h-16">
                        <div className="bg-gray-100 dark:bg-gray-700 h-8 w-8 rounded flex items-center justify-center">
                          <Award className="h-4 w-4 text-gray-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">No achievements yet</h4>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Start adding your accomplishments</p>
                        </div>
                      </div>
                    )}
                    {recentAchievements && recentAchievements.length > 5 && (
                      <div className="mt-2 text-center">
                        <button
                          onClick={() => router.push('/student/profile?tab=achievements')}
                          className="text-[10px] text-pathpiper-teal hover:text-pathpiper-teal/80 font-medium transition-colors"
                        >
                          View All ({recentAchievements.length})
                        </button>
                      </div>
                    )}
                  </div>



                  {/* Recent Badges section */}
                  <div className="mt-3">
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Recent Badges</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 h-12 w-12 rounded-full flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 024 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6 text-blue-600 dark:text-blue-400"
                          >
                            <path d="M12 2v20"></path>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                          </svg>
                        </div>
                        <span className="text-[10px] text-center mt-1 text-gray-600 dark:text-gray-400">Math Whiz</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 h-12 w-12 rounded-full flex items-center justify-center">
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
                            className="h-6 w-6 text-purple-600 dark:text-purple-400"
                          >
                            <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                          </svg>
                        </div>
                        <span className="text-[10px] text-center mt-1 text-gray-600 dark:text-gray-400">
                          Coding Pro
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 h-12 w-12 rounded-full flex items-center justify-center">
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
                            className="h-6 w-6 text-amber-600 dark:text-amber-400"
                          >
                            <path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2l3 6.3 7 1-5 4.8 1.2 6.9-6.2-3.2Z"></path>
                          </svg>
                        </div>
                        <span className="text-[10px] text-center mt-1 text-gray-600 dark:text-gray-400">
                          Top Achiever
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <a
                        href="#"
                        className="text-[10px] text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 font-medium"
                      >
                        View All Badges
                      </a>
                    </div>
                  </div>

                  {!isOwnProfile && (
                    <div className="mt-6">
                      {/* Action buttons for viewing other profiles */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button size="lg" className="bg-pathpiper-teal hover:bg-pathpiper-teal/90">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg"
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/connections/request', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                credentials: 'include',
                                body: JSON.stringify({
                                  receiverId: studentProp.id,
                                  message: `Hi! I'd like to connect with you on PathPiper.`
                                }),
                              })

                              if (response.ok) {
                                alert('Connection request sent successfully!')
                              } else {
                                const error = await response.json()
                                alert(`Failed to send connection request: ${error.error || 'Unknown error'}`)
                              }
                            } catch (error) {
                              console.error('Error sending connection request:', error)
                              alert('Failed to send connection request')
                            }
                          }}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CircleManagementDialog
        circle={selectedCircle}
        open={showCircleManagement}
        onOpenChange={setShowCircleManagement}
        onCircleUpdated={handleCircleUpdated}
      />
    </div>
  )
}

// Circle Invitations Section Component
interface CircleInvitationsSectionProps {
  onInvitationHandled: () => void
}

function CircleInvitationsSection({ onInvitationHandled }: CircleInvitationsSectionProps) {
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchInvitations()
  }, [])

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/circles/invitations?type=received', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        // Only show pending invitations
        setInvitations(data.filter((inv: any) => inv.status === 'pending'))
      }
    } catch (error) {
      console.error('Error fetching invitations:', error)
    }
  }

  const handleInvitation = async (invitationId: string, action: 'accept' | 'decline') => {
    setLoading(true)
    try {
      const response = await fetch(`/api/circles/invitations/${invitationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        // Remove the invitation from the list
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId))
        onInvitationHandled()
      }
    } catch (error) {
      console.error('Error handling invitation:', error)
    } finally {
      setLoading(false)
    }
  }

  if (invitations.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Circle Requests</h3>
      <div className="space-y-3 max-w-xs">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                style={{ backgroundColor: invitation.circle.color }}
              >
                {invitation.circle.icon === 'users' ? (
                  <Users className="h-4 w-4" />
                ) : (
                  invitation.circle.icon
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{invitation.circle.name}</p>
                <p className="text-xs text-gray-500">
                  from {invitation.inviter.firstName} {invitation.inviter.lastName}
                </p>
              </div>
            </div>

            {invitation.message && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 italic">
                "{invitation.message}"
              </p>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleInvitation(invitation.id, 'accept')}
                disabled={loading}
                className="flex-1 h-7 text-xs"
              >
                <UserCheck className="h-3 w-3 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleInvitation(invitation.id, 'decline')}
                disabled={loading}
                className="flex-1 h-7 text-xs"
              >
                <UserX className="h-3 w-3 mr-1" />
                Decline
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}