
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import Navbar from "@/components/navbar"
import InternalNavbar from "@/components/internal-navbar"
import InstitutionNavbar from "@/components/institution-navbar"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Eye, Users, Lock, AlertTriangle, Phone, Mail, MessageCircle, Heart, Star, CheckCircle } from "lucide-react"

export default function SafetyPage() {
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

  const safetyFeatures = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "AI-Powered Content Moderation",
      description: "Advanced algorithms designed specifically for educational environments detect and filter inappropriate content before it reaches users.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Human Safety Team",
      description: "Trained professionals monitor the platform 24/7, with expertise in child safety, education, and online behavior.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Reporting",
      description: "Easy-to-use reporting tools allow users to quickly flag concerning content or behavior for immediate review.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Privacy Protection",
      description: "Age-appropriate privacy settings, parental controls, and strict limits on personal information sharing.",
      color: "bg-orange-100 text-orange-600"
    }
  ];

  const safetyTips = [
    {
      category: "Personal Information",
      tips: [
        "Never share your full name, address, phone number, or school name publicly",
        "Keep your profile information general and education-focused",
        "Be cautious about sharing photos that could reveal your location",
        "Ask a parent or teacher before sharing any personal details"
      ]
    },
    {
      category: "Online Interactions",
      tips: [
        "Be kind and respectful to everyone you meet on PathPiper",
        "Report any message or content that makes you uncomfortable",
        "Don't arrange to meet online friends in person without adult supervision",
        "Remember that not everyone online is who they claim to be"
      ]
    },
    {
      category: "Content Sharing",
      tips: [
        "Only share educational content appropriate for a learning environment",
        "Always give credit when using someone else's work or ideas",
        "Think twice before posting - once online, content can be hard to remove",
        "Ask for help if you're unsure whether something is appropriate to share"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {renderNavbar()}
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Safety Center
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              PathPiper is designed with safety as our top priority. Learn about our safety features, get tips for staying safe online, and find resources to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Badge variant="secondary" className="px-3 py-1">
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                COPPA Compliant
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                24/7 Monitoring
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                Parent Approved
              </Badge>
            </div>
          </div>

          {/* Emergency Contact Card */}
          <Card className="mb-16 border-red-200 bg-red-50">
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-red-900 mb-3">Need Help Right Now?</h3>
                  <p className="text-red-800 mb-4">
                    If you're experiencing an emergency or immediate safety concern, contact us right away or call your local emergency services.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a 
                      href="tel:911"
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center flex items-center justify-center"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Emergency: 911
                    </a>
                    <a 
                      href="mailto:safety@pathpiper.com"
                      className="bg-red-100 hover:bg-red-200 text-red-800 px-6 py-3 rounded-lg font-medium transition-colors text-center flex items-center justify-center"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      safety@pathpiper.com
                    </a>
                    <a 
                      href="tel:+1-555-SAFE-NOW"
                      className="border border-red-600 text-red-700 hover:bg-red-100 px-6 py-3 rounded-lg font-medium transition-colors text-center flex items-center justify-center"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      +1 (555) SAFE-NOW
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              How We Keep You Safe
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {safetyFeatures.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-16 h-16 ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Safety Tips */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Safety Tips for Students
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {safetyTips.map((section, index) => (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <CardTitle className="text-xl text-center">{section.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start space-x-2">
                          <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* For Parents Section */}
          <Card className="mb-16 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">For Parents & Guardians</h2>
                  <p className="text-gray-600 mb-6">
                    PathPiper provides comprehensive parental controls and oversight tools to help you support your child's safe online learning experience.
                  </p>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Monitor your child's activity and connections
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Set privacy and communication preferences
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Receive safety alerts and updates
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Access detailed safety resources and guides
                    </li>
                  </ul>
                  <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                    Parent Dashboard
                  </Button>
                </div>
                <div className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Digital Citizenship Guide</h3>
                    <p className="text-sm text-gray-600">Help your child develop healthy online habits and digital literacy skills.</p>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Communication Tips</h3>
                    <p className="text-sm text-gray-600">Learn how to talk with your child about online safety and responsible internet use.</p>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Warning Signs</h3>
                    <p className="text-sm text-gray-600">Recognize potential signs of cyberbullying, inappropriate contact, or other concerns.</p>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reporting Tools */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Report Safety Concerns
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              If you see something concerning on PathPiper, please report it immediately. We take all reports seriously and investigate them promptly.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Inappropriate Content</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Report content that violates our community guidelines or seems inappropriate for an educational environment.
                  </p>
                  <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
                    Report Content
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Concerning Behavior</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Report users who are behaving inappropriately, bullying others, or making you feel uncomfortable.
                  </p>
                  <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                    Report User
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Safety Question</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Have a general safety question or concern? Our safety team is here to help and provide guidance.
                  </p>
                  <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                    Ask Question
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Resources */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-3xl text-center">Additional Safety Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">Mental Health</h3>
                  <p className="text-sm text-gray-600">Resources for emotional wellbeing and mental health support.</p>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">Cyberbullying</h3>
                  <p className="text-sm text-gray-600">Information about recognizing and responding to online bullying.</p>
                </div>
                <div className="text-center">
                  <Lock className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">Digital Privacy</h3>
                  <p className="text-sm text-gray-600">Learn about protecting your personal information online.</p>
                </div>
                <div className="text-center">
                  <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">Healthy Relationships</h3>
                  <p className="text-sm text-gray-600">Building positive, respectful relationships in digital spaces.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-teal-50 border-teal-200">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">We're Here to Help</h2>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Our safety team is available 24/7 to help with any concerns or questions about staying safe on PathPiper.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:safety@pathpiper.com"
                  className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Safety Team
                </a>
                <a 
                  href="/contact"
                  className="border border-teal-500 text-teal-600 hover:bg-teal-100 px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Support
                </a>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Available 24/7 • Response within 1 hour for urgent safety concerns
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
