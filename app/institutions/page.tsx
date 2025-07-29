
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { School, Users, MapPin, Star, ArrowRight, Building, Globe, Award, BookOpen } from "lucide-react"
import Footer from "@/components/footer"

export default function InstitutionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/images/pathpiper-logo.png"
                width={150}
                height={40}
                alt="PathPiper Logo"
                className="h-10 w-auto"
              />
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/feed" className="text-gray-600 hover:text-teal-600 transition-colors">
                Feed
              </Link>
              <Link href="/explore" className="text-gray-600 hover:text-teal-600 transition-colors">
                Explore
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-teal-600 transition-colors">
                Login
              </Link>
              <Link href="/signup">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Discover Your <span className="text-green-600">Perfect Institution</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Explore universities, colleges, and schools worldwide. Connect with admissions teams, 
              current students, and alumni to make informed decisions about your educational future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/explore">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                  Explore Institutions
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="px-8 py-3">
                  Create Institution Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Institution Types */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Find Institutions by Type
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From top-tier universities to specialized trade schools, discover institutions that match your goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <School className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Universities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Research universities offering undergraduate, graduate, and doctoral programs across all disciplines.
                </p>
                <Badge variant="secondary" className="text-xs">1,200+ Institutions</Badge>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Community Colleges</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Two-year institutions offering associate degrees, certificates, and transfer pathways.
                </p>
                <Badge variant="secondary" className="text-xs">800+ Institutions</Badge>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Trade Schools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Specialized institutions focusing on technical skills and career-specific training programs.
                </p>
                <Badge variant="secondary" className="text-xs">500+ Institutions</Badge>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle className="text-lg">High Schools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Secondary schools with strong academic programs, extracurriculars, and college preparation.
                </p>
                <Badge variant="secondary" className="text-xs">2,000+ Schools</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Institutions */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Institutions
            </h2>
            <p className="text-lg text-gray-600">
              Explore some of the top-rated institutions on our platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Featured Institution 1 */}
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">SU</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Stanford University</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      California, USA
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm ml-1">4.8</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">Research University</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Leading research university known for innovation in technology, medicine, and entrepreneurship.
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  <Badge variant="outline" className="text-xs">Engineering</Badge>
                  <Badge variant="outline" className="text-xs">Business</Badge>
                  <Badge variant="outline" className="text-xs">Medicine</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>17K Students</span>
                  <span>6:1 Ratio</span>
                </div>
              </CardContent>
            </Card>

            {/* Featured Institution 2 */}
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">MIT</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">MIT</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      Massachusetts, USA
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm ml-1">4.9</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">Tech Institute</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  World-renowned institute leading in science, technology, engineering, and innovation.
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  <Badge variant="outline" className="text-xs">Engineering</Badge>
                  <Badge variant="outline" className="text-xs">Computer Science</Badge>
                  <Badge variant="outline" className="text-xs">Physics</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>11K Students</span>
                  <span>3:1 Ratio</span>
                </div>
              </CardContent>
            </Card>

            {/* Featured Institution 3 */}
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">HU</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Harvard University</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      Massachusetts, USA
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm ml-1">4.7</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">Ivy League</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Historic institution excelling in liberal arts, law, medicine, and business education.
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  <Badge variant="outline" className="text-xs">Liberal Arts</Badge>
                  <Badge variant="outline" className="text-xs">Law</Badge>
                  <Badge variant="outline" className="text-xs">Business</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>23K Students</span>
                  <span>7:1 Ratio</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features for Institutions */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Connect with Future Students
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Showcase your institution's unique strengths and connect with prospective students worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Student Recruitment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Reach talented students actively searching for educational opportunities in their field of interest.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Global Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Showcase your programs, facilities, and achievements to an international audience of students.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Alumni Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect current students with successful alumni for mentorship and career guidance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Find Your Perfect Match
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Use our advanced search and filtering tools to find institutions that align with your goals
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                <p className="text-sm text-gray-600">
                  Search by country, state, city, or proximity to you
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Programs</h3>
                <p className="text-sm text-gray-600">
                  Filter by major, degree level, and specializations
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Size & Culture</h3>
                <p className="text-sm text-gray-600">
                  Find institutions that match your preferred environment
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Rankings</h3>
                <p className="text-sm text-gray-600">
                  Sort by academic rankings, student satisfaction, and outcomes
                </p>
              </div>
            </div>

            <Link href="/explore">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                Start Your Search
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Your Educational Journey Starts Here
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Connect with institutions that will shape your future and help you achieve your dreams
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3">
                Join as Student
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-3">
                Register Institution
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
