
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Clock, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

interface PerformanceReportButtonProps {
  studentId: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  showIcon?: boolean
}

export function PerformanceReportButton({ 
  studentId, 
  variant = 'outline',
  size = 'sm',
  showIcon = true
}: PerformanceReportButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadPerformanceReport = async () => {
    try {
      setIsDownloading(true)
      
      // Fetch the API with download-report=true parameter
      const response = await fetch(`/api/student/profile/${studentId}?download-report=true`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to generate performance report')
      }

      // Get the blob and create download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `student-profile-performance-${studentId}-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Performance report downloaded successfully!')
    } catch (error) {
      console.error('Error downloading performance report:', error)
      toast.error('Failed to download performance report')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button 
      onClick={downloadPerformanceReport}
      disabled={isDownloading}
      variant={variant}
      size={size}
      className="gap-2"
    >
      {showIcon && (
        isDownloading ? (
          <Clock className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )
      )}
      {isDownloading ? 'Generating...' : 'Download Performance Report'}
    </Button>
  )
}

// Alternative component for detailed performance view
export function PerformanceAnalysisButton({ 
  studentId 
}: { 
  studentId: string 
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const analyzePerformance = async () => {
    try {
      setIsAnalyzing(true)
      
      const response = await fetch(`/api/student/profile/${studentId}?download-report=true`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to get performance data')
      }

      const data = await response.json()
      setPerformanceData(data)
      setShowAnalysis(true)
      
      toast.success('Performance analysis completed!')
    } catch (error) {
      console.error('Error analyzing performance:', error)
      toast.error('Failed to analyze performance')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (showAnalysis && performanceData) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Analysis
          </h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAnalysis(false)}
          >
            Close
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Total Duration</p>
            <p className="text-2xl font-bold">{performanceData.apiCall.totalDuration}ms</p>
          </div>
          <div>
            <p className="text-sm font-medium">Slowest Phase</p>
            <p className="text-lg font-semibold">{performanceData.summary.slowestPhase.name}</p>
            <p className="text-sm text-muted-foreground">{performanceData.summary.slowestPhase.duration}ms</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Phase Breakdown:</p>
          {Object.entries(performanceData.phases).map(([key, phase]: [string, any]) => (
            <div key={key} className="flex justify-between items-center text-sm">
              <span>{phase.name}</span>
              <span className="font-mono">{phase.duration}ms ({phase.percentage}%)</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Optimization Suggestions:</p>
          <ul className="text-sm space-y-1">
            {performanceData.summary.optimization_suggestions.map((suggestion: string, index: number) => (
              <li key={index} className="text-muted-foreground">• {suggestion}</li>
            ))}
          </ul>
        </div>

        <PerformanceReportButton studentId={studentId} variant="default" />
      </div>
    )
  }

  return (
    <Button 
      onClick={analyzePerformance}
      disabled={isAnalyzing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <BarChart3 className="h-4 w-4" />
      {isAnalyzing ? 'Analyzing...' : 'Analyze Performance'}
    </Button>
  )
}
