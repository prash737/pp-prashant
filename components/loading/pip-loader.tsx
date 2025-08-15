"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

interface LoadingStep {
  id: string
  message: string
  description: string
  progress: number
}

interface PipLoaderProps {
  isVisible: boolean
  currentStep?: string
  userType?: string
  onComplete?: () => void
}

const loadingSteps: LoadingStep[] = [
  {
    id: 'auth',
    message: "🔐 Authenticating your credentials...",
    description: "Verifying your login details",
    progress: 15
  },
  {
    id: 'profile',
    message: "👤 Loading your profile...",
    description: "Fetching your personal information",
    progress: 30
  },
  {
    id: 'education',
    message: "🎓 Gathering education history...",
    description: "Loading your academic background",
    progress: 45
  },
  {
    id: 'interests',
    message: "💡 Collecting your interests...",
    description: "Retrieving your passions and hobbies",
    progress: 60
  },
  {
    id: 'skills',
    message: "🛠️ Loading your skills...",
    description: "Gathering your abilities and expertise",
    progress: 75
  },
  {
    id: 'connections',
    message: "🔗 Setting up connections...",
    description: "Loading your network and circles",
    progress: 90
  },
  {
    id: 'complete',
    message: "✨ Almost ready!",
    description: "Preparing your personalized experience",
    progress: 100
  }
]

export default function PipLoader({ isVisible, currentStep, userType, onComplete }: PipLoaderProps) {
  const router = useRouter()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [pipMessage, setPipMessage] = useState("Let me help you get started!")

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        const nextIndex = prev < loadingSteps.length - 1 ? prev + 1 : prev
        const step = loadingSteps[nextIndex]

        // Update Pip's message based on progress
        if (step.progress <= 30) {
          setPipMessage("I'm setting up your profile... almost there!")
        } else if (step.progress <= 60) {
          setPipMessage("Loading your awesome data! This is exciting!")
        } else if (step.progress <= 90) {
          setPipMessage("Gathering all your information! Looking great!")
        } else {
          setPipMessage("Perfect! Everything looks amazing! 🎉")
        }

        return nextIndex
      })
    }, 800) // Faster progression for better UX

    return () => clearInterval(interval)
  }, [isVisible])

  useEffect(() => {
    const currentStepData = loadingSteps[currentStepIndex]
    if (currentStepData) {
      // Animate progress smoothly
      const timer = setTimeout(() => {
        setAnimatedProgress(currentStepData.progress)
      }, 300)

      // Trigger onComplete when the last step is reached
      if (currentStepData.progress === 100) {
        setTimeout(() => {
          if (onComplete) {
            onComplete()
          }
        }, 1000) // Delay the completion slightly to show the final state
      }

      return () => clearTimeout(timer)
    }
  }, [currentStepIndex, isVisible, userType, onComplete, router])

  if (!isVisible) return null

  const currentLoadingStep = loadingSteps[currentStepIndex]

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white/90 backdrop-blur-md border-0 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">

            {/* Animated Pip Character */}
            <div className="relative">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3, 
                  ease: "easeInOut" 
                }}
                className="relative"
                style={{
                  filter: "drop-shadow(0px 10px 15px rgba(45, 212, 191, 0.3))",
                }}
              >
                <Image
                  src="/images/pip-character.png"
                  width={120}
                  height={120}
                  alt="Pip Character"
                  className="w-24 h-24"
                  priority
                />
              </motion.div>

              {/* Pip's Speech Bubble */}
              <motion.div
                key={pipMessage}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute -top-16 -right-8 bg-white rounded-2xl p-3 shadow-lg border-2 border-teal-200 max-w-48"
              >
                <div className="text-sm font-medium text-gray-700 text-center">
                  {pipMessage}
                </div>
                <div className="absolute bottom-0 left-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-teal-200 transform translate-y-full"></div>
                <div className="absolute bottom-0 left-8 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white transform translate-y-full"></div>
              </motion.div>

              {/* Floating particles around Pip */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full"
                  style={{
                    top: Math.random() * 100,
                    left: Math.random() * 100,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 1, 0.3],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Progress Section */}
            <div className="w-full space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Setting up your profile...
                </h3>
              </div>

              {/* Animated Progress Bar */}
              <div className="space-y-3">
                <Progress 
                  value={animatedProgress} 
                  className="h-3 bg-gray-200"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{animatedProgress}% Complete</span>
                  <span className="font-medium text-teal-600">
                    {currentLoadingStep?.progress === 100 ? 'Ready!' : 'Loading...'}
                  </span>
                </div>
              </div>

              {/* Current Step Information */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-100"
                >
                  <div className="text-center space-y-2">
                    <div className="font-semibold text-gray-800">
                      {currentLoadingStep?.message}
                    </div>
                    <div className="text-sm text-gray-600">
                      {currentLoadingStep?.description}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Loading Steps Indicator */}
              <div className="flex justify-center space-x-2 mt-4">
                {loadingSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index <= currentStepIndex
                        ? 'bg-gradient-to-r from-teal-400 to-blue-500'
                        : 'bg-gray-200'
                    }`}
                    animate={index === currentStepIndex ? {
                      scale: [1, 1.3, 1],
                    } : {}}
                    transition={{
                      duration: 1,
                      repeat: index === currentStepIndex ? Infinity : 0,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Fun Facts */}
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center text-sm text-gray-500 mt-4"
            >
              💡 Tip: Your profile helps us suggest better connections and opportunities!
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}