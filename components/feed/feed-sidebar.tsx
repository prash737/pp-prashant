import { Button } from "@/components/ui/button"
import {
  Home,
  Search,
  Bell,
  MessageSquare,
  User,
  Bookmark,
  Settings,
  Sparkles,
  Users,
  Clock,
  Award,
  Calendar,
  BookOpen,
  HelpCircle,
  Lightbulb,
  LayoutGrid,
} from "lucide-react"

export default function FeedSidebar() {
  return (
    <div className="p-4 h-full">
      <div className="space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Search className="h-4 w-4 mr-2" />
            Explore
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Bookmark className="h-4 w-4 mr-2" />
            Saved
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Feed Filters */}
        <div>
          <h3 className="text-sm font-medium mb-2 px-2">Feed</h3>
          <div className="space-y-1">
            <Button variant="default" size="sm" className="w-full justify-start">
              <Sparkles className="h-4 w-4 mr-2" />
              For You
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Following
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Clock className="h-4 w-4 mr-2" />
              Recent
            </Button>
          </div>
        </div>

        {/* Content Types */}
        <div>
          <h3 className="text-sm font-medium mb-2 px-2">Content</h3>
          <div className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <LayoutGrid className="h-4 w-4 mr-2" />
              All
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Award className="h-4 w-4 mr-2" />
              Achievements
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <BookOpen className="h-4 w-4 mr-2" />
              Resources
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <HelpCircle className="h-4 w-4 mr-2" />
              Questions
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Lightbulb className="h-4 w-4 mr-2" />
              Projects
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
