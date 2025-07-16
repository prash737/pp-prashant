"use client"

import { useRouter } from "next/navigation"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CompletionStepProps {
  profileData: any
  completionPercentage: number
}

export default function MentorCompletionStep({ profileData, completionPercentage }: CompletionStepProps) {
  const router = useRouter()

  const handleGoToDashboard = () => {
    // Navigate to the mentor dashboard
    router.push("/mentor/dashboard")
  }

  const handleViewProfile = () => {
    // Navigate to the mentor profile
    router.push("/mentor/profile")
  }

  // Calculate how many sections are completed
  const completedSections = Object.keys(profileData).filter((key) => {
    if (Array.isArray(profileData[key])) {
      return profileData[key].length > 0
    }
    if (typeof profileData[key] === "object" && profileData[key] !== null) {
      return Object.values(profileData[key]).some((val) => val)
    }
    return !!profileData[key]
  }).length

  const totalSections = Object.keys(profileData).length

  return (
    <div className="space-y-8 py-4">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-2">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Profile Setup Complete!</h2>
        <p className="text-slate-600 max-w-md mx-auto">
          You've successfully set up your mentor profile. You're now ready to start your mentoring journey on PathPiper!
        </p>
      </div>

      <div className="bg-orange-50 rounded-xl p-6 max-w-md mx-auto">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-orange-200">
            {profileData.personalInfo.profileImage ? (
              <AvatarImage src={profileData.personalInfo.profileImage || "/placeholder.svg"} alt="Profile" />
            ) : (
              <AvatarFallback className="bg-orange-100 text-orange-800 text-xl">
                {profileData.personalInfo.fullName
                  ? profileData.personalInfo.fullName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                  : "M"}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex-1">
            <h3 className="font-semibold text-lg text-slate-800">{profileData.personalInfo.fullName || "Your Name"}</h3>
            <p className="text-slate-600 text-sm">
              {profileData.personalInfo.profession || "Profession"}
              {profileData.personalInfo.organization ? ` at ${profileData.personalInfo.organization}` : ""}
            </p>
            <p className="text-slate-600 text-sm mt-1">{profileData.personalInfo.location || "Location"}</p>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Profile completion</span>
                <span className="text-orange-600 font-medium">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2 bg-orange-100" indicatorClassName="bg-orange-500" />
              <p className="text-xs text-slate-500 mt-1">
                {completedSections} of {totalSections} sections completed
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-w-md mx-auto">
        <h3 className="font-medium text-slate-800">What's next?</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <div className="rounded-full bg-green-100 p-1 mt-0.5">
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
            <span className="text-sm text-slate-600">Your profile is now visible to students looking for mentors</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="rounded-full bg-green-100 p-1 mt-0.5">
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
            <span className="text-sm text-slate-600">You can now receive mentorship requests from students</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="rounded-full bg-green-100 p-1 mt-0.5">
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
            <span className="text-sm text-slate-600">Access your dashboard to manage your mentoring activities</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Button
          onClick={handleViewProfile}
          variant="outline"
          className="border-orange-200 text-orange-600 hover:bg-orange-50"
        >
          View My Profile
        </Button>
        <Button onClick={handleGoToDashboard} className="bg-orange-500 hover:bg-orange-600 text-white">
          Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
