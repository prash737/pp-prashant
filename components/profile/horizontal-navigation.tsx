
"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 sm:top-24 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
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
