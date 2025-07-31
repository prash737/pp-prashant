
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import Navbar from "@/components/navbar"
import InternalNavbar from "@/components/internal-navbar"
import InstitutionNavbar from "@/components/institution-navbar"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, DollarSign, Users, Briefcase, GraduationCap } from "lucide-react"

export default function CareersPage() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  // Choose navbar based on user role
  const renderNavbar = () => {
    if (loading) {
      return <Navbar /> // Show default navbar while loading
    }

    if (!user) {
      return <Navbar /> // Show default navbar for non-authenticated users
    }

    // Show role-specific navbar for authenticated users
    switch (user.role) {
      case 'institution':
        return <InstitutionNavbar />
      case 'student':
      case 'mentor':
      default:
        return <InternalNavbar />
    }
  }

  const jobOpenings = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      salary: "$80k - $120k",
      description: "Build beautiful, responsive interfaces for our education-focused platform using React, TypeScript, and modern web technologies."
    },
    {
      id: 2,
      title: "Child Safety Specialist",
      department: "Safety & Trust",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$70k - $100k",
      description: "Develop and implement safety policies, moderate content, and ensure our platform remains a safe space for young learners."
    },
    {
      id: 3,
      title: "Educational Content Manager",
      department: "Education",
      location: "New York, NY",
      type: "Full-time",
      salary: "$60k - $85k",
      description: "Curate and create educational content, work with curriculum experts, and develop learning pathways for students."
    },
    {
      id: 4,
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      salary: "$75k - $110k",
      description: "Design intuitive, accessible interfaces that make learning and connecting enjoyable for students of all ages."
    },
    {
      id: 5,
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Austin, TX",
      type: "Full-time",
      salary: "$85k - $125k",
      description: "Maintain and scale our infrastructure to support millions of students and educators worldwide."
    },
    {
      id: 6,
      title: "Community Manager",
      department: "Community",
      location: "Los Angeles, CA",
      type: "Full-time",
      salary: "$50k - $70k",
      description: "Foster positive community interactions, manage student and educator relationships, and organize virtual events."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {renderNavbar()}
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Join Our Mission
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Help us build the future of educational social networking. Be part of a team that's making a real difference in young people's lives worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-teal-500" />
                <span>Remote-First Culture</span>
              </div>
              <div className="flex items-center">
                <GraduationCap className="w-4 h-4 mr-2 text-blue-500" />
                <span>Learning & Development</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-purple-500" />
                <span>Meaningful Work</span>
              </div>
            </div>
          </div>

          {/* Why Join Us Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Impact-Driven Work</h3>
                <p className="text-gray-600">
                  Every line of code, every design decision, and every policy you create directly impacts the educational journey of students worldwide.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Continuous Learning</h3>
                <p className="text-gray-600">
                  We invest in your growth with learning stipends, conference attendance, and mentorship opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Great Benefits</h3>
                <p className="text-gray-600">
                  Competitive salary, comprehensive health coverage, flexible PTO, and equity participation in our mission.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Open Positions */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Open Positions</h2>
            <div className="space-y-6">
              {jobOpenings.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary">{job.department}</Badge>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {job.type}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {job.salary}
                          </div>
                        </div>
                      </div>
                      <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                        Apply Now
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{job.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Culture Section */}
          <Card className="p-8 bg-gradient-to-r from-purple-50 to-pink-50 mb-16">
            <CardContent>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Culture</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">What We Believe</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Education is a fundamental right that should be accessible to all
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Technology should enhance human connection, not replace it
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Safety and trust are non-negotiable in educational environments
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Diversity and inclusion make us stronger and more innovative
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">How We Work</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Remote-first with optional office spaces for collaboration
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Flexible hours that respect work-life balance
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Transparent communication and regular feedback
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Cross-functional collaboration on meaningful projects
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Process */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Application Process</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Apply Online</h3>
                <p className="text-sm text-gray-600">Submit your application and portfolio</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Initial Review</h3>
                <p className="text-sm text-gray-600">Our team reviews your qualifications</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Interviews</h3>
                <p className="text-sm text-gray-600">Virtual interviews with team members</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-pink-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold mb-2">Welcome Aboard</h3>
                <p className="text-sm text-gray-600">Join our mission to transform education</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <Card className="p-8 text-center bg-gradient-to-br from-teal-50 to-blue-50">
            <CardContent>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Make a Difference?</h2>
              <p className="text-lg text-gray-600 mb-6">
                Don't see a role that fits? We're always looking for talented individuals who share our passion for education and student safety.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3">
                  View All Openings
                </Button>
                <Button variant="outline" className="border-teal-500 text-teal-600 hover:bg-teal-50 px-8 py-3">
                  Send Us Your Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
