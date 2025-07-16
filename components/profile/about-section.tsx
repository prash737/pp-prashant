"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { GlobeIcon, BrainIcon, EditIcon, Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import EducationCards from "./education-cards"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AboutSectionProps {
  student?: any
  currentUser?: any
  isViewMode?: boolean;
}

interface Connection {
  id: string
  user: {
    id: string
    name: string
    firstName: string
    lastName: string
    avatar?: string
    role: string
  }
}

export default function AboutSection({ student: studentProp, currentUser, isViewMode }: AboutSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)

  // Use passed student data or empty defaults
  const student = studentProp || {
    bio: "",
    location: "",
    socialLinks: {},
    moodBoard: [],
  }

  // Extract real data from student prop
  const realBio = studentProp?.profile?.bio || ""
  const realLocation = studentProp?.profile?.location || ""

  // Check if this is the current user's own profile
  const isOwnProfile = currentUser && currentUser.id === student.id

  useEffect(() => {
    const fetchConnections = async () => {
    try {
      setLoading(true)
      // Fetch connections for the specific user being viewed, not the current user
      const response = await fetch(`/api/connections?userId=${student.id}`)
      if (response.ok) {
        const data = await response.json()
        // Show only first 5 connections for preview
        setConnections(data.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching connections:', error)
    } finally {
      setLoading(false)
    }
  }

    fetchConnections()
  }, [student.id])


  const getRoleColor = (role: string) => {
    switch (role) {
      case 'mentor': return 'ring-yellow-400'
      case 'institution': return 'ring-blue-400 ring-dashed'
      default: return 'ring-white dark:ring-gray-800'
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">About Me</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          <motion.div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-semibold mb-3">Bio</h3>
            {!isEditing ? (
              <p className="text-gray-700 dark:text-gray-300">
                {realBio || "No bio added yet"}
              </p>
            ) : (
              <textarea
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                rows={4}
                defaultValue={realBio}
                placeholder="Tell others about yourself..."
              />
            )}

            <div className="flex items-center gap-2 mt-4 text-gray-600 dark:text-gray-400">
              <GlobeIcon className="h-4 w-4" />
              {!isEditing ? (
                <span>{realLocation || "Location not specified"}</span>
              ) : (
                <input
                  type="text"
                  className="p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  defaultValue={realLocation}
                  placeholder="Your location"
                />
              )}
            </div>
          </motion.div>

          {/* Education Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <EducationCards educationHistory={studentProp?.educationHistory} isViewMode={isViewMode}/>
          </motion.div>

          {/* Circle Friends - Real connections */}
          <motion.div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-pink-500" />
                Circle Friends
              </h3>
              <Button variant="ghost" size="sm" className="h-6 text-xs text-pink-500 hover:text-pink-600 p-0">
                View All
              </Button>
            </div>

            {loading ? (
              <div className="flex space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse mb-1"></div>
                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : connections.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {connections.map((connection) => (
                  <div key={connection.id} className="flex flex-col items-center">
                    <div className={`h-12 w-12 rounded-full overflow-hidden mb-1 ring-2 ${getRoleColor(connection.user.role)}`}>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={connection.user.profileImageUrl || connection.user.avatar} alt={connection.user.name} />
                        <AvatarFallback>
                          {connection.user.firstName?.[0]}{connection.user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                      {connection.user.firstName} {connection.user.lastName?.[0]}.
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">No connections made yet</p>
                <p className="text-xs text-gray-400">Start connecting with others!</p>
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Badges */}
          <motion.div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-amber-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 1v4M18 8l2.5-2.5M19 14h4M16 18l2.5 2.5M12 19v4M8 18l-2.5 2.5M5 14H1M8 8L5.5 5.5" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                <h3 className="font-semibold">Badges</h3>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Academic Excellence Badge */}
              <div className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-center">Academic Excellence</span>
              </div>

              {/* Coding Ninja Badge */}
              <div className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-purple-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-center">Coding Ninja</span>
              </div>

              {/* Team Player Badge */}
              <div className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-green-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-center">Team Player</span>
              </div>

              {/* Creative Thinker Badge */}
              <div className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900 dark:to-pink-800 flex items-center justify-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-pink-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12h1M7 12h1M12 2v1M12 7v1M12 12h1M17 12h1M22 12h1M12 17v1M12 22v1" />
                    <path d="M4.93 4.93l.7.7M12 12l-1.41-1.41" />
                    <path d="M19.07 4.93l-.7.7M15.5 8.5l.7.7" />
                    <path d="M4.93 19.07l.7-.7M12 12l-1.41 1.41" />
                    <path d="M19.07 19.07l-.7-.7M15.5 15.5l.7-.7" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-center">Creative Thinker</span>
              </div>

              {/* Science Whiz Badge */}
              <div className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900 dark:to-teal-800 flex items-center justify-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-teal-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2 2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-center">Science Whiz</span>
              </div>

              {/* Early Bird Badge */}
              <div className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 flex items-center justify-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-orange-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-center">Early Bird</span>
              </div>
            </div>
          </motion.div>

          {/* Interests Section - Only show for own profile */}
          {isOwnProfile && (
            <motion.div
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-semibold mb-3">My Interests</h3>
              <div className="space-y-4">
                {student.interests && student.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {student.interests.map((interest, index) => (
                      <span
                        key={`interest-${interest.id || index}`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pathpiper-teal/10 text-pathpiper-teal border border-pathpiper-teal/20"
                      >
                        {interest.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No interests added yet</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      Add interests to help others discover your passions
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Career Goals */}
          {student.careerGoals && student.careerGoals.length > 0 && (
            <motion.div
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-semibold mb-3">Career Goals</h3>
              <div className="space-y-3">
                {student.careerGoals.map((goal: any) => (
                  <div key={goal.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium text-sm">{goal.title}</h4>
                    {goal.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        goal.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        goal.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                      }`}>
                        {goal.status}
                      </span>
                      {goal.timeframe && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Timeframe: {goal.timeframe}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Mood Board */}
          <motion.div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <BrainIcon className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold">Mood Board</h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {studentProp?.moodBoard && studentProp.moodBoard.length > 0 ? (
                studentProp.moodBoard.map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden relative">
                    <Image src={image || "/placeholder.svg"} alt="Mood board image" fill className="object-cover" />
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
                  <BrainIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No mood board images yet</p>
                </div>
              )}

              {isEditing && (
                <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <span className="text-2xl text-gray-400">+</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}