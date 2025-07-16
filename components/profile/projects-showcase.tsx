"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { GithubIcon, ExternalLinkIcon, CodeIcon, UsersIcon, CalendarIcon } from "lucide-react"

// Mock projects data
const projectsData = [
  {
    id: 1,
    title: "Climate Change Visualization",
    description: "Interactive dashboard showing climate change data over the past century",
    image: "/placeholder.svg?key=zwcwp",
    tags: ["Data Visualization", "Python", "D3.js"],
    links: {
      github: "#",
      live: "#",
    },
    date: "April 2023",
    collaborators: ["Jane Smith", "Mike Johnson"],
  },
  {
    id: 2,
    title: "Smart Study Planner",
    description: "AI-powered study planner that optimizes study schedules based on learning patterns",
    image: "/placeholder.svg?key=ehl96",
    tags: ["Machine Learning", "React", "Node.js"],
    links: {
      github: "#",
      live: "#",
    },
    date: "February 2023",
    collaborators: ["Alex Chen"],
  },
  {
    id: 3,
    title: "Virtual Science Lab",
    description: "VR-based science laboratory simulation for conducting virtual experiments",
    image: "/placeholder.svg?key=45fb1",
    tags: ["VR", "Unity", "C#"],
    links: {
      github: "#",
      live: "#",
    },
    date: "December 2022",
    collaborators: [],
  },
]

export default function ProjectsShowcase({ student }: { student: any }) {
  // Check if there are any projects
  if (!student.projects || student.projects.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projects Showcase</h2>
          <p className="text-gray-600 dark:text-gray-400">Explore my work and accomplishments</p>
        </div>

        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Projects Coming Soon</h3>
            <p className="text-gray-500 dark:text-gray-400">
              This section will showcase projects and portfolios. Database tables for projects are not yet implemented.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projects Showcase</h2>
        <p className="text-gray-600 dark:text-gray-400">Explore my work and accomplishments</p>
      </div>

      <div className="relative">
        {/*{selectedProject !== null && (*/}
        {/*  <motion.div*/}
        {/*    className="absolute inset-0 bg-white dark:bg-gray-800 z-10 rounded-xl p-6 overflow-y-auto"*/}
        {/*    initial={{ opacity: 0 }}*/}
        {/*    animate={{ opacity: 1 }}*/}
        {/*  >*/}
        {/*    <button*/}
        {/*      onClick={() => setSelectedProject(null)}*/}
        {/*      className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"*/}
        {/*    >*/}
        {/*      ✕*/}
        {/*    </button>*/}

        {/*    /!* Project detail view *!/*/}
        {/*    {(() => {*/}
        {/*      const project = projectsData.find((p) => p.id === selectedProject)*/}
        {/*      if (!project) return null*/}

        {/*      return (*/}
        {/*        <div>*/}
        {/*          <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden mb-6">*/}
        {/*            <Image*/}
        {/*              src={project.image || "/placeholder.svg"}*/}
        {/*              alt={project.title}*/}
        {/*              fill*/}
        {/*              className="object-cover"*/}
        {/*            />*/}
        {/*          </div>*/}

        {/*          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">*/}
        {/*            <h3 className="text-2xl font-bold">{project.title}</h3>*/}

        {/*            <div className="flex gap-2">*/}
        {/*              <a*/}
        {/*                href={project.links.github}*/}
        {/*                target="_blank"*/}
        {/*                rel="noopener noreferrer"*/}
        {/*                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"*/}
        {/*              >*/}
        {/*                <GithubIcon className="h-5 w-5" />*/}
        {/*              </a>*/}
        {/*              <a*/}
        {/*                href={project.links.live}*/}
        {/*                target="_blank"*/}
        {/*                rel="noopener noreferrer"*/}
        {/*                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"*/}
        {/*              >*/}
        {/*                <ExternalLinkIcon className="h-5 w-5" />*/}
        {/*              </a>*/}
        {/*            </div>*/}
        {/*          </div>*/}

        {/*          <p className="text-gray-700 dark:text-gray-300 mb-6">{project.description}</p>*/}

        {/*          <div className="flex flex-wrap gap-2 mb-6">*/}
        {/*            {project.tags.map((tag, index) => (*/}
        {/*              <span*/}
        {/*                key={index}*/}
        {/*                className="px-3 py-1 bg-pathpiper-teal bg-opacity-10 text-pathpiper-teal rounded-full text-sm"*/}
        {/*              >*/}
        {/*                {tag}*/}
        {/*              </span>*/}
        {/*            ))}*/}
        {/*          </div>*/}

        {/*          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">*/}
        {/*            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">*/}
        {/*              <CalendarIcon className="h-4 w-4" />*/}
        {/*              <span>{project.date}</span>*/}
        {/*            </div>*/}

        {/*            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">*/}
        {/*              <CodeIcon className="h-4 w-4" />*/}
        {/*              <span>3 Skills Applied</span>*/}
        {/*            </div>*/}
        {/*          </div>*/}

        {/*          {project.collaborators.length > 0 && (*/}
        {/*            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">*/}
        {/*              <h4 className="font-semibold mb-3 flex items-center gap-2">*/}
        {/*                <UsersIcon className="h-4 w-4" />*/}
        {/*                Collaborators*/}
        {/*              </h4>*/}
        {/*              <div className="flex flex-wrap gap-2">*/}
        {/*                {project.collaborators.map((collaborator, index) => (*/}
        {/*                  <div*/}
        {/*                    key={index}*/}
        {/*                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1"*/}
        {/*                  >*/}
        {/*                    <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600"></div>*/}
        {/*                    <span className="text-sm">{collaborator}</span>*/}
        {/*                  </div>*/}
        {/*                ))}*/}
        {/*              </div>*/}
        {/*            </div>*/}
        {/*          )}*/}
        {/*        </div>*/}
        {/*      )*/}
        {/*    })()}*/}
        {/*  </motion.div>*/}
        {/*)}*/}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsData.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedProject(project.id)}
            >
              <div className="relative h-48">
                <Image src={project.image || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{project.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 2 && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                      +{project.tags.length - 2} more
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{project.date}</span>
                  <div className="flex gap-2">
                    <a
                      href={project.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GithubIcon className="h-4 w-4" />
                    </a>
                    <a
                      href={project.links.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLinkIcon className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}