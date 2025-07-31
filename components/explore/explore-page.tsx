"use client"

import { useState } from "react"
import { CategoryFilters } from "./category-filters"
import { FeaturedSection } from "./featured-section"
import { TrendingTopics } from "./trending-topics"
import { PeopleCards } from "./people-cards"
import { InstitutionCards } from "./institution-cards"
import { EventsCards } from "./events-cards"
import { ResourcesCards } from "./resources-cards"
import { Recommendations } from "./recommendations"
import { Search, Clock, Sparkles, Bell, ArrowRight } from "lucide-react"

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [notifyMe, setNotifyMe] = useState(false)

  const handleNotifyClick = () => {
    setNotifyMe(true)
    // You could add actual notification logic here
    setTimeout(() => setNotifyMe(false), 3000)
  }

  return (
    <div className="container mx-auto px-4 py-6 relative">
      {/* Coming Soon Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 p-8 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-teal-500/20 animate-pulse"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Explore Feature</h2>
              <div className="flex items-center justify-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Coming Soon</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Amazing Discovery Features Await!
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                We're crafting an incredible explore experience that will help you discover mentors, 
                institutions, resources, and opportunities tailored just for you. Get ready for 
                personalized recommendations, advanced search capabilities, and so much more.
              </p>
              
              {/* Feature Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-medium text-purple-900 mb-1">Smart Search</h4>
                  <p className="text-sm text-purple-700">AI-powered discovery</p>
                </div>
                
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-medium text-teal-900 mb-1">Recommendations</h4>
                  <p className="text-sm text-teal-700">Personalized matches</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleNotifyClick}
                disabled={notifyMe}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  notifyMe
                    ? 'bg-green-500 text-white cursor-default'
                    : 'bg-gradient-to-r from-purple-600 to-teal-500 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                }`}
              >
                {notifyMe ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Notification Set!
                  </>
                ) : (
                  <>
                    <Bell className="w-5 h-5" />
                    Notify Me When Ready
                  </>
                )}
              </button>
              
              <button
                onClick={() => window.location.href = '/feed'}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Explore Feed Instead
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Development Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-teal-500 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">75% Complete • Launching Soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Original content (blurred in background) */}
      <div className="filter blur-sm pointer-events-none">
        {/* Hero section with search */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-teal-500/90 z-10"></div>
          <img src="/images/explore-hero.png" alt="Explore PathPiper" className="w-full h-64 object-cover" />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center">Explore Your Learning Journey</h1>
            <p className="text-white/90 text-center mb-6 max-w-2xl">
              Discover mentors, institutions, resources, and events to help you grow
            </p>
            <div className="relative w-full max-w-2xl">
              <input
                type="text"
                placeholder="Search for topics, mentors, institutions, or resources..."
                className="w-full pl-12 pr-4 py-3 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            </div>
          </div>
        </div>

        {/* Category filters */}
        <CategoryFilters activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

        {/* Featured section */}
        <FeaturedSection />

        {/* Trending topics */}
        <TrendingTopics />

        {/* People you might want to connect with */}
        <PeopleCards />

        {/* Educational institutions */}
        <InstitutionCards />

        {/* Upcoming events */}
        <EventsCards />

        {/* Educational resources */}
        <ResourcesCards />

        {/* Personalized recommendations */}
        <Recommendations />
      </div>
    </div>
  )
}
