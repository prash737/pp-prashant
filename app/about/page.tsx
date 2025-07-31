
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import Navbar from "@/components/navbar"
import InternalNavbar from "@/components/internal-navbar"
import InstitutionNavbar from "@/components/institution-navbar"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {renderNavbar()}
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About PathPiper
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering the next generation through safe, educational social networking that connects students, mentors, and institutions worldwide.
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-4">
                PathPiper exists to create a safe, supportive, and inspiring digital environment where young minds can explore their potential, connect with mentors, and build meaningful relationships that foster personal and academic growth.
              </p>
              <p className="text-lg text-gray-600">
                We believe that every student deserves access to quality mentorship, educational opportunities, and a community that nurtures their unique talents and aspirations.
              </p>
            </div>
            <Card className="p-8 bg-gradient-to-br from-teal-50 to-blue-50">
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="text-gray-800 font-medium">Safe & Secure Platform</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-800 font-medium">Educational Focus</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-800 font-medium">Global Community</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <span className="text-gray-800 font-medium">Mentorship Opportunities</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-teal-600">S</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Safety First</h3>
                  <p className="text-gray-600">
                    Every feature is designed with student safety as the top priority, including robust moderation and parental controls.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">E</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Educational Excellence</h3>
                  <p className="text-gray-600">
                    We promote learning, creativity, and academic achievement through meaningful connections and resources.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">I</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Inclusive Community</h3>
                  <p className="text-gray-600">
                    We celebrate diversity and create an environment where every student feels welcome and valued.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Story Section */}
          <Card className="p-8 bg-gradient-to-r from-purple-50 to-pink-50 mb-16">
            <CardContent>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-4">
                PathPiper was born from a simple observation: in our increasingly digital world, young people need safe spaces to connect, learn, and grow. Traditional social media platforms weren't designed with students' educational and developmental needs in mind.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                Our founders, educators and technologists, envisioned a platform that would combine the connectivity of social media with the safety and educational focus that students deserve. After years of research, development, and collaboration with educators, parents, and students themselves, PathPiper emerged as a comprehensive solution.
              </p>
              <p className="text-lg text-gray-600">
                Today, PathPiper serves thousands of students, mentors, and educational institutions worldwide, fostering connections that inspire learning, creativity, and personal growth.
              </p>
            </CardContent>
          </Card>

          {/* Team Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-lg text-gray-600 mb-12">
              PathPiper is built by a diverse team of educators, developers, designers, and child safety experts who are passionate about creating positive digital experiences for young people.
            </p>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">ED</span>
                </div>
                <h3 className="font-semibold text-gray-900">Education Team</h3>
                <p className="text-sm text-gray-600">Curriculum & Learning Experts</p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">SF</span>
                </div>
                <h3 className="font-semibold text-gray-900">Safety Team</h3>
                <p className="text-sm text-gray-600">Child Protection Specialists</p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">DV</span>
                </div>
                <h3 className="font-semibold text-gray-900">Development Team</h3>
                <p className="text-sm text-gray-600">Tech & Engineering</p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">DS</span>
                </div>
                <h3 className="font-semibold text-gray-900">Design Team</h3>
                <p className="text-sm text-gray-600">User Experience & Interface</p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <Card className="p-8 text-center bg-gradient-to-br from-teal-50 to-blue-50">
            <CardContent>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-lg text-gray-600 mb-6">
                Have questions about PathPiper? We'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-full font-medium transition-colors"
                >
                  Contact Us
                </a>
                <a 
                  href="/safety" 
                  className="border border-teal-500 text-teal-600 hover:bg-teal-50 px-6 py-3 rounded-full font-medium transition-colors"
                >
                  Safety Center
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
