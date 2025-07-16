
"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Trophy, Users, Sparkles } from "lucide-react"

export default function StudentProfiles() {
  const features = [
    {
      icon: <GraduationCap className="h-8 w-8 text-blue-500" />,
      title: "Academic Identity",
      description: "Profiles designed to highlight your educational journey and aspirations"
    },
    {
      icon: <Trophy className="h-8 w-8 text-yellow-500" />,
      title: "Achievement Showcase",
      description: "Display your accomplishments, certifications, and educational milestones"
    },
    {
      icon: <Users className="h-8 w-8 text-purple-500" />,
      title: "Interest-Based Communities",
      description: "Connect with peers who share your academic and extracurricular interests"
    },
    {
      icon: <Sparkles className="h-8 w-8 text-orange-500" />,
      title: "Skill Visualization",
      description: "Interactive displays of your developing skills and competencies"
    }
  ]

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left side - Content */}
          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                Student-Centric{" "}
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                  Social Profiles
                </span>
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                Build your academic identity with profiles tailored for educational growth. 
                Showcase your achievements, connect with peers who share your interests, and 
                join communities that inspire you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Profile Card with Background Illustration */}
          <motion.div
            className="lg:w-1/2 flex justify-center"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              {/* Background illustration with diverse students collaborating */}
              <div className="absolute -top-12 -right-12 z-0">
                <motion.div
                  className="w-96 h-80 rounded-3xl bg-gradient-to-br from-blue-100 via-teal-50 to-purple-50 flex items-center justify-center overflow-hidden"
                  animate={{ 
                    scale: [1, 1.02, 1],
                    rotate: [0, 1, 0] 
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut" 
                  }}
                >
                  {/* Diverse students illustration */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Background shapes */}
                    <div className="absolute top-8 right-8 w-16 h-16 rounded-full bg-yellow-200 opacity-60"></div>
                    <div className="absolute bottom-12 left-8 w-12 h-12 rounded-full bg-teal-200 opacity-70"></div>
                    
                    {/* Students with laptops */}
                    <div className="flex items-center space-x-6">
                      {/* Student 1 - Dark skin, curly hair */}
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-amber-600 to-amber-700 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-700 to-amber-800 relative">
                            {/* Hair */}
                            <div className="absolute -top-2 -left-1 w-18 h-12 rounded-full bg-gray-900"></div>
                            {/* Face */}
                            <div className="absolute top-4 left-3 w-2 h-1 bg-gray-900 rounded-full"></div>
                            <div className="absolute top-4 right-3 w-2 h-1 bg-gray-900 rounded-full"></div>
                            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-gray-800 rounded-full"></div>
                          </div>
                        </div>
                        {/* Laptop */}
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                          <div className="w-10 h-6 bg-blue-400 rounded-sm"></div>
                        </div>
                      </div>

                      {/* Student 2 - Red/orange hair */}
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-red-400 to-red-500 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-red-500 to-red-600 relative">
                            {/* Hair */}
                            <div className="absolute -top-2 -left-1 w-18 h-12 rounded-full bg-red-600"></div>
                            {/* Face */}
                            <div className="absolute top-4 left-3 w-2 h-1 bg-gray-900 rounded-full"></div>
                            <div className="absolute top-4 right-3 w-2 h-1 bg-gray-900 rounded-full"></div>
                            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-gray-800 rounded-full"></div>
                          </div>
                        </div>
                        {/* Laptop */}
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                          <div className="w-10 h-6 bg-green-400 rounded-sm"></div>
                        </div>
                      </div>

                      {/* Student 3 - Dark hair */}
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-orange-400 to-orange-500 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-orange-500 to-orange-600 relative">
                            {/* Hair */}
                            <div className="absolute -top-2 -left-1 w-18 h-12 rounded-full bg-gray-900"></div>
                            {/* Face */}
                            <div className="absolute top-4 left-3 w-2 h-1 bg-gray-900 rounded-full"></div>
                            <div className="absolute top-4 right-3 w-2 h-1 bg-gray-900 rounded-full"></div>
                            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-gray-800 rounded-full"></div>
                          </div>
                        </div>
                        {/* Laptop */}
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                          <div className="w-10 h-6 bg-purple-400 rounded-sm"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Pip character floating around */}
              <div className="absolute -bottom-8 -left-8 z-10">
                <motion.div
                  animate={{ 
                    y: [0, -15, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    repeat: Number.POSITIVE_INFINITY, 
                    duration: 4, 
                    ease: "easeInOut" 
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-lg">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-300 to-blue-400"></div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Profile Card */}
              <motion.div
                className="relative z-20"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="w-80 shadow-xl border-0 bg-white">
                  <CardContent className="p-6">
                    {/* Profile Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-500"></div>
                        <div>
                          <h3 className="font-semibold text-slate-800">Alex Johnson</h3>
                          <p className="text-sm text-slate-600">High School Student • Science Enthusiast</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-teal-500 hover:bg-teal-600 text-white"
                      >
                        Connect
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-slate-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-800">12</div>
                        <div className="text-xs text-slate-600">Circles</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-800">247</div>
                        <div className="text-xs text-slate-600">Connections</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-800">8</div>
                        <div className="text-xs text-slate-600">Achievements</div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Top Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">Physics</Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">Coding</Badge>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">Debate</Badge>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Mathematics</Badge>
                        <Badge variant="secondary" className="bg-red-100 text-red-700">Chess</Badge>
                      </div>
                    </div>

                    {/* Recent Achievement */}
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="text-sm font-medium text-slate-700 mb-1">Recent Achievement</h4>
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">Science Fair Winner</p>
                          <p className="text-xs text-slate-600">Awarded 2 weeks ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
