
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Globe, Shield, Heart } from "lucide-react"
import Footer from "@/components/footer"
import InternalNavbar from "@/components/internal-navbar"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <InternalNavbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About PathPiper
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering students worldwide with safe, educational social networking that connects, inspires, and guides their academic journey.
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6">
                  PathPiper is dedicated to creating a global, safe, and education-focused social networking platform for students. We believe every student deserves access to quality educational connections, mentorship, and opportunities to grow academically and personally.
                </p>
                <p className="text-lg text-gray-600">
                  Our platform bridges the gap between traditional education and modern social networking, providing students with tools to showcase their achievements, connect with peers and mentors, and discover their ideal academic path.
                </p>
              </div>
              <div className="flex justify-center">
                <Image
                  src="/images/students-collaborating.png"
                  width={500}
                  height={400}
                  alt="Students collaborating"
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Shield className="h-12 w-12 text-teal-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Safety First</h3>
                  <p className="text-gray-600">
                    Comprehensive safety measures and parental controls ensure a secure environment for all students.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Community</h3>
                  <p className="text-gray-600">
                    Building meaningful connections between students, educators, and institutions worldwide.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Globe className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Global Access</h3>
                  <p className="text-gray-600">
                    Breaking down geographical barriers to provide equal educational opportunities for all.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Heart className="h-12 w-12 text-pink-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Student-Centric</h3>
                  <p className="text-gray-600">
                    Every feature and decision is made with student success and well-being at the forefront.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Story Section */}
          <div className="mb-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Story</h2>
              <div className="prose prose-lg max-w-none text-gray-600">
                <p className="text-center mb-8">
                  PathPiper was born from the vision of creating a platform where students could safely explore educational opportunities, connect with like-minded peers, and receive guidance from mentors and institutions worldwide.
                </p>
                <p className="text-center mb-8">
                  Founded by educators and technologists who recognized the need for a safe, purpose-built social platform for students, PathPiper combines the engagement of social media with the structure and safety requirements of educational environments.
                </p>
                <p className="text-center">
                  Today, PathPiper serves thousands of students, educators, and institutions, facilitating meaningful connections and educational growth across the globe.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Join Our Community</h2>
            <p className="text-xl text-gray-600 mb-8">
              Be part of the global education revolution. Connect, learn, and grow with PathPiper.
            </p>
            <Button size="lg" className="bg-teal-500 hover:bg-teal-600">
              Get Started Today
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
