"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Features from "@/components/features"
import Mentorship from "@/components/mentorship"
import Safety from "@/components/safety"
import Institutions from "@/components/institutions"
import CTA from "@/components/cta"
import Footer from "@/components/footer"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [checkingParentAuth, setCheckingParentAuth] = useState(true)

  useEffect(() => {
    const checkParentAuth = async () => {
      try {
        // Check if parent is logged in
        const parentResponse = await fetch('/api/parent/children', {
          credentials: 'include'
        })

        if (parentResponse.ok) {
          // Parent is authenticated, redirect to dashboard
          router.push('/parent/dashboard')
          return
        }
      } catch (error) {
        // Parent not authenticated, continue with normal flow
      }

      setCheckingParentAuth(false)
    }

    checkParentAuth()
  }, [router])

  useEffect(() => {
    if (!loading && !checkingParentAuth && user) {
      // Redirect authenticated users to their appropriate dashboard
      if (user.role === 'student') {
        router.push('/feed')
      } else if (user.role === 'mentor') {
        router.push('/mentor/profile')
      } else if (user.role === 'institution') {
        router.push('/institution/profile')
      }
    }
  }, [user, loading, checkingParentAuth, router])

  if (loading || checkingParentAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
      </div>
    )
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-white overflow-hidden">
        <div className="bg-gradient-to-b from-slate-50 to-white">
          <Navbar />
          <main className="overflow-hidden">
            <Hero />
            <Features />
            <Mentorship />
            <Institutions />
            <Safety />
            <CTA />
          </main>
          <Footer />
        </div>
      </div>
    )
  }

  return null // Render nothing if user is authenticated (redirect handled in useEffect)
}