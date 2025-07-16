"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PencilIcon, BadgeCheckIcon } from "lucide-react"

export default function MentorProfileHeader() {
  const [isEditing, setIsEditing] = useState(false)

  // Mock mentor data
  const mentor = {
    name: "Dr. Michael Chen",
    tagline: "Computer Science Professor & Industry Consultant",
    location: "Stanford, California",
    organization: "Stanford University",
    yearsExperience: 15,
    mentees: 120,
    sessions: 87,
    rating: 4.8,
    specialties: ["AI/ML", "Computer Vision", "Higher Education", "Career Development"],
    availability: "10 hrs/week",
    profileImage: "/diverse-professor-lecturing.png",
    bannerColor: "from-emerald-500 to-teal-600",
    verified: true,
  }

  // Mock circles data
  const circles = [
    {
      id: 1,
      name: "CS Mentorship",
      count: 24,
      image: "/multiple-monitor-coding.png",
      color: "from-blue-400 to-cyan-500",
    },
    {
      id: 2,
      name: "Stanford Faculty",
      count: 18,
      image: "/university-laboratory.png",
      color: "from-purple-400 to-indigo-500",
    },
    {
      id: 3,
      name: "Industry Partners",
      count: 32,
      image: "/bustling-university-campus.png",
      color: "from-amber-400 to-orange-500",
    },
    { id: 4, name: "Research Group", count: 15, image: "/college-library.png", color: "from-teal-400 to-emerald-500" },
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
        {/* Customizable banner */}
        <div className={`h-48 w-full bg-gradient-to-r ${mentor.bannerColor}`}>
          {isEditing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Button variant="outline" className="bg-white text-gray-800">
                Change Banner
              </Button>
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 max-w-7xl">
          <div className="relative -mt-24 sm:-mt-16 mb-6">
            {/* Profile info - With profile pic inside */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Left column - Profile details with profile pic */}
                <div className="md:col-span-3">
                  <div className="flex flex-row gap-3 mb-4">
                    {/* Profile image */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="rounded-full border-4 border-white dark:border-gray-800 overflow-hidden h-20 w-20 sm:h-28 sm:w-28 shadow-md">
                        <Image
                          src={mentor.profileImage || "/placeholder.svg"}
                          alt={mentor.name}
                          width={112}
                          height={112}
                          className="object-cover"
                        />
                      </div>
                      {isEditing && (
                        <Button size="sm" className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Name and tagline */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-3xl font-bold truncate">{mentor.name}</h1>
                        {mentor.verified && (
                          <BadgeCheckIcon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-emerald-500" />
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base truncate">
                        {mentor.tagline}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2 truncate">
                        {mentor.organization} • {mentor.location}
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats - Horizontal display with icons and pastel backgrounds */}
                  <div className="flex flex-wrap gap-3 text-xs font-medium mt-4">
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 text-emerald-600 dark:text-emerald-300 px-3 py-1.5 rounded-full">
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
                        className="h-3.5 w-3.5 text-emerald-500"
                        data-tooltip="Total mentees guided"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span data-tooltip="Total mentees guided">{mentor.mentees}+ Mentees</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-full">
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
                        className="h-3.5 w-3.5 text-blue-500"
                        data-tooltip="Mentoring sessions completed"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span data-tooltip="Mentoring sessions completed">{mentor.sessions} Sessions</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 text-amber-600 dark:text-amber-300 px-3 py-1.5 rounded-full">
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
                        className="h-3.5 w-3.5 text-amber-500"
                        data-tooltip="Average mentee rating"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      <span data-tooltip="Average mentee rating">{mentor.rating}/5 Rating</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 text-purple-600 dark:text-purple-300 px-3 py-1.5 rounded-full">
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
                        className="h-3.5 w-3.5 text-purple-500"
                        data-tooltip="Years of experience"
                      >
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                      <span data-tooltip="Years of experience">{mentor.yearsExperience} Years Experience</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 text-teal-600 dark:text-teal-300 px-3 py-1.5 rounded-full">
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
                        className="h-3.5 w-3.5 text-teal-500"
                        data-tooltip="Weekly availability"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span data-tooltip="Weekly availability">{mentor.availability} Available</span>
                    </div>
                  </div>

                  {/* Circle preview - Instagram-style story highlights with horizontal scroll */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">My Circles</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-emerald-500 hover:text-emerald-600 p-0"
                      >
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
                          className="h-3 w-3 mr-1"
                        >
                          <path d="M5 12h14"></path>
                          <path d="M12 5v14"></path>
                        </svg>
                        New Circle
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="flex overflow-x-auto pb-2 hide-scrollbar gap-4">
                        {circles.map((circle) => (
                          <div key={circle.id} className="flex flex-col items-center min-w-[72px]">
                            <div className="relative mb-1">
                              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${circle.color} p-[3px]`}>
                                <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[2px]">
                                  <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                    <Image
                                      src={circle.image || "/placeholder.svg"}
                                      alt={circle.name}
                                      width={64}
                                      height={64}
                                      className="object-cover"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-center text-gray-600 dark:text-gray-400 truncate w-full">
                              {circle.name}
                            </span>
                            <span className="text-[10px] text-center text-gray-500 dark:text-gray-500 truncate w-full">
                              {circle.count} members
                            </span>
                          </div>
                        ))}

                        {/* Add New Circle */}
                        <div className="flex flex-col items-center min-w-[72px]">
                          <div className="relative mb-1">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 p-[3px]">
                              <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-[2px]">
                                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
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
                                    className="h-6 w-6 text-gray-500 dark:text-gray-400"
                                  >
                                    <path d="M5 12h14"></path>
                                    <path d="M12 5v14"></path>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-center text-gray-600 dark:text-gray-400 truncate w-full">
                            Create New
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column - Profile highlights */}
                <div className="md:col-span-2 md:border-l md:border-gray-200 md:dark:border-gray-700 md:pl-6">
                  {/* Expertise section */}
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Areas of Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {mentor.specialties.map((specialty, index) => (
                        <div
                          key={index}
                          className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs"
                        >
                          {specialty}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Mentee Feedback */}
                  <div className="mt-3">
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Recent Feedback</h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/40 h-8 w-8 rounded-full flex items-center justify-center">
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
                          className="h-4 w-4 text-blue-600 dark:text-blue-400"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium">
                          "Exceptional mentor, transformed my understanding of AI"
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">From Alex J. • 2 days ago</p>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Sessions */}
                  <div className="mt-3">
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Upcoming Sessions</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="bg-emerald-100 dark:bg-emerald-900/40 h-8 w-8 rounded-full flex items-center justify-center mr-2">
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
                            className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">AI Project Review</p>
                          <p className="text-[10px] text-gray-500">Tomorrow, 3:00 PM</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
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
                            className="h-3 w-3 text-gray-500"
                          >
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </Button>
                      </div>
                      <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="bg-emerald-100 dark:bg-emerald-900/40 h-8 w-8 rounded-full flex items-center justify-center mr-2">
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
                            className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">Group Mentoring Session</p>
                          <p className="text-[10px] text-gray-500">Friday, 5:30 PM</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
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
                            className="h-3 w-3 text-gray-500"
                          >
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <button className="text-[10px] text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">
                        View All Sessions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
