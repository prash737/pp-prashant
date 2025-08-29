"use client"

import { MessageSquareIcon, UserPlusIcon, ShareIcon, BookmarkIcon, MoreHorizontalIcon, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface ActionBarProps {
  student?: any
  currentUser?: any
}

export default function ActionBar({ student, currentUser }: ActionBarProps) {
  const router = useRouter()

  // Check if this is the current user's own profile
  const isOwnProfile = currentUser && student && currentUser.id === student.id
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3 px-4 z-10">
      <div className="container mx-auto max-w-7xl flex justify-between items-center">
        <div className="flex gap-2">
          {isOwnProfile ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full"
              onClick={() => {
                if (isOwnProfile) {
                  // Immediate routing - no delays or checks
                  router.push('/student/profile/edit')
                } else {
                  setShowConnectionDialog(true)
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" className="rounded-full">
                <MessageSquareIcon className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Connect
              </Button>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ShareIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <BookmarkIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}