"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, ArrowRight } from "lucide-react"

interface InstitutionCompletionStepProps {
  profileData: any
  completionPercentage: number
}

export default function InstitutionCompletionStep({
  profileData,
  completionPercentage,
}: InstitutionCompletionStepProps) {
  const getCompletionMessage = () => {
    if (completionPercentage === 100) {
      return "Congratulations! Your institution profile is complete."
    } else if (completionPercentage >= 75) {
      return "Great job! Your institution profile is almost complete."
    } else if (completionPercentage >= 50) {
      return "You're making good progress on your institution profile."
    } else {
      return "You've started setting up your institution profile."
    }
  }

  const getNextSteps = () => {
    const steps = []

    if (!profileData.institutionInfo.logo) {
      steps.push("Add your institution's logo to make your profile more recognizable")
    }

    if (!profileData.institutionInfo.coverImage) {
      steps.push("Add a cover image to showcase your institution")
    }

    if (!profileData.institutionInfo.description || profileData.institutionInfo.description.length < 10) {
      steps.push("Complete your institution description to tell students about your offerings")
    }

    if (!profileData.programs || profileData.programs.length === 0) {
      steps.push("Add programs to showcase what your institution offers")
    }

    if (!profileData.events || profileData.events.length === 0) {
      steps.push("Add events to engage with students")
    }

    if (!profileData.gallery || profileData.gallery.length === 0) {
      steps.push("Add photos to your gallery to showcase your institution")
    }

    return steps.length > 0
      ? steps
      : [
          "Start connecting with students interested in your institution",
          "Create educational content to showcase your programs",
          "Engage with the PathPiper community",
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
        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12 text-purple-500" />
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
            className="h-full bg-gradient-to-r from-purple-400 to-purple-500"
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
              <div className="h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-0.5">
                <svg className="h-3 w-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-slate-600">{step}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Link href="/institution-dashboard">
          <Button className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white rounded-full px-8 py-6 w-full md:w-auto">
            Go to Institution Dashboard <ArrowRight size={16} className="ml-2" />
          </Button>
        </Link>
        <Link href="/institution-profile">
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
            <p className="text-sm text-slate-700">Ready to connect with students!</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
