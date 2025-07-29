
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, Target, BookOpen, Star, ArrowRight } from "lucide-react"
import Footer from "@/components/footer"

export default function StudentProfilesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
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
              Showcase Your <span className="text-teal-600">Academic Journey</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Create a comprehensive digital portfolio that highlights your achievements, skills, and aspirations. 
              Connect with peers, mentors, and institutions worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3">
                  Create Your Profile
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="px-8 py-3">
                  Explore Profiles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Build Your Digital Academic Identity
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your profile is more than just a resume - it's your story, your journey, and your potential.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Showcase your academic accomplishments, awards, and milestones with rich media and detailed descriptions.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Skills & Abilities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Map your skills across subjects, display proficiency levels, and track your learning progress over time.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Goals & Aspirations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Set academic and career goals, track progress, and get personalized recommendations for achieving them.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle className="text-lg">Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Build meaningful connections with peers, mentors, and institutions in your field of interest.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Profile Examples */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See Student Profiles in Action
            </h2>
            <p className="text-lg text-gray-600">
              Real examples of how students showcase their academic journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Example Profile 1 */}
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">AS</span>
                </div>
                <CardTitle>Alex Science</CardTitle>
                <p className="text-sm text-gray-600">Grade 11 • STEM Focus</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Chemistry Champion
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Research Project
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Winner of Regional Science Fair with innovative water purification research. Aspiring chemical engineer.
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">15 Skills</span>
                    <span className="text-gray-500">3 Awards</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Example Profile 2 */}
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">MA</span>
                </div>
                <CardTitle>Maya Arts</CardTitle>
                <p className="text-sm text-gray-600">Grade 12 • Creative Arts</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Digital Artist
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Portfolio Ready
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Published digital artist with gallery exhibitions. Accepted to top art schools with scholarship offers.
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">12 Skills</span>
                    <span className="text-gray-500">5 Exhibitions</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Example Profile 3 */}
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">JT</span>
                </div>
                <CardTitle>Jordan Tech</CardTitle>
                <p className="text-sm text-gray-600">Grade 10 • Computer Science</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      App Developer
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Coding Club Lead
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Built 3 mobile apps with 10K+ downloads. Leading school coding club and mentoring younger students.
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">18 Skills</span>
                    <span className="text-gray-500">3 Projects</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Safety & Privacy */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Safe, Secure, and Parent-Approved
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              We prioritize student safety with robust privacy controls, content moderation, 
              and parent oversight features. Your academic journey is protected at every step.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Privacy First</h3>
                <p className="text-sm text-gray-600">
                  Control who sees your profile and personal information with granular privacy settings.
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Content Moderation</h3>
                <p className="text-sm text-gray-600">
                  AI-powered content screening ensures a safe, educational environment for all students.
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Parent Dashboard</h3>
                <p className="text-sm text-gray-600">
                  Parents can monitor activity and approve connections while respecting student independence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Build Your Academic Profile?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students already showcasing their potential on PathPiper
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-3">
              Start Building Your Profile
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
