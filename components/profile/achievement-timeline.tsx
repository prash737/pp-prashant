"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Trophy, Clock, Plus } from "lucide-react"
import { format } from "date-fns"

interface Achievement {
  id: number
  name: string
  description: string
  dateOfAchievement: string
  createdAt: string
  achievementImageIcon?: string
}

interface AchievementTimelineProps {
  userId: string
  isOwnProfile?: boolean
  isViewMode?: boolean
  student?: any
  achievements?: any[]
}

export default function AchievementTimeline({ userId, isOwnProfile = false, isViewMode = false, student, achievements }: AchievementTimelineProps) {
  const [achievementList, setAchievementList] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Use achievements from props
    setAchievementList(achievements || [])
  }, [achievements])

  const handleManageAchievements = () => {
    router.push('/student/profile/edit?section=achievements')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pathpiper-teal"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {achievementList.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {isOwnProfile ? "No Achievements Added Yet" : "No Achievements to Show"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {isOwnProfile 
              ? "Start showcasing your accomplishments and milestones."
              : "This user hasn't added any achievements yet."
            }
          </p>
          {isOwnProfile && !isViewMode && (
            <Button onClick={handleManageAchievements} variant="outline" className="px-6 py-2">
              <Plus className="w-4 h-4 mr-2" />
              Add Achievement
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Achievement Timeline
            </h3>
            {isOwnProfile && !isViewMode && (
              <Button onClick={handleManageAchievements} variant="outline" size="sm" className="px-4 py-2">
                <Plus className="w-4 h-4 mr-2" />
                Manage
              </Button>
            )}
          </div>

          <div className="space-y-6 pb-6">
            {achievementList.map((achievement, index) => (
              <Card key={achievement.id} className="relative">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-pathpiper-teal rounded-full flex items-center justify-center flex-shrink-0 relative z-10 overflow-hidden">
                      {achievement.achievementImageIcon ? (
                        <img 
                          src={achievement.achievementImageIcon} 
                          alt={achievement.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Trophy className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {achievement.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          {format(new Date(achievement.dateOfAchievement), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}