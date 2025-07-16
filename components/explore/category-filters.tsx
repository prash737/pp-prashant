"use client"

import { Book, Calendar, GraduationCapIcon as Graduation, School, Users, Grid } from "lucide-react"

interface CategoryFiltersProps {
  activeCategory: string
  setActiveCategory: (category: string) => void
}

export function CategoryFilters({ activeCategory, setActiveCategory }: CategoryFiltersProps) {
  const categories = [
    { id: "all", name: "All", icon: Grid },
    { id: "mentors", name: "Mentors", icon: Users },
    { id: "institutions", name: "Institutions", icon: School },
    { id: "events", name: "Events", icon: Calendar },
    { id: "resources", name: "Resources", icon: Book },
    { id: "courses", name: "Courses", icon: Graduation },
  ]

  return (
    <div className="mb-8 overflow-x-auto hide-scrollbar">
      <div className="flex space-x-2 min-w-max">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? "bg-teal-100 text-teal-800"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              <Icon size={16} className="mr-2" />
              {category.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
