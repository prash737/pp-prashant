
"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'

interface ProfileLoadingStep {
  id: string
  message: string
  description: string
  icon: string
  progress: number
}

interface ProfilePipLoaderProps {
  isVisible: boolean
  loadingType?: 'student' | 'parent' | 'institution'
}

const studentSteps: ProfileLoadingStep[] = [
  {
    id: 'profile',
    message: "👤 Loading your profile...",
    description: "Getting your basic information ready",
    icon: "👤",
    progress: 25
  },
  {
    id: 'education',
    message: "🎓 Fetching education history...",
    description: "Loading your academic journey",
    icon: "🎓",
    progress: 50
  },
  {
    id: 'achievements',
    message: "🏆 Gathering achievements...",
    description: "Collecting your accomplishments",
    icon: "🏆",
    progress: 75
  },
  {
    id: 'complete',
    message: "✨ Profile ready!",
    description: "Everything looks perfect!",
    icon: "✨",
    progress: 100
  }
]

const parentSteps: ProfileLoadingStep[] = [
  {
    id: 'dashboard',
    message: "📊 Setting up dashboard...",
    description: "Preparing your parent controls",
    icon: "📊",
    progress: 33
  },
  {
    id: 'children',
    message: "👨‍👩‍👧‍👦 Loading children profiles...",
    description: "Fetching your children's information",
    icon: "👨‍👩‍👧‍👦",
    progress: 66
  },
  {
    id: 'complete',
    message: "🏠 Welcome home!",
    description: "Your family dashboard is ready",
    icon: "🏠",
    progress: 100
  }
]

export default function ProfilePipLoader({ isVisible, loadingType = 'student' }: ProfilePipLoaderProps) {
  const steps = loadingType === 'parent' ? parentSteps : studentSteps
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [animatedProgress, setAnimatedProgress] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        return prev < steps.length - 1 ? prev + 1 : prev
      })
    }, 1200)

    return () => clearInterval(interval)
  }, [isVisible, steps.length])

  useEffect(() => {
    const currentStep = steps[currentStepIndex]
    if (currentStep) {
      const timer = setTimeout(() => {
        setAnimatedProgress(currentStep.progress)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [currentStepIndex, steps])

  if (!isVisible) return null

  const currentStep = steps[currentStepIndex]

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-md border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            
            {/* Pip with animated elements */}
            <div className="relative">
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2.5, 
                  ease: "easeInOut" 
                }}
                style={{
                  filter: "drop-shadow(0px 8px 12px rgba(59, 130, 246, 0.3))",
                }}
              >
                <Image
                  src="/images/pip-character.png"
                  width={100}
                  height={100}
                  alt="Pip Character"
                  className="w-20 h-20"
                  priority
                />
              </motion.div>

              {/* Data particles */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: 'linear-gradient(45deg, #3B82F6, #10B981)',
                    top: 10 + (i * 15),
                    left: -20 + (i * 10),
                  }}
                  animate={{
                    x: [0, 60, 120],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Progress Bar with Icon */}
            <div className="w-full space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <motion.div
                  key={currentStep?.icon}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-2xl"
                >
                  {currentStep?.icon}
                </motion.div>
                <div className="text-center">
                  <div className="font-semibold text-gray-800">
                    Loading Your Profile
                  </div>
                </div>
              </div>

              <Progress 
                value={animatedProgress} 
                className="h-2 bg-gray-200"
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-center space-y-2"
                >
                  <div className="font-medium text-gray-700">
                    {currentStep?.message}
                  </div>
                  <div className="text-sm text-gray-500">
                    {currentStep?.description}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-center space-x-1">
                {steps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index <= currentStepIndex
                        ? 'bg-gradient-to-r from-blue-400 to-teal-500'
                        : 'bg-gray-300'
                    }`}
                    animate={index === currentStepIndex ? {
                      scale: [1, 1.2, 1],
                    } : {}}
                    transition={{
                      duration: 1,
                      repeat: index === currentStepIndex ? Infinity : 0,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
