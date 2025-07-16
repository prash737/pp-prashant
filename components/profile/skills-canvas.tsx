"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface Skill {
  id: number
  name: string
  level: number
  category: string
  categoryName: string
  color: string
}

interface SkillsCanvasProps {
  userId?: string
  skills?: Skill[]
}

export default function SkillsCanvas({ userId, skills: passedSkills }: SkillsCanvasProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (passedSkills && passedSkills.length > 0) {
      // Transform the passed skills data to match component format
      const transformedSkills = passedSkills.map((skill: any, index: number) => {
        // Convert proficiency level (1-5) to percentage (20-100%)
        const proficiencyLevel = skill.proficiencyLevel || skill.proficiency_level || 1
        const percentageLevel = (proficiencyLevel / 5) * 100
        
        return {
          id: skill.id || index,
          name: skill.name,
          level: Math.round(percentageLevel),
          category: skill.category || "Unknown",
          categoryName: skill.categoryName || skill.category || "Unknown",
          color: getColorForSkill(index)
        }
      })

      setSkills(transformedSkills)
      
      // Extract unique categories from skills
      const uniqueCategories = [...new Set(transformedSkills.map(skill => skill.categoryName))]
      setAvailableCategories(uniqueCategories)
      
      setLoading(false)
    } else {
      setSkills([])
      setAvailableCategories([])
      setLoading(false)
    }
  }, [passedSkills])

  // Helper function to assign colors to skills
  const getColorForSkill = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500", 
      "bg-green-500",
      "bg-pink-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-orange-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-lime-500",
      "bg-amber-500"
    ]
    return colors[index % colors.length]
  }

  const filteredSkills =
    selectedCategory === "all" ? skills : skills.filter((skill) => skill.categoryName === selectedCategory)

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pathpiper-teal mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading skills...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Skills Canvas</h2>
        {skills.length > 0 && availableCategories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              key="all"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === "all"
                  ? "bg-pathpiper-teal text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              All
            </button>
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category
                    ? "bg-pathpiper-teal text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {skills.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Skills Added Yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Add skills to your profile to see them visualized here
          </p>
        </div>
      ) : (
        <div className="relative">
          {selectedSkill !== null && (
            <div className="absolute inset-0 bg-white dark:bg-gray-800 z-10 rounded-xl p-6">
              <button
                onClick={() => setSelectedSkill(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>

              {/* Skill detail view */}
              {(() => {
                const skill = skills.find((s) => s.id === selectedSkill)
                if (!skill) return null

                return (
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{skill.name}</h3>
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span>Proficiency</span>
                        <span>{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${skill.color}`} style={{ width: `${skill.level}%` }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Category</h4>
                        <span className="inline-block px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {skill.categoryName}
                        </span>
                      </div>

                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Skill Level</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {skill.level >= 80 ? 'Expert' : skill.level >= 60 ? 'Advanced' : skill.level >= 40 ? 'Intermediate' : 'Beginner'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
            initial="hidden"
            animate="show"
          >
            {filteredSkills.map((skill) => (
              <motion.div
                key={skill.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.03 }}
                onClick={() => setSelectedSkill(skill.id)}
                className={`
                  ${skill.color} bg-opacity-20 dark:bg-opacity-30
                  rounded-xl p-4 cursor-pointer
                  border-2 border-transparent hover:border-pathpiper-teal
                  transition-all duration-200
                `}
                style={{
                  height: `${100 + skill.level / 5}px`,
                }}
              >
                <div className="h-full flex flex-col justify-between">
                    <h3 className="font-semibold text-sm">{skill.name}</h3>
                    <div className="flex justify-between items-end">
                      <span className="text-xs uppercase">{skill.categoryName}</span>
                      <span className="text-lg font-bold">{skill.level}%</span>
                    </div>
                  </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  )
}