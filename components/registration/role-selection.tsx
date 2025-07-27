"use client"

import { motion } from "framer-motion"
import { GraduationCap, Briefcase, Building } from "lucide-react"
import type { UserRole } from "@/app/register/page"
import Image from "next/image"

interface RoleSelectionProps {
  onSelectRole: (role: UserRole) => void
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const roles = [
    {
      id: "student",
      title: "Student",
      description: "Explore careers, connect with mentors, and build your future",
      icon: <GraduationCap className="h-8 w-8" />,
      iconColor: "text-teal-500",
      bgColor: "bg-teal-500",
      hoverImage: "/images/student-profile.png",
      clickable: true,
    },
    {
      id: "parent",
      title: "Parent",
      description: "Support and monitor your child's educational journey",
      icon: <Briefcase className="h-8 w-8" />,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-500",
      hoverImage: "/images/career-path.png",
      clickable: true,
    },
    {
      id: "institution",
      title: "Institution",
      description: "Connect your school or organization with students",
      icon: <Building className="h-8 w-8" />,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-500",
      hoverImage: "/images/institution-profile.png",
      clickable: true,
    },
    {
      id: "mentor",
      title: "Mentor",
      description: "Coming Soon",
      icon: <Briefcase className="h-8 w-8" />,
      iconColor: "text-gray-400",
      bgColor: "bg-gray-400",
      hoverImage: "/images/career-path.png",
      clickable: false,
    },
  ]

  return (
    <div className="text-center">
      <h1 className="text-2xl md:text-3xl font-bold mb-3">Join PathPiper</h1>
      <p className="text-slate-600 mb-8">Select how you want to use PathPiper</p>

      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {roles.map((role, index) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={role.clickable ? { y: -5 } : {}}
            className={`group ${role.clickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
            onClick={() => {
              if (role.clickable) {
                if (role.id === 'parent') {
                  // Redirect to parent signup page
                  window.location.href = '/parent/signup';
                } else {
                  onSelectRole(role.id as UserRole);
                }
              }
            }}
          >
            {/* Fixed card with proper dimensions */}
            <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${role.clickable ? 'hover:shadow-md' : ''} transition-all duration-300 relative overflow-hidden h-48`}>
              {/* Normal state - static positioning to prevent collapse */}
              <div className={`flex flex-col items-center justify-center h-full w-full p-6 ${role.clickable ? 'group-hover:opacity-0' : ''} transition-opacity duration-300`}>
                <div
                  className={`w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 ${role.iconColor}`}
                >
                  {role.icon}
                </div>
                <h3 className="text-lg font-semibold mb-1 text-slate-800">{role.title}</h3>
                <p className="text-sm text-slate-600">{role.description}</p>
              </div>

              {/* Hover state - absolute positioning over the normal state */}
              {role.clickable && (
                <div className="flex flex-col items-center justify-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`absolute inset-0 ${role.bgColor} opacity-90 z-0`}></div>
                  <div className="relative z-10 flex flex-col items-center p-6">
                    {/* Increased image size from w-24 h-24 to w-36 h-36 */}
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-2 border-2 border-white shadow-lg">
                      <Image
                        src={role.hoverImage || "/placeholder.svg"}
                        alt={role.title}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white mt-1">{role.title}</h3>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
