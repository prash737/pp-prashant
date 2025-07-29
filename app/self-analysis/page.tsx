
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Target, TrendingUp, Lightbulb, ArrowRight, BarChart3, Users, BookOpen, Star } from "lucide-react"
import Footer from "@/components/footer"

export default function SelfAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
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
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Discover Your <span className="text-indigo-600">True Potential</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Unlock insights about your learning style, strengths, interests, and career compatibility 
              with our AI-powered self-analysis tools. Make informed decisions about your academic and career path.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/student/self-analysis">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3">
                  Start Your Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="px-8 py-3">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Analysis Types */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Self-Discovery Tools
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered analysis tools help you understand yourself better and make informed decisions about your future.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Learning Style</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Discover how you learn best - visual, auditory, kinesthetic, or reading/writing preferences.
                </p>
                <Badge variant="secondary" className="text-xs">15-minute assessment</Badge>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Strengths & Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Identify your natural talents and areas where you excel academically and personally.
                </p>
                <Badge variant="secondary" className="text-xs">20-minute assessment</Badge>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Interest Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Explore your passions and interests to find academic subjects and careers that excite you.
                </p>
                <Badge variant="secondary" className="text-xs">25-minute assessment</Badge>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle className="text-lg">Career Compatibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Match your profile with career paths and see which professions align with your strengths.
                </p>
                <Badge variant="secondary" className="text-xs">30-minute assessment</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Self-Analysis Works
            </h2>
            <p className="text-lg text-gray-600">
              Our scientifically-backed process combines psychology, data science, and AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">1. Interactive Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Complete engaging questionnaires, scenario-based questions, and interactive exercises 
                  designed by educational psychologists.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">2. AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our AI analyzes your responses using proven psychological frameworks and 
                  compares them with successful academic and career patterns.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">3. Personalized Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Receive detailed reports with actionable insights, recommended learning strategies, 
                  and suggested academic and career paths.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Results */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Personalized Profile
            </h2>
            <p className="text-lg text-gray-600">
              See what your comprehensive analysis report looks like
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Sample Student Profile: Alex Chen</CardTitle>
                <p className="text-gray-600">Grade 11 • STEM-focused • Visual Learner</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-3">Top Strengths</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Logical Reasoning</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full w-[90%]"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Mathematical Ability</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full w-[85%]"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pattern Recognition</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full w-[88%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Career Matches</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm">Software Engineer</span>
                        <Badge variant="secondary" className="text-xs">95% match</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm">Data Scientist</span>
                        <Badge variant="secondary" className="text-xs">92% match</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                        <span className="text-sm">Research Scientist</span>
                        <Badge variant="secondary" className="text-xs">88% match</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Learning Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 font-bold text-lg">V</span>
                    </div>
                    <p className="font-medium">Visual Learner</p>
                    <p className="text-sm text-gray-600 mt-2">
                      You learn best through diagrams, charts, and visual representations.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personality Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-600 font-bold text-sm">INTJ</span>
                    </div>
                    <p className="font-medium">The Architect</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Strategic thinker with a natural drive for implementing ideas.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interest Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className="w-full justify-center">Technology</Badge>
                    <Badge variant="secondary" className="w-full justify-center">Science</Badge>
                    <Badge variant="outline" className="w-full justify-center">Innovation</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Student Success Stories
            </h2>
            <p className="text-lg text-gray-600">
              See how self-analysis helped students make better decisions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">SM</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Sarah M.</h3>
                    <p className="text-sm text-gray-600">Discovered her true calling</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  "The self-analysis revealed I'm actually more suited for design than engineering. 
                  I changed my major and I've never been happier!"
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
                    <span className="text-white text-sm font-bold">DL</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">David L.</h3>
                    <p className="text-sm text-gray-600">Improved study strategy</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  "Learning my learning style helped me study more effectively. 
                  My grades improved by a full letter grade!"
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
                    <span className="text-white text-sm font-bold">MR</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Maya R.</h3>
                    <p className="text-sm text-gray-600">Found her career path</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  "The career compatibility analysis opened my eyes to opportunities 
                  I never considered. Now I'm pursuing data science!"
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

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Discover Your Potential?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start your self-analysis journey today and unlock insights that will guide your academic and career decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/student/self-analysis">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3">
                Start Free Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-3">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
