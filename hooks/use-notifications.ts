
import { useState, useEffect } from 'react'

export function useNotifications() {
  const [connectionRequestCount, setConnectionRequestCount] = useState(0)
  const [circleInvitationCount, setCircleInvitationCount] = useState(0)
  const [verificationRequestCount, setVerificationRequestCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotificationCounts = async () => {
    try {
      setLoading(true)
      const [connectionResponse, circleResponse, verificationResponse] = await Promise.all([
        fetch('/api/connections/requests?type=received', { credentials: 'include' }),
        fetch('/api/circles/invitations?type=received', { credentials: 'include' }),
        fetch('/api/education/verification', { credentials: 'include' })
      ])

      if (connectionResponse.ok) {
        const requests = await connectionResponse.json()
        const pendingRequests = requests.filter((req: any) => req.status === 'pending')
        setConnectionRequestCount(pendingRequests.length)
      } else {
        setConnectionRequestCount(0)
      }

      if (circleResponse.ok) {
        const invitations = await circleResponse.json()
        const pendingInvitations = invitations.filter((inv: any) => inv.status === 'pending')
        setCircleInvitationCount(pendingInvitations.length)
      } else {
        setCircleInvitationCount(0)
      }

      if (verificationResponse.ok) {
        const data = await verificationResponse.json()
        // Ensure we get the actual array length, defaulting to 0 if undefined or empty
        const verificationRequests = data.verificationRequests || []
        setVerificationRequestCount(verificationRequests.length)
      } else {
        setVerificationRequestCount(0)
      }
    } catch (error) {
      console.error('Error fetching notification counts:', error)
      // Reset all counts to 0 on error
      setConnectionRequestCount(0)
      setCircleInvitationCount(0)
      setVerificationRequestCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotificationCounts()
    
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchNotificationCounts, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const totalCount = connectionRequestCount + circleInvitationCount + verificationRequestCount

  return {
    connectionRequestCount,
    circleInvitationCount,
    verificationRequestCount,
    totalCount,
    loading,
    refetch: fetchNotificationCounts
  }
}
