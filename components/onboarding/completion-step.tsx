"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, ArrowRight } from "lucide-react"

interface CompletionStepProps {
  profileData?: any
  completionPercentage?: number
}

export default function CompletionStep({ profileData = {}, completionPercentage = 0 }: CompletionStepProps) {
  const getCompletionMessage = () => {
    if (completionPercentage === 100) {
      return "Congratulations! Your profile is complete."
    } else if (completionPercentage >= 75) {
      return "Great job! Your profile is almost complete."
    } else if (completionPercentage >= 50) {
      return "You're making good progress on your profile."
    } else {
      return "You've started setting up your profile."
    }
  }

  const getNextSteps = () => {
    const steps = []
    const personalInfo = profileData?.personalInfo || {}
    const interests = profileData?.interests || []
    const goals = profileData?.goals || []
    const skills = profileData?.skills || []

    if (!personalInfo.profileImage) {
      steps.push("Add a profile picture to make your profile more personal")
    }

    if (!personalInfo.bio || personalInfo.bio.length < 10) {
      steps.push("Complete your bio to tell others about yourself")
    }

    if (interests.length < 3) {
      steps.push("Add more interests to get better recommendations")
    }

    if (goals.length === 0) {
      steps.push("Set some goals to help us connect you with the right mentors")
    }

    if (skills.length < 2) {
      steps.push("Add skills to showcase your abilities")
    }

    return steps.length > 0
      ? steps
      : [
          "Explore the platform and connect with mentors",
          "Join communities related to your interests",
          "Check out recommended learning resources",
        ]
  }

  return (
    <div className="text-center py-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12 text-teal-500" />
        </div>
      </motion.div>

      <h2 className="text-2xl md:text-3xl font-bold mb-4">{getCompletionMessage()}</h2>

      <div className="mb-8 max-w-md mx-auto">
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>Profile Completion</span>
          <span>{completionPercentage}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-400 to-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
        <h3 className="font-semibold text-slate-800 mb-4">Next Steps</h3>
        <ul className="space-y-3">
          {getNextSteps().map((step, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="flex items-start"
            >
              <div className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center mr-3 mt-0.5">
                <svg className="h-3 w-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-slate-600">{step}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Link href="/feed">
          <Button className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full px-8 py-6 w-full md:w-auto">
            Go to Feed <ArrowRight size={16} className="ml-2" />
          </Button>
        </Link>
        <Link href="/student/profile">
          <Button variant="outline" className="rounded-full px-8 py-6 border-slate-300 w-full md:w-auto">
            View Your Profile
          </Button>
        </Link>
      </div>

      {/* Pip character at the bottom */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="relative h-32 w-32 mx-auto">
          <Image src="/images/pip-mascot.png" alt="Pip" width={128} height={128} className="h-full w-auto" />
          <div className="absolute -top-10 right-0 bg-white rounded-lg p-2 shadow-md">
            <p className="text-sm text-slate-700">Great job setting up your profile!</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
