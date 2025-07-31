"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Image from "next/image"
import { BookOpen, Users, Award, Lightbulb } from "lucide-react"
import Link from "next/link"

export default function Hero() {
  // Feature list data
  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-teal-500 group-hover:text-yellow-700 transition-colors duration-300" />,
      title: "Learn",
      description: "Access educational resources",
      color: "from-teal-500/20 to-teal-500/30",
      hoverColor: "from-yellow-400 to-yellow-500",
      delay: 0.1,
    },
    {
      icon: <Users className="h-6 w-6 text-purple-500 group-hover:text-yellow-700 transition-colors duration-300" />,
      title: "Connect",
      description: "Build your academic network",
      color: "from-purple-500/20 to-purple-500/30",
      hoverColor: "from-yellow-400 to-yellow-500",
      delay: 0.2,
    },
    {
      icon: <Award className="h-6 w-6 text-orange-500 group-hover:text-yellow-700 transition-colors duration-300" />,
      title: "Achieve",
      description: "Track your educational milestones",
      color: "from-orange-500/20 to-orange-500/30",
      hoverColor: "from-yellow-400 to-yellow-500",
      delay: 0.3,
    },
    {
      icon: (
        <Lightbulb className="h-6 w-6 text-yellow-500 group-hover:text-yellow-700 transition-colors duration-300" />
      ),
      title: "Discover",
      description: "Explore career opportunities",
      color: "from-yellow-500/20 to-yellow-500/30",
      hoverColor: "from-yellow-400 to-yellow-500",
      delay: 0.4,
    },
  ]

  return (
    <section className="pt-36 pb-24 md:pt-44 md:pb-32 overflow-hidden relative">
      {/* Notebook-style checkered pattern background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            backgroundPosition: "center center",
            opacity: 0.25,
          }}
        />
        {/* Add major grid lines */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "100px 100px",
            backgroundPosition: "center center",
            opacity: 0.3,
          }}
        />
      </div>

      <div className="container-wide mx-auto px-4 md:px-8 relative z-10">
        {/* Main hero content */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-12 mb-12">
          {/* Text Content - Left Side */}
          <motion.div
            className="w-full md:w-1/2 text-center md:text-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
              Connect, learn, and grow with
              <span className="bg-gradient-to-r from-orange-500 via-purple-500 to-teal-500 bg-clip-text text-transparent">
                {" "}
                PathPiper
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 mx-auto md:mx-0 max-w-3xl">
              A global, safe, education-focused social networking platform uniting students, mentors, and institutions
              to enable career discovery, skill-building, and structured mentorship.
            </p>
            <div className="flex flex-col sm:flex-row md:justify-start justify-center gap-4 mb-10">
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full px-8 py-6 text-lg">
                  Join the Community
                </Button>
              </Link>
            </div>
            <div className="flex md:justify-start justify-center items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-r from-teal-400 to-blue-500"
                  ></div>
                ))}
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-slate-600 text-sm">Trusted by over 50,000 students worldwide</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Image - Right Side */}
          <motion.div
            className="w-full md:w-1/2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative mx-auto md:ml-auto">
              <Image
                src="/images/hero-banner.png"
                width={1200}
                height={675}
                alt="Teacher and students learning together"
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </motion.div>
        </div>

        {/* Visual Feature List */}
        <motion.div
          className="mt-8 pt-8 border-t border-slate-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex flex-col items-center text-center p-6 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 h-full relative z-10 overflow-hidden group">
                  {/* Animated background gradient on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-30 transition-opacity duration-300 z-0`}
                  ></div>

                  {/* Hover effect circle */}
                  <div className="absolute -inset-1 bg-gradient-to-br opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 z-0 group-hover:scale-150 scale-0"></div>

                  {/* Icon container with hover effect - updated to yellow */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 group-hover:bg-gradient-to-br group-hover:scale-110 flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-all duration-300 relative z-10 group-hover:bg-gradient-to-br group-hover:from-yellow-400 group-hover:to-yellow-500">
                    {feature.icon}
                  </div>

                  {/* Text content */}
                  <h3 className="font-bold text-slate-800 group-hover:text-slate-800 mb-2 transition-colors duration-300 relative z-10">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 group-hover:text-slate-600 transition-colors duration-300 relative z-10">
                    {feature.description}
                  </p>

                  {/* Animated dots */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/30">
                      <circle cx="4" cy="4" r="2" fill="currentColor" />
                      <circle cx="12" cy="4" r="2" fill="currentColor" />
                      <circle cx="20" cy="4" r="2" fill="currentColor" />
                      <circle cx="4" cy="12" r="2" fill="currentColor" />
                      <circle cx="12" cy="12" r="2" fill="currentColor" />
                      <circle cx="20" cy="12" r="2" fill="currentColor" />
                      <circle cx="4" cy="20" r="2" fill="currentColor" />
                      <circle cx="12" cy="20" r="2" fill="currentColor" />
                      <circle cx="20" cy="20" r="2" fill="currentColor" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
