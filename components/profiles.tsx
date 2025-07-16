"use client"

import { motion } from "framer-motion"
import { UserCircle, Award, Users, Sparkles } from "lucide-react"
import Image from "next/image"

export default function Profiles() {
  return (
    <section id="profiles" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-800">
              Student-Centric <span className="text-teal-500">Social Profiles</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Build your academic identity with profiles tailored for educational growth. Showcase your achievements,
              connect with peers who share your interests, and join communities that inspire you.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: <UserCircle className="h-6 w-6 text-teal-500" />,
                  title: "Academic Identity",
                  description: "Profiles designed to highlight your educational journey and aspirations",
                },
                {
                  icon: <Award className="h-6 w-6 text-orange-500" />,
                  title: "Achievement Showcase",
                  description: "Display your accomplishments, certifications, and educational milestones",
                },
                {
                  icon: <Users className="h-6 w-6 text-purple-500" />,
                  title: "Interest-Based Communities",
                  description: "Connect with peers who share your academic and extracurricular interests",
                },
                {
                  icon: <Sparkles className="h-6 w-6 text-yellow-500" />,
                  title: "Skill Visualization",
                  description: "Interactive displays of your developing skills and competencies",
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
                  <div className="mt-1 mr-4 p-2 bg-white rounded-full shadow-sm">{item.icon}</div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{item.title}</h3>
                    <p className="text-slate-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <div className="absolute -z-10 -inset-4 bg-gradient-to-r from-teal-400/10 to-blue-500/10 rounded-3xl blur-lg"></div>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                {/* Increased height by 25% and fixed the class name */}
                <div className="bg-gradient-to-r from-teal-400 to-blue-500 h-[12.5rem] relative">
                  {/* Banner image - updated with new student profile image */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <Image
                      src="/images/student-profile.png"
                      alt="Students collaborating"
                      width={800}
                      height={400}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Adjusted position to account for taller banner */}
                  <div className="absolute -bottom-12 left-6 h-24 w-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
                    {/* Pip as profile photo */}
                    <Image
                      src="/images/pip-mascot.png"
                      alt="Student profile"
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="pt-14 px-6 pb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Alex Johnson</h3>
                      <p className="text-slate-500">High School Student • Science Enthusiast</p>
                    </div>
                    <button className="px-4 py-1 bg-teal-100 text-teal-600 rounded-full text-sm font-medium">
                      Connect
                    </button>
                  </div>

                  <div className="mt-6 flex space-x-4 text-center">
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">12</div>
                      <div className="text-xs text-slate-500">Courses</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">247</div>
                      <div className="text-xs text-slate-500">Connections</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">8</div>
                      <div className="text-xs text-slate-500">Achievements</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-slate-800 mb-2">Top Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {["Physics", "Coding", "Debate", "Mathematics", "Chess"].map((skill, i) => (
                        <span
                          key={i}
                          className={`px-3 py-1 rounded-full text-sm ${
                            i % 4 === 0
                              ? "bg-teal-100 text-teal-700"
                              : i % 4 === 1
                                ? "bg-orange-100 text-orange-700"
                                : i % 4 === 2
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-slate-800 mb-2">Recent Achievement</h4>
                    <div className="bg-slate-50 rounded-lg p-3 flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-full mr-3">
                        <Award className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">Science Fair Winner</div>
                        <div className="text-xs text-slate-500">Awarded 2 weeks ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
