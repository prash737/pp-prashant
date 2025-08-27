
"use client"

import { motion } from "framer-motion"
import { BookOpenIcon, CalendarIcon, AwardIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EducationCardsProps {
  educationHistory?: any[]
  isViewMode?: boolean
}

export default function EducationCards({ educationHistory, isViewMode = false }: EducationCardsProps) {
  console.log("🔍 Education Cards - Raw data received:", educationHistory);

  // Simple mapping - use the data as it comes from the comprehensive function
  const educationEntries = educationHistory?.map((edu: any) => ({
    school: edu.institutionName || "Institution Name Not Available",
    type: edu.institutionType?.name || edu.institutionTypeName || "Institution Type Not Available", 
    grade: edu.gradeLevel || "Grade Not Specified",
    period: edu.startDate ? 
      `${new Date(edu.startDate).getFullYear()} - ${(edu.isCurrent || edu.is_current) ? 'Present' : (edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present')}` :
      'Date not specified',
    gpa: edu.gpa ? `GPA: ${edu.gpa}` : null,
    subjects: edu.subjects || [],
    achievements: edu.achievements || [],
    institutionVerified: edu.institutionVerified,
    degreeProgram: edu.degreeProgram || "Degree Program Not Specified",
    fieldOfStudy: edu.fieldOfStudy,
    description: edu.description
  })) || []

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
            <AwardIcon className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        {educationEntries.length === 0 ? (
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
              {educationEntries.map((education, index) => (
                <motion.div
                  key={index}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm"
                  style={{ width: "320px" }}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{education.school}</h4>
                        {education.institutionVerified === true && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </span>
                        )}
                        {education.institutionVerified !== true && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-xs rounded-full font-medium flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Not Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{education.type}</p>
                    </div>
                    <span className="px-2 py-1 bg-pathpiper-teal/10 text-pathpiper-teal text-xs rounded-full">
                      {education.grade}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {education.period}
                    {education.gpa && (
                      <>
                        <span className="mx-2">•</span>
                        {education.gpa}
                      </>
                    )}
                  </div>

                  {education.degreeProgram && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {education.degreeProgram}
                      </span>
                      {education.fieldOfStudy && (
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          in {education.fieldOfStudy}
                        </span>
                      )}
                    </div>
                  )}

                  {education.subjects && education.subjects.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium mb-1">Subjects</h5>
                      <div className="flex flex-wrap gap-1">
                        {education.subjects.map((subject, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {education.description && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium mb-1">Description</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{education.description}</p>
                    </div>
                  )}

                  {education.achievements && education.achievements.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-1">Achievements</h5>
                      <ul className="space-y-1">
                        {education.achievements.map((achievement, idx) => (
                          <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-400"></div>
                            {achievement}
                          </li>
                        ))}
                      </ul>
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
