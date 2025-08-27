
"use client"

import { motion } from "framer-motion"
import { BookOpenIcon, TrophyIcon, CalendarIcon, MapPinIcon, AcademicCapIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface EducationCardsProps {
  educationHistory?: any[]
  isViewMode?: boolean
}

interface EducationEntry {
  id: number | string
  institutionName: string
  institutionCategory: string
  institutionType: string
  institutionTypeName?: string
  degree?: string
  degreeProgram?: string
  fieldOfStudy: string
  subjects?: string[]
  startDate: string
  endDate?: string
  isCurrent: boolean
  grade?: string
  gradeLevel?: string
  description?: string
  institutionId?: string
  institutionVerified: boolean | null
  gpa?: string
  achievements?: string[]
}

export default function EducationCards({ isViewMode = false }: EducationCardsProps) {
  const [educationHistory, setEducationHistory] = useState<EducationEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch existing education history from database - same as edit page
  useEffect(() => {
    const fetchEducationHistory = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/education', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        })

        if (response.ok) {
          const data = await response.json()
          const existingEducation = data.education || []
          console.log('📚 Education Cards: Loaded education history:', existingEducation)
          setEducationHistory(existingEducation)
        } else {
          console.error('Failed to fetch education history:', await response.text())
        }
      } catch (error) {
        console.error('Error fetching education history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEducationHistory()
  }, [])

  const getInstitutionTypeName = (typeId: string | number): string => {
    if (!typeId) return 'Institution Type'
    // This will be populated from the API response, same as edit page
    return 'Institution Type'
  }

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center">
            <BookOpenIcon className="h-5 w-5 mr-2 text-pathpiper-teal" />
            Education
          </h3>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pathpiper-teal mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading education history...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold flex items-center">
          <BookOpenIcon className="h-5 w-5 mr-2 text-pathpiper-teal" />
          Education
        </h3>
        {!isViewMode && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/student/profile/edit?section=education'}
          >
            <TrophyIcon className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        {educationHistory.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Education History</h3>
            <p className="text-gray-500 dark:text-gray-400">
              No education history has been added yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto hide-scrollbar pb-4">
            <div className="flex space-x-4" style={{ minWidth: "min-content" }}>
              {educationHistory.map((education, index) => (
                <motion.div
                  key={education.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm"
                  style={{ width: "320px" }}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{education.institutionName}</h4>
                        {education.institutionVerified === true && (
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {education.institutionTypeName || getInstitutionTypeName(education.institutionType)}
                      </p>
                    </div>
                    {education.isCurrent && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {(education.degreeProgram || education.degree) && (
                      <div className="flex items-center text-sm">
                        <AcademicCapIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{education.degreeProgram || education.degree}</span>
                      </div>
                    )}

                    {education.fieldOfStudy && (
                      <div className="flex items-center text-sm">
                        <BookOpenIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{education.fieldOfStudy}</span>
                      </div>
                    )}

                    {(education.gradeLevel || education.grade) && (
                      <div className="flex items-center text-sm">
                        <TrophyIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Grade: {education.gradeLevel || education.grade}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>
                        {education.startDate ? new Date(education.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''} - {education.isCurrent ? 'Present' : education.endDate ? new Date(education.endDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Present'}
                      </span>
                    </div>

                    {education.gpa && (
                      <div className="text-sm font-medium text-pathpiper-teal">
                        GPA: {education.gpa}
                      </div>
                    )}
                  </div>

                  {education.subjects && education.subjects.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">Subjects:</p>
                      <div className="flex flex-wrap gap-1">
                        {education.subjects.slice(0, 3).map((subject, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-pathpiper-teal/10 text-pathpiper-teal rounded-full">
                            {subject}
                          </span>
                        ))}
                        {education.subjects.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            +{education.subjects.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {education.achievements && education.achievements.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">Achievements:</p>
                      <div className="flex flex-wrap gap-1">
                        {education.achievements.slice(0, 2).map((achievement, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                            {achievement}
                          </span>
                        ))}
                        {education.achievements.length > 2 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            +{education.achievements.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {education.description && (
                    <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {education.description}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
