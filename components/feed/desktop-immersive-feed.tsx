"use client"

import { useState } from "react"
import ImmersiveFeed from "./immersive-feed"
import FeedSidebar from "./feed-sidebar"

export default function DesktopImmersiveFeed() {
  const [activeTab, setActiveTab] = useState("for-you")

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-0">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block lg:col-span-1 border-r border-gray-200 overflow-y-auto">
        <FeedSidebar />
      </div>

      {/* Main Feed - Centered on desktop */}
      <div className="lg:col-span-2 h-full">
        <div className="h-full max-w-md mx-auto">
          <ImmersiveFeed />
        </div>
      </div>

      {/* Right Sidebar - Hidden on mobile */}
      <div className="hidden lg:block lg:col-span-1 border-l border-gray-200 p-4 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-sm mb-3">Trending Topics</h3>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full cursor-pointer">
                #ComputerScience
              </span>
              <span className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full cursor-pointer">
                #MathCompetition
              </span>
              <span className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full cursor-pointer">
                #ScienceFair
              </span>
              <span className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full cursor-pointer">
                #CollegeApplications
              </span>
              <span className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full cursor-pointer">
                #StudyTips
              </span>
              <span className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full cursor-pointer">
                #ArtShowcase
              </span>
              <span className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full cursor-pointer">
                #CareerAdvice
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-3">Suggested Connections</h3>
            <div className="space-y-3">{/* Connection suggestions would go here */}</div>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-3">Upcoming Events</h3>
            <div className="space-y-3">{/* Event suggestions would go here */}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
