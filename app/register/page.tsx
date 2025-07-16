"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import RoleSelection from "@/components/registration/role-selection"
import StudentRegistration from "@/components/registration/student-registration"
import MentorRegistration from "@/components/registration/mentor-registration"
import InstitutionRegistration from "@/components/registration/institution-registration"

export type UserRole = "student" | "mentor" | "institution"

export default function Register() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [registrationComplete, setRegistrationComplete] = useState(false)

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
  }

  const handleRegistrationComplete = () => {
    setRegistrationComplete(true)
  }

  const resetRegistration = () => {
    setSelectedRole(null)
    setRegistrationComplete(false)
  }

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
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
        <div className="flex items-center gap-2">
          <span className="text-slate-600">Already have an account?</span>
          <Link href="/login">
            <Button variant="ghost" className="text-teal-500 hover:text-teal-600 hover:bg-teal-50">
              Log In
            </Button>
          </Link>
        </div>
      </header>

      {/* Registration Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden p-6 md:p-10">
          {!selectedRole ? (
            <RoleSelection onSelectRole={handleRoleSelect} />
          ) : registrationComplete ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-4">Registration Complete!</h2>
              <p className="text-slate-600 mb-6">
                Thank you for joining PathPiper. You can now start exploring the platform.
              </p>
              <Button
                onClick={resetRegistration}
                className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full px-8 py-6"
              >
                Register as Another Role
              </Button>
            </motion.div>
          ) : selectedRole === "student" ? (
            <StudentRegistration onComplete={handleRegistrationComplete} />
          ) : selectedRole === "mentor" ? (
            <MentorRegistration onComplete={handleRegistrationComplete} />
          ) : selectedRole === "institution" ? (
            <InstitutionRegistration onComplete={handleRegistrationComplete} />
          ) : null}
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
