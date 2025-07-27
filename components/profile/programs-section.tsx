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
  isViewMode?: boolean
  programs?: any[]
}

export default function ProgramsSection({ institutionId, className = "", isViewMode = false, programs: propPrograms }: ProgramsSectionProps) {
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null)
  const [programs, setPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (propPrograms) {
      setPrograms(propPrograms);
      setIsLoading(false);
    } else {
      fetchPrograms();
    }
  }, [institutionId, propPrograms]);

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

  if (programs.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Programs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No programs added yet</p>
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
        <div className="space-y-4">
          {programs.map((program) => (
            <div key={program.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{program.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="secondary">{program.type}</Badge>
                    <Badge variant="outline">{program.level}</Badge>
                  </div>
                </div>
                {!isViewMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(program.id)}
                    className="shrink-0"
                  >
                    {expandedProgram === program.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(program.durationValue, program.durationType)}</span>
                </div>
              </div>

              <p className="text-gray-700 mb-3">{program.description}</p>

              {expandedProgram === program.id && (
                <div className="border-t pt-3 space-y-3">
                  {program.eligibility && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 mb-1">Eligibility</h4>
                      <p className="text-sm text-gray-600">{program.eligibility}</p>
                    </div>
                  )}
                  {program.learningOutcomes && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 mb-1">Learning Outcomes</h4>
                      <p className="text-sm text-gray-600">{program.learningOutcomes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}