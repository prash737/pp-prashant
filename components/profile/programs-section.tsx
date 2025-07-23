"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, Users, Clock, ChevronDown, ChevronUp } from "lucide-react"

interface Program {
  id: string
  name: string
  type: string
  level: string
  durationValue: number
  durationType: string
  description: string
  eligibility?: string
  learningOutcomes?: string
}

interface ProgramsSectionProps {
  institutionId?: string
  className?: string
}

export default function ProgramsSection({ institutionId, className = "" }: ProgramsSectionProps) {
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null)
  const [programs, setPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPrograms()
  }, [institutionId])

  const fetchPrograms = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/institution/programs')
      if (response.ok) {
        const data = await response.json()
        setPrograms(data.programs || [])
      } else {
        console.error('Failed to fetch programs')
      }
    } catch (error) {
      console.error('Error fetching programs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpanded = (programId: string) => {
    setExpandedProgram(expandedProgram === programId ? null : programId)
  }

  const formatDuration = (value: number, type: string) => {
    return `${value} ${type}${value > 1 ? 's' : ''}`
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Programs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Programs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500 text-center py-8">Coming soon</p>
      </CardContent>
    </Card>
  )
}