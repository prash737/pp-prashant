
"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface TestResult {
  endpoint: string
  status: number
  success: boolean
  data: any
  error?: string
  responseTime: number
  timestamp: string
}

export default function AuthTestPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [testing, setTesting] = useState(false)

  const addResult = (result: TestResult) => {
    setResults(prev => [result, ...prev])
  }

  const testAPI = async (endpoint: string, options: RequestInit = {}) => {
    const startTime = performance.now()
    
    try {
      const response = await fetch(endpoint, {
        credentials: 'include',
        ...options
      })
      
      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)
      
      let data
      try {
        data = await response.json()
      } catch {
        data = await response.text()
      }

      const result: TestResult = {
        endpoint,
        status: response.status,
        success: response.ok,
        data,
        responseTime,
        timestamp: new Date().toISOString()
      }

      addResult(result)
      return result
    } catch (error) {
      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)
      
      const result: TestResult = {
        endpoint,
        status: 0,
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        timestamp: new Date().toISOString()
      }

      addResult(result)
      return result
    }
  }

  const runSingleTest = async (endpoint: string, testName: string) => {
    setTesting(true)
    console.log(`🧪 Testing ${testName}...`)
    await testAPI(endpoint)
    setTesting(false)
  }

  const runAllTests = async () => {
    setTesting(true)
    setResults([]) // Clear previous results
    
    console.log('🚀 Starting comprehensive auth API tests...')

    // Test 1: Check Token API
    console.log('1. Testing check-token API...')
    await testAPI('/api/auth/check-token')
    await new Promise(resolve => setTimeout(resolve, 500))

    // Test 2: Cookie Check API
    console.log('2. Testing cookie-check API...')
    await testAPI('/api/auth/cookie-check')
    await new Promise(resolve => setTimeout(resolve, 500))

    // Test 3: User API (for comparison)
    console.log('3. Testing user API...')
    await testAPI('/api/auth/user')
    await new Promise(resolve => setTimeout(resolve, 500))

    // Test 4: Check Token with Authorization header
    console.log('4. Testing check-token with auth header...')
    const authToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('sb-access-token='))
      ?.split('=')[1]

    if (authToken) {
      await testAPI('/api/auth/check-token', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
    }

    setTesting(false)
    console.log('✅ All auth tests completed!')
  }

  const clearResults = () => {
    setResults([])
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-500'
    if (status >= 400 && status < 500) return 'bg-yellow-500'
    if (status >= 500) return 'bg-red-500'
    return 'bg-gray-500'
  }

  const formatCookies = () => {
    const cookies = document.cookie.split('; ').filter(Boolean)
    return cookies.length > 0 ? cookies : ['No cookies found']
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Auth API Testing Center
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Test your migrated authentication APIs (check-token & cookie-check)
          </p>
          
          {/* Test Controls */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Button 
              onClick={runAllTests} 
              disabled={testing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {testing ? 'Running Tests...' : '🚀 Run All Tests'}
            </Button>
            
            <Button 
              onClick={() => runSingleTest('/api/auth/check-token', 'Check Token')}
              disabled={testing}
              variant="outline"
            >
              Test Check Token
            </Button>
            
            <Button 
              onClick={() => runSingleTest('/api/auth/cookie-check', 'Cookie Check')}
              disabled={testing}
              variant="outline"
            >
              Test Cookie Check
            </Button>
            
            <Button 
              onClick={() => runSingleTest('/api/auth/register', 'Register')}
              disabled={testing}
              variant="outline"
            >
              Test Register
            </Button>
            
            <Button 
              onClick={() => runSingleTest('/api/auth/logout', 'Logout')}
              disabled={testing}
              variant="outline"
            >
              Test Logout
            </Button>
            
            <Button 
              onClick={() => runSingleTest('/api/auth/verify-student-email/performance-test', 'Verify Student Email')}
              disabled={testing}
              variant="outline"
            >
              Test Student Email Verification
            </Button>
            
            <Button 
              onClick={() => runSingleTest('/api/auth/verify-parent/performance-test', 'Verify Parent')}
              disabled={testing}
              variant="outline"
            >
              Test Parent Verification
            </Button>
            
            <Button 
              onClick={clearResults}
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              Clear Results
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🍪 Current Session Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Browser Cookies:</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                    {formatCookies().map((cookie, i) => (
                      <div key={i} className="mb-1">{cookie}</div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">User Agent:</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {navigator.userAgent}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Endpoints Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 API Endpoints Being Tested
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded">
                  <h4 className="font-semibold text-blue-800">GET /api/auth/check-token</h4>
                  <p className="text-sm text-blue-600">Validates JWT tokens and returns user data</p>
                </div>
                
                <div className="p-3 bg-green-50 rounded">
                  <h4 className="font-semibold text-green-800">GET /api/auth/cookie-check</h4>
                  <p className="text-sm text-green-600">Validates authentication cookies and user existence</p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded">
                  <h4 className="font-semibold text-purple-800">GET /api/auth/user</h4>
                  <p className="text-sm text-purple-600">Full user data API (for comparison)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Test Results
              {results.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {results.length} tests
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tests run yet. Click "Run All Tests" to start testing your APIs.
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(result.status)} text-white`}>
                          {result.status || 'ERROR'}
                        </Badge>
                        <span className="font-semibold">{result.endpoint}</span>
                        <Badge variant="outline">
                          {result.responseTime}ms
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {result.error && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                        <span className="text-red-800 font-semibold">Error: </span>
                        <span className="text-red-600">{result.error}</span>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <h5 className="font-semibold mb-2">Response:</h5>
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Guidelines */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>✅ What to Look For</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-800 mb-2">✅ Success Indicators:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Status codes: 200 (authenticated) or 401 (not authenticated)</li>
                  <li>• Response times under 500ms</li>
                  <li>• Valid JSON responses</li>
                  <li>• User data returned when authenticated</li>
                  <li>• Consistent behavior across both APIs</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-red-800 mb-2">❌ Failure Indicators:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Status codes: 500 (server error)</li>
                  <li>• Connection errors or timeouts</li>
                  <li>• Malformed JSON responses</li>
                  <li>• Database connection errors</li>
                  <li>• Inconsistent authentication state</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
