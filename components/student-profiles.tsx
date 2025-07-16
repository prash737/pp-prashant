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

          {/* Right side - Larger Profile Card */}
          <motion.div
            className="lg:w-1/2 flex justify-center"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="w-full max-w-md"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="w-full shadow-xl border-0 bg-white overflow-hidden">
                {/* Cover Image */}
                <div className="relative h-40 bg-gradient-to-r from-blue-400 to-purple-500">
                  <Image
                    src="/images/students-collaborating.png"
                    alt="Students working on laptops"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                <CardContent className="p-6 relative">
                  {/* Profile Avatar - positioned to overlap cover image */}
                  <div className="absolute -top-8 left-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 border-4 border-white shadow-lg"></div>
                  </div>

                  {/* Profile Header */}
                  <div className="mt-10 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800">Alex Johnson</h3>
                        <p className="text-sm text-slate-600">High School Student • Science Enthusiast</p>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-teal-500 hover:bg-teal-600 text-white"
                      >
                        Connect
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-xl font-bold text-slate-800">12</div>
                      <div className="text-xs text-slate-600">Circles</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-slate-800">247</div>
                      <div className="text-xs text-slate-600">Connections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-slate-800">8</div>
                      <div className="text-xs text-slate-600">Achievements</div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Top Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">Physics</Badge>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">Coding</Badge>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">Debate</Badge>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Mathematics</Badge>
                      <Badge variant="secondary" className="bg-red-100 text-red-700">Chess</Badge>
                    </div>
                  </div>

                  {/* Recent Achievement */}
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Recent Achievement</h4>
                    <div className="flex items-center space-x-3">
                      <Trophy className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">Science Fair Winner</p>
                        <p className="text-xs text-slate-600">Awarded 2 weeks ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}