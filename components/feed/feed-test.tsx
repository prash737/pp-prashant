
"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Heart,
  MessageCircle,
  Send
} from 'lucide-react'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message?: string
  duration?: number
}

export default function FeedTest() {
  const { user } = useAuth()
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const updateTest = (name: string, status: TestResult['status'], message?: string, duration?: number) => {
    setTests(prev => prev.map(test => 
      test.name === name 
        ? { ...test, status, message, duration }
        : test
    ))
  }

  const runTests = async () => {
    if (!user) {
      toast.error("Please log in to run tests")
      return
    }

    setIsRunning(true)
    const testList = [
      'Fetch Feed Posts',
      'Create New Post',
      'Like Post',
      'Create Trail',
      'Like Trail',
      'Enhanced Reactions',
      'Delete Trail',
      'Delete Post'
    ]

    setTests(testList.map(name => ({ name, status: 'pending' })))

    // Test 1: Fetch Feed Posts
    try {
      const start = Date.now()
      const response = await fetch('/api/feed/posts', {
        credentials: 'include'
      })
      const duration = Date.now() - start
      
      if (response.ok) {
        const data = await response.json()
        updateTest('Fetch Feed Posts', 'success', `Fetched ${data.posts?.length || 0} posts`, duration)
      } else {
        updateTest('Fetch Feed Posts', 'error', `HTTP ${response.status}`)
      }
    } catch (error) {
      updateTest('Fetch Feed Posts', 'error', error instanceof Error ? error.message : 'Unknown error')
    }

    // Test 2: Create New Post
    let testPostId: string | null = null
    try {
      const start = Date.now()
      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: `Test post created at ${new Date().toISOString()}`
        })
      })
      const duration = Date.now() - start
      
      if (response.ok) {
        const data = await response.json()
        testPostId = data.post?.id
        updateTest('Create New Post', 'success', `Post ID: ${testPostId}`, duration)
      } else {
        updateTest('Create New Post', 'error', `HTTP ${response.status}`)
      }
    } catch (error) {
      updateTest('Create New Post', 'error', error instanceof Error ? error.message : 'Unknown error')
    }

    // Test 3: Like Post
    if (testPostId) {
      try {
        const start = Date.now()
        const response = await fetch(`/api/feed/posts/${testPostId}/like`, {
          method: 'POST',
          credentials: 'include'
        })
        const duration = Date.now() - start
        
        if (response.ok) {
          const data = await response.json()
          updateTest('Like Post', 'success', `Liked: ${data.liked}`, duration)
        } else {
          updateTest('Like Post', 'error', `HTTP ${response.status}`)
        }
      } catch (error) {
        updateTest('Like Post', 'error', error instanceof Error ? error.message : 'Unknown error')
      }
    } else {
      updateTest('Like Post', 'error', 'No test post available')
    }

    // Test 4: Create Trail
    let testTrailId: string | null = null
    if (testPostId) {
      try {
        const start = Date.now()
        const response = await fetch(`/api/feed/posts/${testPostId}/trails`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            content: `Test trail created at ${new Date().toISOString()}`
          })
        })
        const duration = Date.now() - start
        
        if (response.ok) {
          const data = await response.json()
          testTrailId = data.trail?.id
          updateTest('Create Trail', 'success', `Trail ID: ${testTrailId}`, duration)
        } else {
          updateTest('Create Trail', 'error', `HTTP ${response.status}`)
        }
      } catch (error) {
        updateTest('Create Trail', 'error', error instanceof Error ? error.message : 'Unknown error')
      }
    } else {
      updateTest('Create Trail', 'error', 'No test post available')
    }

    // Test 5: Like Trail
    if (testPostId && testTrailId) {
      try {
        const start = Date.now()
        const response = await fetch(`/api/feed/posts/${testPostId}/trails/${testTrailId}/like`, {
          method: 'POST',
          credentials: 'include'
        })
        const duration = Date.now() - start
        
        if (response.ok) {
          const data = await response.json()
          updateTest('Like Trail', 'success', `Liked: ${data.liked}`, duration)
        } else {
          updateTest('Like Trail', 'error', `HTTP ${response.status}`)
        }
      } catch (error) {
        updateTest('Like Trail', 'error', error instanceof Error ? error.message : 'Unknown error')
      }
    } else {
      updateTest('Like Trail', 'error', 'No test trail available')
    }

    // Test 6: Enhanced Reactions
    if (testPostId) {
      try {
        const start = Date.now()
        const response = await fetch(`/api/feed/posts/${testPostId}/react`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ reactionType: 'love' })
        })
        const duration = Date.now() - start
        
        if (response.ok) {
          const data = await response.json()
          updateTest('Enhanced Reactions', 'success', `Reaction: ${data.reactionType}`, duration)
        } else {
          updateTest('Enhanced Reactions', 'error', `HTTP ${response.status}`)
        }
      } catch (error) {
        updateTest('Enhanced Reactions', 'error', error instanceof Error ? error.message : 'Unknown error')
      }
    } else {
      updateTest('Enhanced Reactions', 'error', 'No test post available')
    }

    // Test 7: Delete Trail
    if (testPostId && testTrailId) {
      try {
        const start = Date.now()
        const response = await fetch(`/api/feed/posts/${testPostId}/trails/${testTrailId}`, {
          method: 'DELETE',
          credentials: 'include'
        })
        const duration = Date.now() - start
        
        if (response.ok) {
          updateTest('Delete Trail', 'success', 'Trail deleted successfully', duration)
        } else {
          updateTest('Delete Trail', 'error', `HTTP ${response.status}`)
        }
      } catch (error) {
        updateTest('Delete Trail', 'error', error instanceof Error ? error.message : 'Unknown error')
      }
    } else {
      updateTest('Delete Trail', 'error', 'No test trail available')
    }

    // Test 8: Delete Post
    if (testPostId) {
      try {
        const start = Date.now()
        const response = await fetch(`/api/feed/posts/${testPostId}/delete`, {
          method: 'DELETE',
          credentials: 'include'
        })
        const duration = Date.now() - start
        
        if (response.ok) {
          updateTest('Delete Post', 'success', 'Post deleted successfully', duration)
        } else {
          updateTest('Delete Post', 'error', `HTTP ${response.status}`)
        }
      } catch (error) {
        updateTest('Delete Post', 'error', error instanceof Error ? error.message : 'Unknown error')
      }
    } else {
      updateTest('Delete Post', 'error', 'No test post available')
    }

    setIsRunning(false)
    toast.success("Feed tests completed!")
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const successCount = tests.filter(t => t.status === 'success').length
  const errorCount = tests.filter(t => t.status === 'error').length
  const pendingCount = tests.filter(t => t.status === 'pending').length

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Feed System Tests</span>
          <Button 
            onClick={runTests} 
            disabled={isRunning || !user}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Run Tests
              </>
            )}
          </Button>
        </CardTitle>
        
        {tests.length > 0 && (
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">✓ {successCount} Passed</span>
            <span className="text-red-600">✗ {errorCount} Failed</span>
            <span className="text-yellow-600">⏳ {pendingCount} Pending</span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {!user && (
          <div className="text-center p-8 text-gray-500">
            Please log in to run feed tests
          </div>
        )}

        {tests.length > 0 && (
          <div className="space-y-3">
            {tests.map((test, index) => (
              <div 
                key={test.name}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <span className="font-medium">{test.name}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  {test.duration && (
                    <span className="text-sm text-gray-500">{test.duration}ms</span>
                  )}
                  {getStatusBadge(test.status)}
                </div>
                
                {test.message && (
                  <div className="text-sm text-gray-600 mt-1">
                    {test.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
