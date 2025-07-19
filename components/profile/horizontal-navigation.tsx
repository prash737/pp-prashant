"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { User, GraduationCap, Award, FolderOpen, Target, Brain, Users, Building2 } from 'lucide-react'

interface Tab {
  id: string
  label: string
}

interface HorizontalNavigationProps {
  tabs: Tab[]
  activeTab: string
  setActiveTab: (tabId: string) => void
}

export default function HorizontalNavigation({ tabs, activeTab, setActiveTab }: HorizontalNavigationProps) {
  const tabs = [
    { id: 'about', label: 'About', icon: User },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'skills', label: 'Skills', icon: Brain },
    { id: 'following', label: 'Following', icon: Building2 },
    { id: 'connections', label: 'Connections', icon: Users }
  ]
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 sm:top-24 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide py-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap text-sm font-medium transition-colors duration-200",
                activeTab === tab.id
                  ? "bg-pathpiper-teal text-white hover:bg-pathpiper-teal/90"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}