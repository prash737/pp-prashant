"use client"

import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Users,
  Clock,
  Bookmark,
  Award,
  Calendar,
  BookOpen,
  HelpCircle,
  Lightbulb,
  LayoutGrid,
} from "lucide-react"

interface FeedFiltersProps {
  onSelectFilter: (filter: string) => void
  activeFilter: string
}

export default function FeedFilters({ onSelectFilter, activeFilter }: FeedFiltersProps) {
  const filters = [
    { name: "For You", icon: <Sparkles className="h-4 w-4" /> },
    { name: "Following", icon: <Users className="h-4 w-4" /> },
    { name: "Recent", icon: <Clock className="h-4 w-4" /> },
    { name: "Saved", icon: <Bookmark className="h-4 w-4" /> },
  ]

  const contentTypes = [
    { name: "All", icon: <LayoutGrid className="h-4 w-4" /> },
    { name: "Achievements", icon: <Award className="h-4 w-4" /> },
    { name: "Events", icon: <Calendar className="h-4 w-4" /> },
    { name: "Resources", icon: <BookOpen className="h-4 w-4" /> },
    { name: "Questions", icon: <HelpCircle className="h-4 w-4" /> },
    { name: "Projects", icon: <Lightbulb className="h-4 w-4" /> },
  ]

  return (
    <div className="w-64 p-2">
      <h3 className="text-sm font-medium mb-2 px-2">Feed</h3>
      <div className="space-y-1 mb-4">
        {filters.map((filter) => (
          <Button
            key={filter.name}
            variant={activeFilter === filter.name ? "default" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => onSelectFilter(filter.name)}
          >
            {filter.icon}
            <span className="ml-2">{filter.name}</span>
          </Button>
        ))}
      </div>

      <h3 className="text-sm font-medium mb-2 px-2">Content Type</h3>
      <div className="space-y-1">
        {contentTypes.map((type) => (
          <Button
            key={type.name}
            variant={activeFilter === type.name ? "default" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => onSelectFilter(type.name)}
          >
            {type.icon}
            <span className="ml-2">{type.name}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
