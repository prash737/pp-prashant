"use client"

import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import InternalNavbar from '@/components/internal-navbar'
import Footer from '@/components/footer'
import PipLoader from '@/components/loading/pip-loader'

export default function StudentProfileRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If we reach this page, it means something went wrong with direct routing
    // Redirect to the user's profile if they're authenticated
    if (!loading && user?.id) {
      router.replace(`/student/profile/${user.id}`)
    } else if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  // Return null to prevent any flash during redirect
  return null
}