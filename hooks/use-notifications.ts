
import { useState, useEffect } from 'react'

export function useNotifications() {
  const [connectionRequestCount, setConnectionRequestCount] = useState(0)
  const [circleInvitationCount, setCircleInvitationCount] = useState(0)
  const [verificationRequestCount, setVerificationRequestCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotificationCounts = async () => {
    try {
      const [connectionResponse, circleResponse, verificationResponse] = await Promise.all([
        fetch('/api/connections/requests?type=received'),
        fetch('/api/circles/invitations?type=received'),
        fetch('/api/education/verification')
      ])

      if (connectionResponse.ok) {
        const requests = await connectionResponse.json()
        const pendingRequests = requests.filter((req: any) => req.status === 'pending')
        setConnectionRequestCount(pendingRequests.length)
      }

      if (circleResponse.ok) {
        const invitations = await circleResponse.json()
        const pendingInvitations = invitations.filter((inv: any) => inv.status === 'pending')
        setCircleInvitationCount(pendingInvitations.length)
      }

      if (verificationResponse.ok) {
        const data = await verificationResponse.json()
        setVerificationRequestCount(data.verificationRequests?.length || 0)
      }
    } catch (error) {
      console.error('Error fetching notification counts:', error)
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
