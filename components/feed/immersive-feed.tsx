"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronUp, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import FeedCard from "./feed-card"
import FeedFilters from "./feed-filters"

export default function ImmersiveFeed() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [feedItems, setFeedItems] = useState(mockFeedItems)
  const [activeFilter, setActiveFilter] = useState("For You")
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle scroll navigation
  const scrollToCard = (index: number) => {
    if (index < 0 || index >= feedItems.length) return
    setActiveIndex(index)

    // Smooth scroll to the card
    const container = containerRef.current
    const cards = container?.querySelectorAll(".feed-card")
    if (container && cards && cards[index]) {
      container.scrollTo({
        top: (cards[index] as HTMLElement).offsetTop,
        behavior: "smooth",
      })
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault()
        scrollToCard(activeIndex - 1)
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        scrollToCard(activeIndex + 1)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeIndex])

  // Handle scroll events to update active index
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current
      if (!container) return

      const cards = container.querySelectorAll(".feed-card")
      const containerTop = container.scrollTop
      const containerHeight = container.clientHeight
      const threshold = containerHeight / 2

      let newActiveIndex = activeIndex
      cards.forEach((card, index) => {
        const cardTop = (card as HTMLElement).offsetTop - containerTop
        if (cardTop < threshold && cardTop > -threshold) {
          newActiveIndex = index
        }
      })

      if (newActiveIndex !== activeIndex) {
        setActiveIndex(newActiveIndex)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [activeIndex])

  // Apply filter
  const applyFilter = (filter: string) => {
    setActiveFilter(filter)
    setShowFilters(false)
    // In a real app, you would filter the feed items based on the selected filter
  }

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Header with filters */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white bg-black/30 backdrop-blur-md rounded-full px-4 py-1 h-auto text-sm font-medium"
            onClick={() => setShowFilters(!showFilters)}
          >
            {activeFilter}
          </Button>

          {/* Filters dropdown */}
          {showFilters && (
            <div className="absolute top-14 left-0 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-2 z-20">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <FeedFilters onSelectFilter={applyFilter} activeFilter={activeFilter} />
            </div>
          )}
        </div>
      </div>

      {/* Main feed container */}
      <div ref={containerRef} className="h-full overflow-y-auto snap-y snap-mandatory hide-scrollbar">
        {feedItems.map((item, index) => (
          <div key={item.id} className="feed-card h-full w-full snap-start snap-always">
            <FeedCard 
              key={item.id} 
              item={{
                ...item,
                isLikedByUser: item.isLikedByUser || false,
                likesCount: item.likesCount || item.stats?.likes || 0
              }}
              isActive={activeIndex === index}
            />
          </div>
        ))}
      </div>

      {/* Navigation controls */}
      <div className="absolute right-4 bottom-24 z-10 flex flex-col gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-black/30 backdrop-blur-md text-white"
          onClick={() => scrollToCard(activeIndex - 1)}
          disabled={activeIndex === 0}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-black/30 backdrop-blur-md text-white"
          onClick={() => scrollToCard(activeIndex + 1)}
          disabled={activeIndex === feedItems.length - 1}
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

// Mock data for feed items
const mockFeedItems = [
  {
    id: "1",
    type: "achievement",
    title: "Math Champion",
    subtitle: "First place in regional competition",
    description:
      "I'm excited to share that I won first place in the regional math competition! Thanks to everyone who helped me prepare, especially my math teacher Ms. Chen.",
    backgroundImage: "/diverse-female-student.png",
    author: {
      name: "Emma Wilson",
      avatar: "/diverse-female-student.png",
      role: "Student",
      school: "Riverdale High",
    },
    stats: {
      likes: 56,
      comments: 12,
      shares: 8,
    },
    color: "from-amber-500 to-orange-600",
    icon: "trophy",
  },
  {
    id: "2",
    type: "project",
    title: "Renewable Energy",
    subtitle: "Science Fair Project",
    description:
      "Just finished my science project on renewable energy! Check out the solar panel model I built for the science fair next week.",
    backgroundImage: "/robotics-competition.png",
    author: {
      name: "Alex Johnson",
      avatar: "/images/student-profile.png",
      role: "Student",
      school: "Westlake High School",
    },
    stats: {
      likes: 24,
      comments: 5,
      shares: 2,
    },
    color: "from-teal-500 to-emerald-600",
    icon: "lightbulb",
  },
  {
    id: "3",
    type: "event",
    title: "CS Innovation Conference",
    subtitle: "Stanford University",
    description:
      "Join us for our annual Computer Science Innovation Conference! Featuring guest speakers from leading tech companies and research presentations from our faculty.",
    backgroundImage: "/computer-science-research-presentation.png",
    author: {
      name: "Stanford University",
      avatar: "/images/pathpiper-logo.png",
      role: "Institution",
      location: "Stanford, CA",
    },
    stats: {
      likes: 89,
      comments: 15,
      shares: 32,
    },
    color: "from-red-500 to-rose-600",
    icon: "calendar",
    eventDetails: {
      date: "June 15, 2023",
      time: "9:00 AM - 5:00 PM",
      location: "Stanford Campus, Building 380",
    },
  },
  {
    id: "4",
    type: "resource",
    title: "Machine Learning Fundamentals",
    subtitle: "Tutorial Series",
    description:
      "I've created a new tutorial series on machine learning fundamentals for beginners. This covers basic concepts and includes practical exercises to help you get started.",
    backgroundImage: "/ai-ethics.png",
    author: {
      name: "Dr. James Chen",
      avatar: "/asian-professor.png",
      role: "Mentor",
      expertise: "Computer Science",
    },
    stats: {
      likes: 112,
      comments: 23,
      shares: 45,
    },
    color: "from-blue-500 to-indigo-600",
    icon: "book",
  },
  {
    id: "5",
    type: "question",
    title: "Calculus Help Needed",
    subtitle: "Derivatives Concept",
    description:
      "I'm struggling with calculus derivatives. Can anyone recommend good online resources or tutorials that explain this concept clearly?",
    backgroundImage: "/placeholder-y2j1o.png",
    author: {
      name: "Noah Taylor",
      avatar: "/diverse-student-portraits.png",
      role: "Student",
      school: "Eastside Prep",
    },
    stats: {
      likes: 8,
      comments: 14,
      shares: 1,
    },
    color: "from-purple-500 to-violet-600",
    icon: "help-circle",
  },
]