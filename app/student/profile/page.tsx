"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import InternalNavbar from '@/components/internal-navbar'
import Footer from '@/components/footer'
import ProfileHeader from '@/components/profile/profile-header'
import CircleView from '@/components/circle-view'
import { fetchStudentProfile } from '@/utils/api'

export default function StudentProfilePage() {
  const { user: currentUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [studentData, setStudentData] = useState(null)
  const [circles, setCircles] = useState([])
  const [circleInvitations, setCircleInvitations] = useState([])
  const [connectionRequestsSent, setConnectionRequestsSent] = useState([])
  const [connectionRequestsReceived, setConnectionRequestsReceived] = useState([])
  const [achievements, setAchievements] = useState([])
  const [connectionCounts, setConnectionCounts] = useState({
    connections: 0,
    mutualConnections: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    if (!currentUser?.id) return

    setLoading(true)
    try {
      const data = await fetchStudentProfile(currentUser.id)
      setStudentData(data)
      setCircleInvitations(data.circle_invitations || [])
      setConnectionRequestsSent(data.connection_requests_sent || [])
      setConnectionRequestsReceived(data.connection_requests_received || [])
      setAchievements(data.achievements || [])
      setConnectionCounts({
        connections: data.connections_count || 0,
        mutualConnections: data.mutual_connections_count || 0,
      })
    } catch (error) {
      console.error('Error fetching student profile:', error)
      // Handle error appropriately, maybe redirect or show an error message
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && currentUser?.id) {
      fetchData()
    } else if (!authLoading && !currentUser) {
      router.replace('/login')
    }
  }, [currentUser, authLoading, router])

  // Handle circles update
  const handleCirclesUpdate = () => {
    console.log('🔄 Refreshing circles data...')
    // Force refresh by clearing cache and refetching
    setStudentData(null)
    fetchData()
  }

  // Extract and combine circles from student data
  useEffect(() => {
    if (studentData && typeof studentData === 'object') {
      let combinedCircles = []

      if (Array.isArray(studentData)) {
        // If studentData is an array, get first element
        const student = studentData[0]
        if (student) {
          const createdCircles = student.created_circles || []
          const memberCircles = student.circles || []
          combinedCircles = [...createdCircles, ...memberCircles]
        }
      } else {
        // If studentData is an object
        const createdCircles = studentData.created_circles || []
        const memberCircles = studentData.circles || []
        combinedCircles = [...createdCircles, ...memberCircles]
      }

      console.log('🔍 StudentProfilePage: Extracting circles:', {
        totalCircles: combinedCircles.length,
        combinedCircles
      })

      if (combinedCircles.length > 0) {
        setCircles(combinedCircles)
      }
    }
  }, [studentData])

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading profile...</p>
      </div>
    )
  }

  if (!currentUser) {
    // This case should ideally be handled by the router.replace in useEffect
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <InternalNavbar />
      <main className="container mx-auto py-8 px-4">
        <ProfileHeader
          student={studentData}
          currentUser={currentUser}
          connectionCounts={connectionCounts}
          isViewMode={false}
          isShareMode={false}
          circles={circles}
          onCirclesUpdate={handleCirclesUpdate}
          achievements={achievements}
          connectionRequestsSent={connectionRequestsSent}
          connectionRequestsReceived={connectionRequestsReceived}
          circleInvitations={circleInvitations}
        />

        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CircleView
            title="Your Circles"
            circles={circles}
            currentUser={currentUser}
            onCirclesUpdate={handleCirclesUpdate}
          />
          <CircleView
            title="Invitations"
            circles={circleInvitations}
            currentUser={currentUser}
             invitaciónMode={true}
            onCirclesUpdate={handleCirclesUpdate}
          />
          {/* Add other relevant sections here */}
        </section>
      </main>
      <Footer />
    </div>
  )
}