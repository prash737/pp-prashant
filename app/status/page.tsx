
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function StatusPage() {
  const [prismaStatus, setPrismaStatus] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  const checkConnections = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/status')
      const data = await response.json()
      setPrismaStatus(data.prismaConnected)
    } catch (error) {
      console.error('Error checking connections:', error)
      setPrismaStatus(false)
    }
    setLoading(false)
  }

  useEffect(() => {
    checkConnections()
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Database Connection Status</h1>
      <div className="grid gap-4">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Prisma Status</h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              prismaStatus === null ? 'bg-gray-400' :
              prismaStatus ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span>{prismaStatus === null ? 'Checking...' : 
                   prismaStatus ? 'Connected' : 'Disconnected'}</span>
          </div>
        </Card>

        <Button 
          onClick={checkConnections} 
          disabled={loading}
          className="w-fit"
        >
          {loading ? 'Checking...' : 'Check Again'}
        </Button>
      </div>
    </div>
  )
}
