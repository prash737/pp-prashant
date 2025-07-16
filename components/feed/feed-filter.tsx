"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function FeedFilter() {
  const [contentType, setContentType] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1">
        <Button
          variant="outline"
          size="sm"
          className={`rounded-full text-xs h-7 px-3 ${contentType === "all" ? "bg-gray-100 border-gray-300" : "bg-white"}`}
          onClick={() => setContentType("all")}
        >
          All
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`rounded-full text-xs h-7 px-3 ${contentType === "posts" ? "bg-gray-100 border-gray-300" : "bg-white"}`}
          onClick={() => setContentType("posts")}
        >
          Posts
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`rounded-full text-xs h-7 px-3 ${contentType === "events" ? "bg-gray-100 border-gray-300" : "bg-white"}`}
          onClick={() => setContentType("events")}
        >
          Events
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`rounded-full text-xs h-7 px-3 ${contentType === "questions" ? "bg-gray-100 border-gray-300" : "bg-white"}`}
          onClick={() => setContentType("questions")}
        >
          Questions
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`rounded-full text-xs h-7 px-3 ${contentType === "resources" ? "bg-gray-100 border-gray-300" : "bg-white"}`}
          onClick={() => setContentType("resources")}
        >
          Resources
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`rounded-full text-xs h-7 px-3 ${contentType === "achievements" ? "bg-gray-100 border-gray-300" : "bg-white"}`}
          onClick={() => setContentType("achievements")}
        >
          Achievements
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1">
            <span className="hidden sm:inline">Sort by:</span>
            {sortBy === "recent" && "Recent"}
            {sortBy === "popular" && "Popular"}
            {sortBy === "trending" && "Trending"}
            <ChevronDown className="h-3.5 w-3.5 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
            <DropdownMenuRadioItem value="recent">
              Recent
              {sortBy === "recent" && <Check className="h-3.5 w-3.5 ml-auto" />}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="popular">
              Popular
              {sortBy === "popular" && <Check className="h-3.5 w-3.5 ml-auto" />}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="trending">
              Trending
              {sortBy === "trending" && <Check className="h-3.5 w-3.5 ml-auto" />}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
