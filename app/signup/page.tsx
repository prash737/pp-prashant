"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle } from "lucide-react"
import RoleSelection from "@/components/registration/role-selection"
import StudentRegistration from "@/components/registration/student-registration"
import MentorRegistration from "@/components/registration/mentor-registration"
import InstitutionRegistration from "@/components/registration/institution-registration"

export type UserRole = "student" | "mentor" | "institution" | "parent" | null

export default function Signup() {
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<UserRole>(null)
  const [isStudentUnder16, setIsStudentUnder16] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Track mouse position for interactive elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      // Calculate mouse position relative to container (0-100)
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      setMousePosition({ x, y })
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove)
      }
    }
  }, [])

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setStep(2)
  }

  const handleStudentComplete = (isUnder16: boolean) => {
    setIsStudentUnder16(isUnder16)
    setStep(3)
  }

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1)
      if (step === 2) {
        setSelectedRole(null)
      }
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center bg-white border-b border-slate-200">
        <Link href="/" className="h-10">
          <Image
            src="/images/pathpiper-logo-full.png"
            width={180}
            height={40}
            alt="PathPiper Logo"
            className="h-full w-auto"
          />
        </Link>
        <div>
          <Link href="/login">
            <Button variant="ghost" className="text-teal-500 hover:text-teal-600 hover:bg-teal-50">
              Log In
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left side - Visual content */}
        <div className="hidden md:block md:w-1/2 relative pt-[20px] pb-[20px]">
          <div
            ref={containerRef}
            className="ml-[20px] rounded-2xl relative overflow-hidden flex flex-col p-8 h-full"
            style={{ width: "calc(100% - 20px)" }}
          >
            {/* Interactive gradient background */}
            <div
              className="absolute inset-0 opacity-60 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                  rgba(45, 212, 191, 0.5) 0%, 
                  rgba(147, 51, 234, 0.3) 25%, 
                  rgba(249, 115, 22, 0.2) 50%, 
                  rgba(59, 130, 246, 0.1) 75%, 
                  rgba(15, 23, 42, 0) 100%)`,
              }}
            />

            {/* Hero text from home page - positioned at top left */}
            <div className="z-10 mb-auto">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Start your journey with{" "}
                <span className="bg-gradient-to-r from-orange-500 via-purple-500 to-teal-500 bg-clip-text text-transparent">
                  PathPiper
                </span>
              </h1>
            </div>

            {/* Floating Pip character with bounce effect - larger size */}
            <motion.div
              className="relative z-10 mx-auto my-auto flex-grow flex items-center justify-center py-8"
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 4,
                ease: "easeInOut",
              }}
              style={{
                filter: "drop-shadow(0px 10px 15px rgba(45, 212, 191, 0.3))",
              }}
            >
              <Image
                src="/images/pip-character.png"
                width={500}
                height={500}
                alt="Pip Character"
                className="w-[600px] h-auto"
                priority
              />
            </motion.div>

            {/* Animated floating orbs */}
            <motion.div
              className="absolute w-32 h-32 rounded-full bg-teal-500/20 blur-xl"
              animate={{
                x: [0, 50, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              style={{
                left: `calc(${mousePosition.x / 10}% + 10%)`,
                top: `calc(${mousePosition.y / 10}% + 20%)`,
              }}
            />

            <motion.div
              className="absolute w-40 h-40 rounded-full bg-purple-500/20 blur-xl"
              animate={{
                x: [0, -40, 0],
                y: [0, 20, 0],
              }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              style={{
                right: `calc(${mousePosition.x / 15}% + 10%)`,
                bottom: `calc(${mousePosition.y / 15}% + 20%)`,
              }}
            />

            <motion.div
              className="absolute w-24 h-24 rounded-full bg-yellow-500/20 blur-xl"
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 7,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              style={{
                left: `calc(${mousePosition.x / 12}% + 30%)`,
                bottom: `calc(${mousePosition.y / 12}% + 10%)`,
              }}
            />
          </div>
        </div>

        {/* Right side - Registration form */}
        <div className="w-full md:flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md mx-auto">
            <div className="w-full">
              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 mb-8 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-teal-400 to-blue-500"
                  initial={{ width: "33.33%" }}
                  animate={{ width: `${step * 33.33}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Content */}
              <div className="relative">
                {/* Back Button */}
                {step > 1 && (
                  <button
                    onClick={goBack}
                    className="absolute -top-6 left-0 p-2 text-slate-500 hover:text-teal-500 flex items-center gap-1 z-10"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                )}

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <RoleSelection onSelectRole={handleRoleSelect} />
                      <p className="mt-8 text-center text-gray-500 text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                          Log in
                        </Link>
                      </p>
                    </motion.div>
                  )}

                  {step === 2 && selectedRole === "student" && (
                    <motion.div
                      key="step2-student"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <StudentRegistration onComplete={handleStudentComplete} />
                      <p className="mt-8 text-center text-gray-500 text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                          Log in
                        </Link>
                      </p>
                    </motion.div>
                  )}

                  {step === 2 && selectedRole === "mentor" && (
                    <motion.div
                      key="step2-mentor"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MentorRegistration onComplete={() => setStep(3)} />
                      <p className="mt-8 text-center text-gray-500 text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                          Log in
                        </Link>
                      </p>
                    </motion.div>
                  )}

                  {step === 2 && selectedRole === "institution" && (
                    <motion.div
                      key="step2-institution"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <InstitutionRegistration onComplete={() => setStep(3)} />
                      <p className="mt-8 text-center text-gray-500 text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                          Log in
                        </Link>
                      </p>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="text-center py-10"
                    >
                      <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-10 h-10 text-teal-500" />
                        </div>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-4">Registration Complete!</h2>
                      <p className="text-slate-600 mb-8 max-w-md mx-auto">
                        {selectedRole === "student"
                          ? isStudentUnder16
                            ? "We've sent a verification email to your parent/guardian. Once verified, you can start your journey!"
                            : "We've sent a verification email to your registered email address. Please verify your email to start your journey!"
                          : "We've sent a verification email to your inbox. Please verify your email to continue."}
                      </p>
                      <Link href="/login">
                        <Button className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full px-8 py-6">
                          Continue to Login
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 px-6 bg-white border-t border-slate-200">
        <div className="container mx-auto flex justify-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} PathPiper. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
