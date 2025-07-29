
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, MessageCircle, Calendar, BookOpen, Star, ArrowRight, Heart, Shield } from "lucide-react"
import Footer from "@/components/footer"

export default function MentorshipPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
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
              Connect with <span className="text-purple-600">Inspiring Mentors</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Find experienced mentors who can guide your academic journey, share industry insights, 
              and help you achieve your career aspirations. Every great success story starts with great guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
                  Find a Mentor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/mentor-onboarding">
                <Button size="lg" variant="outline" className="px-8 py-3">
                  Become a Mentor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How PathPiper Mentorship Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to find, connect with, and learn from experienced professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">1. Browse & Match</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Explore mentor profiles filtered by expertise, industry, and interests. 
                  Our AI suggests the best matches based on your goals.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">2. Connect & Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Send connection requests and start conversations. Share your goals, 
                  ask questions, and build meaningful relationships.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">3. Schedule & Grow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Book mentoring sessions, set learning goals, and track your progress. 
                  Get guidance that accelerates your academic and career growth.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mentor Types */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Find Mentors Across Every Field
            </h2>
            <p className="text-lg text-gray-600">
              Connect with professionals from diverse industries and academic backgrounds
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">STEM & Research</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">Computer Science</Badge>
                  <Badge variant="secondary" className="text-xs">Engineering</Badge>
                  <Badge variant="secondary" className="text-xs">Medicine</Badge>
                  <Badge variant="secondary" className="text-xs">Research</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Arts & Creative</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">Design</Badge>
                  <Badge variant="secondary" className="text-xs">Music</Badge>
                  <Badge variant="secondary" className="text-xs">Writing</Badge>
                  <Badge variant="secondary" className="text-xs">Film</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-lg">Business & Finance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">Entrepreneurship</Badge>
                  <Badge variant="secondary" className="text-xs">Marketing</Badge>
                  <Badge variant="secondary" className="text-xs">Finance</Badge>
                  <Badge variant="secondary" className="text-xs">Consulting</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Social Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">Non-Profit</Badge>
                  <Badge variant="secondary" className="text-xs">Education</Badge>
                  <Badge variant="secondary" className="text-xs">Policy</Badge>
                  <Badge variant="secondary" className="text-xs">Advocacy</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Real Impact, Real Stories
            </h2>
            <p className="text-lg text-gray-600">
              See how mentorship has transformed students' academic and career journeys
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">SR</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Sarah R.</h3>
                    <p className="text-sm text-gray-600">High School Senior</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  "My mentor helped me navigate college applications and scholarships. 
                  I got accepted to my dream engineering program with a full scholarship!"
                </p>
                <div className="flex items-center text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">MK</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Marcus K.</h3>
                    <p className="text-sm text-gray-600">College Freshman</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  "Through mentorship, I discovered my passion for data science and 
                  landed my first internship at a tech startup in my freshman year."
                </p>
                <div className="flex items-center text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AH</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Aisha H.</h3>
                    <p className="text-sm text-gray-600">Graduate Student</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  "My mentor's guidance helped me publish my first research paper and 
                  secure funding for my PhD studies. Mentorship changed my life!"
                </p>
                <div className="flex items-center text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Mentors */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Share Your Expertise, Shape the Future
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join our community of mentors and help the next generation achieve their dreams. 
              Make a lasting impact while building meaningful connections.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-left mb-8">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Flexible Commitment</h3>
                <p className="text-sm opacity-90">
                  Choose your availability and mentoring style. 
                  Whether it's weekly sessions or occasional guidance.
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-2">Meaningful Impact</h3>
                <p className="text-sm opacity-90">
                  See direct results as you help students achieve academic 
                  and career milestones.
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-2">Professional Growth</h3>
                <p className="text-sm opacity-90">
                  Develop leadership skills, expand your network, 
                  and give back to your industry.
                </p>
              </div>
            </div>
            <Link href="/mentor-onboarding">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3">
                Become a Mentor
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Safe & Secure Mentoring Environment
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              We prioritize safety with comprehensive verification, monitoring, and support systems.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Verified Mentors</h3>
                <p className="text-sm text-gray-600">
                  All mentors undergo background verification and credential validation.
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Moderated Interactions</h3>
                <p className="text-sm text-gray-600">
                  AI monitoring and human oversight ensure appropriate communication.
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Parent Visibility</h3>
                <p className="text-sm text-gray-600">
                  Parents can monitor mentoring activities and approve connections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
