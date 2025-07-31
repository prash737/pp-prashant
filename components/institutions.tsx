"use client"

import { motion } from "framer-motion"
import { Building, Calendar, Users, BarChart, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

export default function Institutions() {
  // Refs for measuring the width of the logo containers
  const containerRef1 = useRef<HTMLDivElement>(null)
  const containerRef2 = useRef<HTMLDivElement>(null)

  // State for the auto-scrolling logos
  const [scrollX1, setScrollX1] = useState(0)
  const [scrollX2, setScrollX2] = useState(0)

  // Institution logos - using placeholder logos with different colors
  const institutionLogos = [
    { name: "Harvard University", color: "bg-red-700" },
    { name: "Stanford University", color: "bg-green-700" },
    { name: "MIT", color: "bg-gray-800" },
    { name: "Oxford University", color: "bg-blue-800" },
    { name: "Cambridge University", color: "bg-teal-700" },
    { name: "Yale University", color: "bg-yellow-700" },
    { name: "Princeton University", color: "bg-orange-700" },
    { name: "Columbia University", color: "bg-purple-800" },
    { name: "University of Chicago", color: "bg-indigo-700" },
    { name: "UC Berkeley", color: "bg-pink-700" },
  ]

  // Create a duplicated array for infinite scrolling
  const duplicatedLogos = [...institutionLogos, ...institutionLogos, ...institutionLogos]

  // Auto-scroll effect with infinite loop
  useEffect(() => {
    // Animation speed (pixels per frame)
    const speed1 = 0.5
    const speed2 = 0.7

    // Width of a single logo item (including margin)
    const logoWidth = 168 // 40px width + 8px margin on each side

    // Total width of all logos in first row
    const totalWidth1 = logoWidth * institutionLogos.length

    // Animation frame
    let animationFrameId: number

    const animate = () => {
      setScrollX1((prev) => {
        // Reset position when scrolled one full set of logos
        if (Math.abs(prev) >= totalWidth1) {
          return 0
        }
        return prev - speed1
      })

      setScrollX2((prev) => {
        // Reset position when scrolled one full set of logos
        if (prev >= totalWidth1) {
          return 0
        }
        return prev + speed2
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [institutionLogos.length])

  return (
    <section id="institutions" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
            <span className="text-purple-500">Institutional</span> Engagement
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Schools and colleges can create official pages to connect with students, conduct outreach programs, host
            virtual events, and track student interests and engagement.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            className="bg-white rounded-2xl shadow-md overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="h-60 bg-gradient-to-r from-purple-500 to-purple-700 relative">
              {/* Replaced with new institution profile image */}
              <Image
                src="/images/institution-profile.png"
                alt="Institution profile"
                width={800}
                height={400}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-medium text-purple-600">
                Official Institution
              </div>
              {/* Removed Pip icon */}
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center mr-4">
                  <Building className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Westlake University</h3>
                  <p className="text-slate-500">Higher Education • 12,000+ students</p>
                </div>
              </div>

              <p className="text-slate-600 mb-6">
                Westlake University connects with students through their official PathPiper page, sharing events,
                opportunities, and building community.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <Calendar className="h-5 w-5 text-purple-500 mb-2" />
                  <h4 className="font-medium text-slate-800">Upcoming Events</h4>
                  <p className="text-sm text-slate-600">12 events this month</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <Users className="h-5 w-5 text-purple-500 mb-2" />
                  <h4 className="font-medium text-slate-800">Student Reach</h4>
                  <p className="text-sm text-slate-600">8,500+ connected</p>
                </div>
              </div>

              <Link href="/login?tab=institution">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white rounded-full">
                  Visit Institution Page
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-md overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Institution Features</h3>

              <div className="space-y-6">
                {[
                  {
                    icon: <Building className="h-6 w-6 text-purple-500" />,
                    title: "Official Pages",
                    description: "Create a verified institutional presence for authentic engagement with students",
                  },
                  {
                    icon: <Calendar className="h-6 w-6 text-purple-500" />,
                    title: "Event Hosting",
                    description: "Organize and promote educational events, workshops, and activities",
                  },
                  {
                    icon: <Users className="h-6 w-6 text-purple-500" />,
                    title: "Student Outreach",
                    description: "Connect with current and prospective students through targeted communications",
                  },
                  {
                    icon: <BarChart className="h-6 w-6 text-purple-500" />,
                    title: "Analytics Dashboard",
                    description: "Track engagement metrics and student interest to improve programs",
                  },
                  {
                    icon: <Briefcase className="h-6 w-6 text-purple-500" />,
                    title: "Internship & Job Placement",
                    description: "Connect students with career opportunities and help employers find talent",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="mt-1 mr-4 p-2 bg-slate-100 rounded-full shadow-sm">{item.icon}</div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{item.title}</h3>
                      <p className="text-slate-600">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/signup?tab=institution">
                  <Button
                    variant="outline"
                    className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 rounded-full"
                  >
                    Learn More About Institution Features
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Institution Partners Logo Carousel - Infinite Scroll */}
        {/* <motion.div
          className="mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-xl font-bold text-center mb-6 text-slate-800">Trusted by Leading Institutions</h3>

          {/* First row of logos - scrolling left */}
          {/* <div className="relative overflow-hidden py-4 mb-4">
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-slate-50 to-transparent"></div>
              <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-slate-50 to-transparent"></div>
            </div>

            <div
              ref={containerRef1}
              className="flex space-x-8 whitespace-nowrap"
              style={{ transform: `translateX(${scrollX1}px)` }}
            >
              {duplicatedLogos.map((logo, index) => (
                <div
                  key={`logo1-${index}`}
                  className="flex-shrink-0 flex items-center justify-center h-16 w-40 bg-white rounded-lg shadow-sm border border-slate-100"
                >
                  <div
                    className={`h-8 w-8 rounded-md ${logo.color} flex items-center justify-center text-white font-bold`}
                  >
                    {logo.name.charAt(0)}
                  </div>
                  <span className="ml-2 font-medium text-slate-700 text-sm truncate max-w-[100px]">{logo.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Second row of logos - scrolling right */}
          {/* <div className="relative overflow-hidden py-4">
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-slate-50 to-transparent"></div>
              <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-slate-50 to-transparent"></div>
            </div>

            <div
              ref={containerRef2}
              className="flex space-x-8 whitespace-nowrap"
              style={{ transform: `translateX(${scrollX2}px)` }}
            >
              {[...duplicatedLogos].reverse().map((logo, index) => (
                <div
                  key={`logo2-${index}`}
                  className="flex-shrink-0 flex items-center justify-center h-16 w-40 bg-white rounded-lg shadow-sm border border-slate-100"
                >
                  <div
                    className={`h-8 w-8 rounded-md ${logo.color} flex items-center justify-center text-white font-bold`}
                  >
                    {logo.name.charAt(0)}
                  </div>
                  <span className="ml-2 font-medium text-slate-700 text-sm truncate max-w-[100px]">{logo.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div> */}

        {/* <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link href="/signup?tab=institution">
            <Button className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white rounded-full px-8 py-6 text-lg">
              Partner With Us
            </Button>
          </Link>
        </motion.div> */}
      </div>
    </section>
  )
}