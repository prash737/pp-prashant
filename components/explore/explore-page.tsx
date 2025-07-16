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
import { Search } from "lucide-react"

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  return (
    <div className="container mx-auto px-4 py-6">
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
  )
}
