
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PerformanceReportButton, PerformanceAnalysisButton } from '@/components/profile/performance-report-button'
import { Badge } from '@/components/ui/badge'

export default function PerformanceTestPage() {
  const [studentId, setStudentId] = useState('')
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runPerformanceTest = async () => {
    if (!studentId.trim()) return

    setIsRunning(true)
    const results = []

    try {
      // Run multiple tests
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now()
        
        const response = await fetch(`/api/student/profile/${studentId}`, {
          credentials: 'include'
        })
        
        const endTime = Date.now()
        const duration = endTime - startTime

        if (response.ok) {
          results.push({
            run: i + 1,
            duration,
            status: 'success',
            timestamp: new Date().toISOString()
          })
        } else {
          results.push({
            run: i + 1,
            duration,
            status: 'error',
            error: await response.text(),
            timestamp: new Date().toISOString()
          })
        }

        // Wait 1 second between tests
        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      setTestResults(results)
    } catch (error) {
      console.error('Performance test failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const averageDuration = testResults.length > 0 
    ? Math.round(testResults.reduce((sum, result) => sum + result.duration, 0) / testResults.length)
    : 0

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Profile API Performance Testing</h1>
        <p className="text-muted-foreground mt-2">
          Test and analyze the performance of student profile API calls
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Test Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Enter Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={runPerformanceTest}
              disabled={isRunning || !studentId.trim()}
            >
              {isRunning ? 'Running Tests...' : 'Run Performance Test'}
            </Button>
          </div>

          {studentId.trim() && (
            <div className="flex gap-2">
              <PerformanceReportButton studentId={studentId} />
              <PerformanceAnalysisButton studentId={studentId} />
            </div>
          )}
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{averageDuration}ms</p>
                <p className="text-sm text-muted-foreground">Average Duration</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{testResults.filter(r => r.status === 'success').length}/3</p>
                <p className="text-sm text-muted-foreground">Successful Requests</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {Math.min(...testResults.map(r => r.duration))}ms - {Math.max(...testResults.map(r => r.duration))}ms
                </p>
                <p className="text-sm text-muted-foreground">Duration Range</p>
              </div>
            </div>

            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                      Run {result.run}
                    </Badge>
                    <span className="font-mono text-sm">{result.duration}ms</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Performance Analysis</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Performance Rating:</p>
                  <Badge variant={
                    averageDuration < 1000 ? 'default' :
                    averageDuration < 2000 ? 'secondary' :
                    averageDuration < 3000 ? 'outline' : 'destructive'
                  }>
                    {averageDuration < 1000 ? 'Excellent' :
                     averageDuration < 2000 ? 'Good' :
                     averageDuration < 3000 ? 'Acceptable' : 'Needs Optimization'}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium">Consistency:</p>
                  <Badge variant="outline">
                    {Math.max(...testResults.map(r => r.duration)) - Math.min(...testResults.map(r => r.duration)) < 500 
                      ? 'Consistent' : 'Variable'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
